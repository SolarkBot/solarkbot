import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { settlePayment } from "@/lib/x402/facilitator";
import { generateReceipt, encodeReceipt } from "@/lib/x402/receipt";

export const dynamic = "force-dynamic";

const settleSchema = z.object({
  payment: z.string().min(1, "Payment header is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = settleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid payment payload" },
        { status: 400 }
      );
    }

    const result = await settlePayment(parsed.data.payment);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    const receipt = generateReceipt(
      result.transactionSig!,
      result.amount!,
      result.payer!,
      Date.now()
    );
    const encodedReceipt = encodeReceipt(receipt);

    return NextResponse.json({
      success: true,
      data: {
        transactionSig: result.transactionSig,
        receipt: encodedReceipt,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
