import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { APIError, createAuthEndpoint } from "better-auth/api";
import { type BetterAuthPlugin } from "better-auth";
import { setSessionCookie } from "better-auth/cookies";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { consumeNonce } from "../redis";
import {
  extractDomain,
  extractNonce,
  extractWalletAddress,
  verifySIWSSignature,
} from "../solana/wallet-auth";
import { getRequestAwareExpectedAuthHost } from "./config";
import {
  getNonceCookieOptions,
  readNonceCookieValue,
  SIWS_NONCE_COOKIE_NAME,
} from "./nonce";
import {
  createFallbackSessionCookieValue,
  FALLBACK_SESSION_COOKIE_NAME,
  getFallbackSessionCookieOptions,
  readFallbackSessionCookie,
  shouldUseSecureAuthCookies,
} from "./fallback-session";

const solanaSignInBodySchema = z.object({
  message: z.string().min(1),
  signature: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

function getWalletEmail(walletAddress: string) {
  return `${walletAddress}@wallet.solarkbot.local`;
}

function isPrismaUniqueError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function getDatabaseHost() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return null;
  }

  try {
    return new URL(databaseUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function getPersistenceFailureMessage(error: unknown) {
  const databaseHost = getDatabaseHost();
  const isProductionDeployment =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  const isLocalDatabase =
    databaseHost === "localhost" ||
    databaseHost === "127.0.0.1" ||
    databaseHost === "::1";

  if (isProductionDeployment && isLocalDatabase) {
    return "Production database is set to localhost. Update Vercel DATABASE_URL to a hosted Postgres URL.";
  }

  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P1001")
  ) {
    return "Database is unreachable. Check your Vercel DATABASE_URL and REDIS_URL settings.";
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  ) {
    return "Auth tables are missing in production. Sync Prisma to your hosted database, then redeploy.";
  }

  return "Authentication storage is not ready yet. Please try again in a moment.";
}

async function findOrCreateWalletUser(walletAddress: string) {
  const now = new Date();
  const email = getWalletEmail(walletAddress);
  const existingUser = await prisma.user.findFirst({
    where: { walletAddress },
  });

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data: {
        email,
        name: walletAddress,
        emailVerified: true,
        image: null,
        lastLoginAt: now,
      },
    });
  }

  try {
    return await prisma.user.create({
      data: {
        walletAddress,
        email,
        name: walletAddress,
        emailVerified: true,
        image: null,
        lastLoginAt: now,
      },
    });
  } catch (error) {
    if (!isPrismaUniqueError(error)) {
      throw error;
    }

    const user = await prisma.user.findFirst({
      where: { walletAddress },
    });
    if (!user) {
      throw error;
    }

    return prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        name: walletAddress,
        emailVerified: true,
        image: null,
        lastLoginAt: now,
      },
    });
  }
}

async function upsertWalletAccount(userId: string, walletAddress: string) {
  const now = new Date();
  const existingAccount = await prisma.account.findFirst({
    where: {
      providerId: "solana",
      accountId: walletAddress,
    },
  });

  if (existingAccount) {
    return prisma.account.update({
      where: { id: existingAccount.id },
      data: {
        userId,
        updatedAt: now,
      },
    });
  }

  try {
    return await prisma.account.create({
      data: {
        userId,
        providerId: "solana",
        accountId: walletAddress,
      },
    });
  } catch (error) {
    if (!isPrismaUniqueError(error)) {
      throw error;
    }

    const account = await prisma.account.findFirst({
      where: {
        providerId: "solana",
        accountId: walletAddress,
      },
    });
    if (!account) {
      throw error;
    }

    return prisma.account.update({
      where: { id: account.id },
      data: {
        userId,
        updatedAt: now,
      },
    });
  }
}

function getSessionExpiryDate(rememberMe?: boolean) {
  const durationMs = rememberMe === false
    ? 1000 * 60 * 60 * 24
    : 1000 * 60 * 60 * 24 * 30;

  return new Date(Date.now() + durationMs);
}

function createFallbackAuthResult(walletAddress: string, rememberMe?: boolean) {
  const cookieValue = createFallbackSessionCookieValue(walletAddress, rememberMe);
  const parsed = readFallbackSessionCookie(cookieValue);

  if (!parsed) {
    throw new Error("Failed to create fallback session payload.");
  }

  return {
    cookieValue,
    session: parsed.session,
    user: parsed.user,
  };
}

async function createWalletSession(
  ctx: any,
  userId: string,
  rememberMe?: boolean
) {
  try {
    const session = await ctx.context.internalAdapter.createSession(
      userId,
      rememberMe === false
    );

    if (session) {
      return session;
    }
  } catch (error) {
    console.error("Better Auth internal session creation failed, using Prisma fallback:", error);
  }

  return prisma.session.create({
    data: {
      userId,
      token: crypto.randomBytes(32).toString("base64url"),
      expiresAt: getSessionExpiryDate(rememberMe),
      ipAddress: ctx.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: ctx.headers?.get("user-agent") ?? null,
    },
  });
}

export function solanaAuth(): BetterAuthPlugin {
  return {
    id: "solana-auth",
    endpoints: {
      signInSolana: createAuthEndpoint(
        "/solana/sign-in",
        {
          method: "POST",
          body: solanaSignInBodySchema,
        },
        async (ctx) => {
          const { message, signature, rememberMe } = ctx.body;

          const walletAddress = extractWalletAddress(message);
          if (!walletAddress) {
            throw APIError.from("UNAUTHORIZED", {
              code: "INVALID_SOLANA_SIGN_IN",
              message: "Invalid Solana sign-in payload.",
            });
          }

          const messageDomain = extractDomain(message);
          const expectedHost = getRequestAwareExpectedAuthHost(ctx.headers);
          if (messageDomain !== expectedHost) {
            throw APIError.from("UNAUTHORIZED", {
              code: "SOLANA_DOMAIN_MISMATCH",
              message: `Sign-in domain mismatch. Expected ${expectedHost}.`,
            });
          }

          const messageNonce = extractNonce(message);
          if (!messageNonce) {
            throw APIError.from("UNAUTHORIZED", {
              code: "MISSING_SOLANA_NONCE",
              message: "Missing Solana sign-in nonce.",
            });
          }

          let storedNonce: string | null = null;
          try {
            storedNonce = await consumeNonce(walletAddress);
          } catch (error) {
            console.error("Failed to consume SIWS nonce from Redis, trying cookie fallback:", error);
          }

          const cookieNonce = readNonceCookieValue(
            ctx.getCookie(SIWS_NONCE_COOKIE_NAME),
            walletAddress
          );

          if (
            (!storedNonce || storedNonce !== messageNonce) &&
            cookieNonce?.nonce !== messageNonce
          ) {
            throw APIError.from("UNAUTHORIZED", {
              code: "EXPIRED_SOLANA_NONCE",
              message: "The Solana sign-in request has expired.",
            });
          }

          ctx.setCookie(SIWS_NONCE_COOKIE_NAME, "", {
            ...getNonceCookieOptions(true),
            maxAge: 0,
          });
          ctx.setCookie(SIWS_NONCE_COOKIE_NAME, "", {
            ...getNonceCookieOptions(false),
            maxAge: 0,
          });

          const isValidSignature = verifySIWSSignature(
            message,
            signature,
            walletAddress
          );
          if (!isValidSignature) {
            throw APIError.from("UNAUTHORIZED", {
              code: "INVALID_SOLANA_SIGNATURE",
              message: "Invalid Solana wallet signature.",
            });
          }

          const secureAuthCookies = shouldUseSecureAuthCookies(ctx.headers);
          const fallbackAuth = createFallbackAuthResult(walletAddress, rememberMe);

          let user: any = fallbackAuth.user;
          let session: any = fallbackAuth.session;
          let persistenceWarning: string | null = null;

          try {
            const persistedUser = await findOrCreateWalletUser(walletAddress);
            await upsertWalletAccount(persistedUser.id, walletAddress);
            const persistedSession = await createWalletSession(
              ctx,
              persistedUser.id,
              rememberMe
            );

            if (!persistedSession) {
              throw new Error("Unable to create a Better Auth session.");
            }

            user = persistedUser;
            session = persistedSession;

            ctx.context.setNewSession({
              session,
              user,
            });

            try {
              await setSessionCookie(
                ctx,
                {
                  session,
                  user,
                },
                rememberMe === false
              );
            } catch (error) {
              console.error("Failed to set Better Auth session cookie, using fallback session cookie:", error);
              user = fallbackAuth.user;
              session = fallbackAuth.session;
              persistenceWarning = getPersistenceFailureMessage(error);
            }
          } catch (error) {
            console.error("Solana sign-in persistence failed:", error);
            user = fallbackAuth.user;
            session = fallbackAuth.session;
            persistenceWarning = getPersistenceFailureMessage(error);
          }

          if (!session) {
            throw APIError.from("INTERNAL_SERVER_ERROR", {
              code: "SESSION_CREATION_FAILED",
              message: "Unable to create a Better Auth session.",
            });
          }

          ctx.setCookie(FALLBACK_SESSION_COOKIE_NAME, fallbackAuth.cookieValue, {
            ...getFallbackSessionCookieOptions(secureAuthCookies, rememberMe),
          });

          return ctx.json({
            token: session.token,
            warning: persistenceWarning ?? undefined,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              emailVerified: user.emailVerified,
              image: user.image,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            },
          });
        }
      ),
    },
  };
}
