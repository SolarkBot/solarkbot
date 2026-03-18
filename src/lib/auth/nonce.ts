import crypto from "crypto";
import { getAuthSecret } from "./config";

export const SIWS_NONCE_COOKIE_NAME = "solarkbot-siws-nonce";
const SIWS_NONCE_TTL_SECONDS = 60 * 5;

interface NonceCookiePayload {
  walletAddress: string;
  nonce: string;
  expiresAt: number;
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signNoncePayload(payload: string) {
  return crypto
    .createHmac("sha256", getAuthSecret())
    .update(payload)
    .digest("base64url");
}

export function createNonceCookieValue(walletAddress: string, nonce: string) {
  const payload: NonceCookiePayload = {
    walletAddress,
    nonce,
    expiresAt: Date.now() + SIWS_NONCE_TTL_SECONDS * 1000,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signNoncePayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function readNonceCookieValue(
  cookieValue: string | null | undefined,
  walletAddress: string
) {
  if (!cookieValue) {
    return null;
  }

  const [encodedPayload, signature] = cookieValue.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signNoncePayload(encodedPayload);
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
    ) as NonceCookiePayload;

    if (
      payload.walletAddress !== walletAddress ||
      payload.expiresAt < Date.now() ||
      !payload.nonce
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getNonceCookieOptions(isSecure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isSecure,
    path: "/",
    maxAge: SIWS_NONCE_TTL_SECONDS,
  };
}
