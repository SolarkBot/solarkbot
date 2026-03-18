import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { getConnection } from "./connection";

export interface PreparedTransaction {
  serializedTransaction: string;
  message: string;
}

/**
 * Prepare a SOL transfer transaction for frontend signing.
 * @param senderAddress - Sender wallet address (base58)
 * @param recipientAddress - Recipient wallet address (base58)
 * @param amountSol - Amount in SOL
 * @returns Base64-encoded serialized transaction
 */
export async function prepareSolTransfer(
  senderAddress: string,
  recipientAddress: string,
  amountSol: number
): Promise<PreparedTransaction> {
  const connection = getConnection();
  const sender = new PublicKey(senderAddress);
  const recipient = new PublicKey(recipientAddress);
  const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: recipient,
      lamports,
    })
  );

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = sender;

  const serialized = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });

  return {
    serializedTransaction: serialized.toString("base64"),
    message: `Transfer ${amountSol} SOL to ${recipientAddress}`,
  };
}

/**
 * Prepare an SPL token transfer transaction for frontend signing.
 * Creates the recipient's associated token account if needed.
 * @param senderAddress - Sender wallet address (base58)
 * @param recipientAddress - Recipient wallet address (base58)
 * @param tokenMint - Token mint address (base58)
 * @param amount - Amount in token base units (raw integer amount)
 * @returns Base64-encoded serialized transaction
 */
export async function prepareTokenTransfer(
  senderAddress: string,
  recipientAddress: string,
  tokenMint: string,
  amount: number
): Promise<PreparedTransaction> {
  const connection = getConnection();
  const sender = new PublicKey(senderAddress);
  const recipient = new PublicKey(recipientAddress);
  const mint = new PublicKey(tokenMint);

  const senderAta = getAssociatedTokenAddressSync(mint, sender);
  const recipientAta = getAssociatedTokenAddressSync(mint, recipient);

  const transaction = new Transaction();

  // Check if recipient ATA exists; if not, create it
  const recipientAtaInfo = await connection.getAccountInfo(recipientAta);
  if (!recipientAtaInfo) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        sender, // payer
        recipientAta,
        recipient,
        mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  transaction.add(
    createTransferInstruction(
      senderAta,
      recipientAta,
      sender,
      BigInt(amount)
    )
  );

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = sender;

  const serialized = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });

  return {
    serializedTransaction: serialized.toString("base64"),
    message: `Transfer ${amount} tokens (mint: ${tokenMint}) to ${recipientAddress}`,
  };
}
