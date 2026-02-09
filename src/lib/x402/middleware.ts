import { NextRequest, NextResponse } from "next/server";
import { verifyPayment, settlePayment } from "./facilitator";
import { createPaymentRequiredResponse } from "./payment-required";
import { generateReceipt, encodeReceipt } from "./receipt";
import { checkFreeMessages, incrementFreeMessages } from "@/lib/redis";
import { prisma } from "@/lib/db/prisma";

export interface X402Options {
  priceUsdc: number;
  description: string;
}

type RouteHandler = (
  req: NextRequest,
  context?: unknown
) => Promise<NextResponse> | NextResponse;

/**
 * Wrap a Next.js route handler with x402 micropayment logic.
 *
 * Flow:
 *  1. If X-PAYMENT header present -> verify, settle, store, pass through
 *  2. If no header -> check free tier messages
 *     a. If free tier available -> pass through and increment counter
 *     b. If free tier exhausted -> return 402 Payment Required
 */
export function withX402(handler: RouteHandler, options: X402Options): RouteHandler {
  return async (req: NextRequest, context?: unknown) => {
    const paymentHeader = req.headers.get("X-PAYMENT");
    const walletAddress = req.headers.get("X-WALLET-ADDRESS") || "anonymous";
    const resource = new URL(req.url).pathname;

    // --- Path A: payment provided ---
    if (paymentHeader) {
      // Verify the payment
      const verification = await verifyPayment(paymentHeader);
      if (!verification.success) {
        return NextResponse.json(
          { success: false, error: `Payment verification failed: ${verification.error}` },
          { status: 402 }
        );
      }

      // Settle the payment on-chain
      const settlement = await settlePayment(paymentHeader);
      if (!settlement.success) {
        return NextResponse.json(
          { success: false, error: `Payment settlement failed: ${settlement.error}` },
          { status: 402 }
        );
      }

      // Store payment record in DB
      try {
        await prisma.payment.create({
          data: {
            userId: await resolveUserId(walletAddress),
            amountUsdc: settlement.amount!,
            transactionSig: settlement.transactionSig!,
            endpoint: resource,
            status: "confirmed",
            confirmedAt: new Date(),
          },
        });
      } catch (dbErr) {
        // Log but don't fail the request — payment was already settled
        console.error("Failed to store payment record:", dbErr);
      }

      // Build receipt
      const receipt = generateReceipt(
        settlement.transactionSig!,
        settlement.amount!,
        settlement.payer!,
        Date.now()
      );
      const encodedReceipt = encodeReceipt(receipt);

      // Call the actual handler
      const response = await handler(req, context);

      // Attach receipt header to response
      response.headers.set("X-PAYMENT-RECEIPT", encodedReceipt);
      response.headers.set("X-PAYMENT-TX", settlement.transactionSig!);

      return response;
    }

    // --- Path B: no payment header — check free tier ---
    if (walletAddress !== "anonymous") {
      const { allowed } = await checkFreeMessages(walletAddress);

      if (allowed) {
        // Increment free counter and pass through
        await incrementFreeMessages(walletAddress);
        return handler(req, context);
      }
    }

    // --- Free tier exhausted or anonymous user: return 402 ---
    return createPaymentRequiredResponse({
      priceUsdc: options.priceUsdc,
      resource,
      description: options.description,
    });
  };
}

/**
 * Resolve (or create) a userId from a wallet address.
 */
async function resolveUserId(walletAddress: string): Promise<string> {
  if (walletAddress === "anonymous") {
    // Create a temporary user record for anonymous payments
    const user = await prisma.user.create({
      data: { walletAddress: `anon_${Date.now()}_${Math.random().toString(36).slice(2)}` },
    });
    return user.id;
  }

  const user = await prisma.user.upsert({
    where: { walletAddress },
    create: { walletAddress },
    update: { lastLoginAt: new Date() },
  });
  return user.id;
}
