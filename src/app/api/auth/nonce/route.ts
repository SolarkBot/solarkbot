import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { storeNonce } from "@/lib/redis";

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

  await storeNonce(walletAddress, nonce);

  return NextResponse.json({ nonce });
}
