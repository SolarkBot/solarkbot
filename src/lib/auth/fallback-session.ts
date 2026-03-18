import crypto from "crypto";
import { getAuthSecret } from "./config";

export const FALLBACK_SESSION_COOKIE_NAME = "solarkbot-fallback-session";
const SHORT_SESSION_SECONDS = 60 * 60 * 24;
const LONG_SESSION_SECONDS = 60 * 60 * 24 * 30;

interface FallbackSessionPayload {
  walletAddress: string;
  token: string;
  issuedAt: number;
  expiresAt: number;
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(encodedPayload: string) {
  return crypto
    .createHmac("sha256", getAuthSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function getSessionLifetimeSeconds(rememberMe?: boolean) {
  return rememberMe === false ? SHORT_SESSION_SECONDS : LONG_SESSION_SECONDS;
}

export function shouldUseSecureAuthCookies(headers?: Headers) {
  const forwardedProto = headers?.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto === "https";
  }

  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

export function createFallbackSessionCookieValue(
  walletAddress: string,
  rememberMe?: boolean
) {
  const now = Date.now();
  const payload: FallbackSessionPayload = {
    walletAddress,
    token: crypto.randomBytes(24).toString("base64url"),
    issuedAt: now,
    expiresAt: now + getSessionLifetimeSeconds(rememberMe) * 1000,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function readFallbackSessionCookie(
  cookieValue: string | null | undefined
) {
  if (!cookieValue) {
    return null;
  }

  const [encodedPayload, signature] = cookieValue.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  const providedSignature = Buffer.from(signature, "utf8");
  const expectedSignatureBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    providedSignature.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(providedSignature, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      fromBase64Url(encodedPayload)
    ) as FallbackSessionPayload;

    if (
      !payload.walletAddress ||
      !payload.token ||
      !payload.expiresAt ||
      payload.expiresAt < Date.now()
    ) {
      return null;
    }

    const createdAt = new Date(payload.issuedAt);
    const expiresAt = new Date(payload.expiresAt);

    return {
      session: {
        id: `fallback:${payload.walletAddress}`,
        token: payload.token,
        createdAt,
        updatedAt: createdAt,
        expiresAt,
        ipAddress: null,
        userAgent: null,
        userId: payload.walletAddress,
      },
      user: {
        id: payload.walletAddress,
        name: payload.walletAddress,
        email: `${payload.walletAddress}@wallet.solarkbot.local`,
        emailVerified: true,
        image: null,
        createdAt,
        updatedAt: createdAt,
      },
    };
  } catch {
    return null;
  }
}

export function getFallbackSessionCookieOptions(
  isSecure: boolean,
  rememberMe?: boolean
) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isSecure,
    path: "/",
    maxAge: getSessionLifetimeSeconds(rememberMe),
  };
}

export function parseCookieHeader(cookieHeader: string | null | undefined) {
  const parsed = new Map<string, string>();

  if (!cookieHeader) {
    return parsed;
  }

  for (const segment of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = segment.trim().split("=");
    if (!rawName || rawValueParts.length === 0) {
      continue;
    }

    parsed.set(rawName, rawValueParts.join("="));
  }

  return parsed;
}
