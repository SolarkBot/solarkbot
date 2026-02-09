export interface PaymentReceipt {
  transactionSig: string;
  amount: number;
  payer: string;
  timestamp: number;
  network: string;
  token: string;
}

const USDC_MINT_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDC_MINT_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

/**
 * Generate a payment receipt object after a successful settlement.
 */
export function generateReceipt(
  transactionSig: string,
  amount: number,
  payer: string,
  timestamp: number
): PaymentReceipt {
  const network = process.env.SOLANA_NETWORK || "mainnet-beta";
  return {
    transactionSig,
    amount,
    payer,
    timestamp,
    network: network === "devnet" ? "solana:devnet" : "solana:mainnet",
    token: network === "devnet" ? USDC_MINT_DEVNET : USDC_MINT_MAINNET,
  };
}

/**
 * Base64-encode a receipt for use in the X-PAYMENT-RECEIPT header.
 */
export function encodeReceipt(receipt: PaymentReceipt): string {
  return Buffer.from(JSON.stringify(receipt)).toString("base64");
}

/**
 * Decode a base64-encoded receipt.
 */
export function decodeReceipt(encoded: string): PaymentReceipt {
  return JSON.parse(Buffer.from(encoded, "base64").toString("utf-8"));
}
