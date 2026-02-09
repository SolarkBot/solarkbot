import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPayment } from "@/lib/x402/facilitator";

const verifySchema = z.object({
  payment: z.string().min(1, "Payment header is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const result = await verifyPayment(parsed.data.payment);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          data: { valid: false, details: { error: result.error } },
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        details: {
          amount: result.amount,
          payer: result.payer,
        },
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
