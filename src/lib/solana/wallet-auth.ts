import nacl from "tweetnacl";
import bs58 from "bs58";

/**
 * Create a Sign-In With Solana (SIWS) message.
 */
export function createSIWSMessage(
  walletAddress: string,
  nonce: string,
  domain: string
): string {
  const issuedAt = new Date().toISOString();

  return [
    `${domain} wants you to sign in with your Solana account:`,
    walletAddress,
    "",
    "Sign in to SolarkBot - your crypto-native AI assistant.",
    "",
    `URI: https://${domain}`,
    "Version: 1",
    "Chain ID: mainnet",
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join("\n");
}

/**
 * Verify a SIWS signature using tweetnacl.
 * The signature and walletAddress are expected to be base58-encoded.
 */
export function verifySIWSSignature(
  message: string,
  signature: string,
  walletAddress: string
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = bs58.decode(walletAddress);

    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch {
    return false;
  }
}

/**
 * Extract the wallet address from a SIWS message.
 * The wallet address is on the second line.
 */
export function extractWalletAddress(message: string): string | null {
  const lines = message.split("\n");
  if (lines.length < 2) return null;
  return lines[1].trim() || null;
}

/**
 * Extract the nonce from a SIWS message.
 */
export function extractNonce(message: string): string | null {
  const match = message.match(/^Nonce: (.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Extract the domain from a SIWS message.
 */
export function extractDomain(message: string): string | null {
  const match = message.match(/^(.+) wants you to sign in with your Solana account:$/m);
  return match ? match[1].trim() : null;
}
