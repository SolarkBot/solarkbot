import { NextRequest, NextResponse } from "next/server";
import { getSessionWalletAddress } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/redis";
import { getWalletBalance } from "@/lib/solana/balance";

export const dynamic = "force-dynamic";

/**
 * GET /api/wallet/balance?address=xxx
 * Get SOL and SPL token balances for a wallet. Requires authenticated session.
 */
export async function GET(request: NextRequest) {
  try {
    const walletAddress = await getSessionWalletAddress(request);
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const rateLimitAllowed = await checkRateLimit(walletAddress, 60, 60);
    if (!rateLimitAllowed) {
      return NextResponse.json(
        { success: false, error: "Too many balance requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const address = request.nextUrl.searchParams.get("address") || walletAddress;

    // Basic Solana address validation
    if (address.length < 32 || address.length > 44) {
      return NextResponse.json(
        { success: false, error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const balance = await getWalletBalance(address);

    return NextResponse.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error("Wallet balance API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wallet balance" },
      { status: 500 }
    );
  }
}
