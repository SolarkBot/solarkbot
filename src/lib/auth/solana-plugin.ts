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
import { getExpectedAuthHost } from "./config";
import {
  getNonceCookieOptions,
  readNonceCookieValue,
  SIWS_NONCE_COOKIE_NAME,
} from "./nonce";

const solanaSignInBodySchema = z.object({
  message: z.string().min(1),
  signature: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

function getWalletEmail(walletAddress: string) {
  return `${walletAddress}@wallet.solarkbot.local`;
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
          if (messageDomain !== getExpectedAuthHost()) {
            throw APIError.from("UNAUTHORIZED", {
              code: "SOLANA_DOMAIN_MISMATCH",
              message: "Sign-in domain mismatch.",
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

          const now = new Date();
          const email = getWalletEmail(walletAddress);
          const user = await prisma.user.upsert({
            where: { walletAddress },
            update: {
              email,
              name: walletAddress,
              emailVerified: true,
              image: null,
              lastLoginAt: now,
            },
            create: {
              walletAddress,
              email,
              name: walletAddress,
              emailVerified: true,
              image: null,
              lastLoginAt: now,
            },
          });

          await prisma.account.upsert({
            where: {
              providerId_accountId: {
                providerId: "solana",
                accountId: walletAddress,
              },
            },
            update: {
              userId: user.id,
              updatedAt: now,
            },
            create: {
              userId: user.id,
              providerId: "solana",
              accountId: walletAddress,
            },
          });

          const session = await ctx.context.internalAdapter.createSession(
            user.id,
            rememberMe === false
          );
          if (!session) {
            throw APIError.from("INTERNAL_SERVER_ERROR", {
              code: "SESSION_CREATION_FAILED",
              message: "Unable to create a Better Auth session.",
            });
          }

          ctx.context.setNewSession({
            session,
            user,
          });

          await setSessionCookie(
            ctx,
            {
              session,
              user,
            },
            rememberMe === false
          );

          return ctx.json({
            token: session.token,
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
