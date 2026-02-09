import {
  Transaction,
  PublicKey,
} from "@solana/web3.js";
import { getConnection } from "@/lib/solana/connection";

const USDC_MINT_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDC_MINT_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

/** SPL Token program ID */
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

interface VerifyResult {
  success: boolean;
  amount?: number;
  payer?: string;
  error?: string;
}

interface SettleResult {
  success: boolean;
  transactionSig?: string;
  payer?: string;
  amount?: number;
  error?: string;
}

function getUsdcMint(): PublicKey {
  const network = process.env.SOLANA_NETWORK || "mainnet-beta";
  return new PublicKey(network === "devnet" ? USDC_MINT_DEVNET : USDC_MINT_MAINNET);
}

function getMerchantWallet(): PublicKey {
  const addr = process.env.MERCHANT_WALLET_ADDRESS;
  if (!addr) {
    throw new Error("MERCHANT_WALLET_ADDRESS environment variable is not set");
  }
  return new PublicKey(addr);
}

/**
 * Decode the X-PAYMENT header (base64-encoded serialized transaction)
 * and return the deserialized Solana transaction.
 */
function decodePaymentTransaction(paymentHeader: string): Transaction {
  const buffer = Buffer.from(paymentHeader, "base64");
  return Transaction.from(buffer);
}

/**
 * Derive the associated token account (ATA) address for a given wallet and mint.
 */
function deriveATA(wallet: PublicKey, mint: PublicKey): PublicKey {
  const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
  );

  const [ata] = PublicKey.findProgramAddressSync(
    [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return ata;
}

/**
 * Verify a payment transaction without submitting it.
 *
 * Checks:
 *  1. Transaction deserializes successfully
 *  2. Contains a transfer instruction to the merchant's USDC ATA
 *  3. Uses the correct USDC token mint
 *  4. Transaction is properly signed
 */
export async function verifyPayment(paymentHeader: string): Promise<VerifyResult> {
  try {
    const tx = decodePaymentTransaction(paymentHeader);

    if (!tx.signatures.length || tx.signatures[0].signature === null) {
      return { success: false, error: "Transaction is not signed" };
    }

    // The first signer is the payer
    const payer = tx.signatures[0].publicKey;

    const merchantWallet = getMerchantWallet();
    const usdcMint = getUsdcMint();
    const merchantATA = deriveATA(merchantWallet, usdcMint);

    // Search through instructions for an SPL Token Transfer/TransferChecked to the merchant ATA
    let transferAmount: number | null = null;

    for (const ix of tx.instructions) {
      const programId = ix.programId.toBase58();

      // SPL Token program
      if (programId !== TOKEN_PROGRAM_ID.toBase58()) continue;

      const data = ix.data;
      // Transfer instruction type = 3 (1 byte), amount = 8 bytes (LE)
      // TransferChecked instruction type = 12 (1 byte), amount = 8 bytes (LE), decimals = 1 byte
      const instructionType = data[0];

      if (instructionType === 3 && data.length >= 9) {
        // Transfer: accounts = [source, destination, owner]
        const destinationKey = ix.keys[1]?.pubkey;
        if (destinationKey && destinationKey.equals(merchantATA)) {
          transferAmount = Number(data.readBigUInt64LE(1));
        }
      } else if (instructionType === 12 && data.length >= 10) {
        // TransferChecked: accounts = [source, mint, destination, owner]
        const mintKey = ix.keys[1]?.pubkey;
        const destinationKey = ix.keys[2]?.pubkey;
        if (
          destinationKey &&
          destinationKey.equals(merchantATA) &&
          mintKey &&
          mintKey.equals(usdcMint)
        ) {
          transferAmount = Number(data.readBigUInt64LE(1));
        }
      }
    }

    if (transferAmount === null) {
      return { success: false, error: "No valid USDC transfer to merchant found in transaction" };
    }

    // Verify the blockhash is recent
    const connection = getConnection();
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    if (!tx.recentBlockhash) {
      return { success: false, error: "Transaction missing recent blockhash" };
    }

    // Verify signature validity
    const isValid = tx.verifySignatures();
    if (!isValid) {
      return { success: false, error: "Transaction signature verification failed" };
    }

    // Convert atomic amount back to USDC (6 decimals)
    const amountUsdc = transferAmount / 1e6;

    return {
      success: true,
      amount: amountUsdc,
      payer: payer.toBase58(),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown verification error";
    return { success: false, error: message };
  }
}

/**
 * Submit a signed payment transaction to the Solana network and wait for confirmation.
 */
export async function settlePayment(paymentHeader: string): Promise<SettleResult> {
  try {
    // First verify the payment
    const verification = await verifyPayment(paymentHeader);
    if (!verification.success) {
      return { success: false, error: verification.error };
    }

    const tx = decodePaymentTransaction(paymentHeader);
    const connection = getConnection();

    // Serialize and send the transaction
    const rawTransaction = tx.serialize();
    const txSig = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    // Wait for confirmation
    const latestBlockhash = await connection.getLatestBlockhash("confirmed");
    const confirmation = await connection.confirmTransaction(
      {
        signature: txSig,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      },
      "confirmed"
    );

    if (confirmation.value.err) {
      return {
        success: false,
        error: `Transaction failed on-chain: ${JSON.stringify(confirmation.value.err)}`,
      };
    }

    return {
      success: true,
      transactionSig: txSig,
      payer: verification.payer,
      amount: verification.amount,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown settlement error";
    return { success: false, error: message };
  }
}
