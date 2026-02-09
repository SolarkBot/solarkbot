import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { getWalletBalance } from "@/lib/solana/balance";

/**
 * GET /api/wallet/balance?address=xxx
 * Get SOL and SPL token balances for a wallet. Requires authenticated session.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.name) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const address =
      request.nextUrl.searchParams.get("address") || session.user.name;

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
