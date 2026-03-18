import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { storeNonce } from "@/lib/redis";
import {
  createNonceCookieValue,
  getNonceCookieOptions,
  SIWS_NONCE_COOKIE_NAME,
} from "@/lib/auth/nonce";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get("walletAddress");

  if (!walletAddress) {
    return NextResponse.json(
      { error: "walletAddress query parameter is required" },
      { status: 400 }
    );
  }

  // Basic validation: Solana addresses are base58-encoded, 32-44 chars
  if (walletAddress.length < 32 || walletAddress.length > 44) {
    return NextResponse.json(
      { error: "Invalid wallet address" },
      { status: 400 }
    );
  }

  const nonce = crypto.randomBytes(32).toString("hex");
  try {
    await storeNonce(walletAddress, nonce);
  } catch (error) {
    console.error("Failed to persist SIWS nonce in Redis, using cookie fallback:", error);
  }

  const response = NextResponse.json({ nonce });
  response.cookies.set(
    SIWS_NONCE_COOKIE_NAME,
    createNonceCookieValue(walletAddress, nonce),
    getNonceCookieOptions(request.nextUrl.protocol === "https:")
  );

  return response;
}
