import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/auth-options";
import { prepareTokenTransfer, prepareSolTransfer } from "@/lib/solana/transfer";

const transferRequestSchema = z.object({
  recipientAddress: z.string().min(32).max(44),
  tokenMint: z.string().min(1),
  amount: z.number().positive(),
});

/**
 * POST /api/wallet/transfer
 * Prepare a token transfer transaction. Requires authenticated session.
 * Returns a serialized transaction for the user to sign client-side.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.name) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const senderAddress = session.user.name;

    const body = await request.json();
    const parsed = transferRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { recipientAddress, tokenMint, amount } = parsed.data;

    // Prevent self-transfers
    if (senderAddress === recipientAddress) {
      return NextResponse.json(
        { success: false, error: "Cannot transfer to yourself" },
        { status: 400 }
      );
    }

    let result;
    if (tokenMint === "SOL" || tokenMint === "So11111111111111111111111111111111") {
      result = await prepareSolTransfer(senderAddress, recipientAddress, amount);
    } else {
      result = await prepareTokenTransfer(
        senderAddress,
        recipientAddress,
        tokenMint,
        amount
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Wallet transfer API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to prepare transfer" },
      { status: 500 }
    );
  }
}
