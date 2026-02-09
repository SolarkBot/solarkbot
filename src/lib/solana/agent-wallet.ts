import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

let cachedKeypair: Keypair | null = null;

/**
 * Load the server-side agent keypair from AGENT_WALLET_PRIVATE_KEY env var.
 * The private key must be base58-encoded.
 * Used ONLY for gas-only operations (e.g. creating token accounts) --
 * never for signing user transactions.
 * @returns Keypair or null if not configured
 */
export function getAgentWallet(): Keypair | null {
  if (cachedKeypair) {
    return cachedKeypair;
  }

  const privateKeyBase58 = process.env.AGENT_WALLET_PRIVATE_KEY;
  if (!privateKeyBase58) {
    return null;
  }

  try {
    const secretKey = bs58.decode(privateKeyBase58);
    cachedKeypair = Keypair.fromSecretKey(secretKey);
    return cachedKeypair;
  } catch (error) {
    console.error("Failed to load agent wallet keypair:", error);
    return null;
  }
}

/**
 * Get the agent wallet's public key as a base58 string.
 * @returns Public key string or null if agent wallet is not configured
 */
export function getAgentWalletAddress(): string | null {
  const wallet = getAgentWallet();
  return wallet ? wallet.publicKey.toBase58() : null;
}
