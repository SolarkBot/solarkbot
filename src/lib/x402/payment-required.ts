import { NextResponse } from "next/server";

const USDC_MINT_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDC_MINT_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export interface PaymentRequirement {
  x402Version: number;
  schemes: PaymentScheme[];
  resource: string;
  description: string;
}

export interface PaymentScheme {
  scheme: "exact";
  network: string;
  maxAmountRequired: string;
  payTo: string;
  requiredDeadlineSeconds: number;
  extra: {
    token: string;
  };
}

export interface BuildPaymentRequiredOptions {
  priceUsdc: number;
  resource: string;
  description: string;
}

function getNetwork(): string {
  const network = process.env.SOLANA_NETWORK || "mainnet-beta";
  return network === "devnet" ? "solana:devnet" : "solana:mainnet";
}

function getUsdcMint(): string {
  const network = process.env.SOLANA_NETWORK || "mainnet-beta";
  return network === "devnet" ? USDC_MINT_DEVNET : USDC_MINT_MAINNET;
}

/**
 * Build a payment requirement object conforming to x402.
 */
export function buildPaymentRequired(options: BuildPaymentRequiredOptions): PaymentRequirement {
  const { priceUsdc, resource, description } = options;
  const merchantWallet = process.env.MERCHANT_WALLET_ADDRESS;

  if (!merchantWallet) {
    throw new Error("MERCHANT_WALLET_ADDRESS environment variable is not set");
  }

  // USDC has 6 decimal places — convert to atomic units
  const atomicAmount = Math.round(priceUsdc * 1e6).toString();

  return {
    x402Version: 1,
    schemes: [
      {
        scheme: "exact",
        network: getNetwork(),
        maxAmountRequired: atomicAmount,
        payTo: merchantWallet,
        requiredDeadlineSeconds: 60,
        extra: {
          token: getUsdcMint(),
        },
      },
    ],
    resource,
    description,
  };
}

/**
 * Base64-encode a payment requirement for use in the PAYMENT-REQUIRED header.
 */
export function encodePaymentRequired(requirement: PaymentRequirement): string {
  return Buffer.from(JSON.stringify(requirement)).toString("base64");
}

/**
 * Create a full 402 Payment Required HTTP response.
 */
export function createPaymentRequiredResponse(options: BuildPaymentRequiredOptions): NextResponse {
  const requirement = buildPaymentRequired(options);
  const encoded = encodePaymentRequired(requirement);

  return NextResponse.json(
    {
      success: false,
      error: "Payment required",
      paymentRequirement: requirement,
    },
    {
      status: 402,
      headers: {
        "PAYMENT-REQUIRED": encoded,
        "X-X402-VERSION": "1",
      },
    }
  );
}
