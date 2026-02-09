import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getConnection } from "./connection";

export interface TokenAccount {
  mint: string;
  amount: string;
  decimals: number;
  uiAmount: number;
}

export interface WalletBalanceResult {
  solBalance: number;
  lamports: number;
  tokenAccounts: TokenAccount[];
}

/**
 * Get SOL balance and all SPL token accounts for a wallet.
 * @param walletAddress - Base58-encoded Solana wallet address
 */
export async function getWalletBalance(walletAddress: string): Promise<WalletBalanceResult> {
  const connection = getConnection();
  const publicKey = new PublicKey(walletAddress);

  const [lamports, tokenAccountsResponse] = await Promise.all([
    connection.getBalance(publicKey),
    connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new PublicKey("TokenkegQfeN4jV5WP2tDSvFMvnknLhAXo8mhkQ7Ep"),
    }),
  ]);

  const tokenAccounts: TokenAccount[] = tokenAccountsResponse.value.map((account) => {
    const parsed = account.account.data.parsed.info;
    return {
      mint: parsed.mint as string,
      amount: parsed.tokenAmount.amount as string,
      decimals: parsed.tokenAmount.decimals as number,
      uiAmount: parsed.tokenAmount.uiAmount as number,
    };
  });

  return {
    solBalance: lamports / LAMPORTS_PER_SOL,
    lamports,
    tokenAccounts,
  };
}
