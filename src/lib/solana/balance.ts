import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { getConnection } from "./connection";
import { getWalletBalanceFromSolscan, hasSolscanApiKey } from "./solscan";
import {
  buildWalletBalanceResult,
  type WalletBalanceResult,
  type TokenAccount,
} from "./wallet-balance";

export type { TokenAccount, WalletBalanceResult } from "./wallet-balance";

/**
 * Get SOL balance and all SPL token accounts for a wallet.
 * @param walletAddress - Base58-encoded Solana wallet address
 */
export async function getWalletBalance(walletAddress: string): Promise<WalletBalanceResult> {
  if (hasSolscanApiKey()) {
    try {
      return await getWalletBalanceFromSolscan(walletAddress);
    } catch (error) {
      console.error("Solscan balance lookup failed, falling back to RPC:", error);
    }
  }

  const connection = getConnection();
  const publicKey = new PublicKey(walletAddress);

  const [lamports, tokenAccountsResponse] = await Promise.all([
    connection.getBalance(publicKey),
    connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
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

  return buildWalletBalanceResult(lamports, tokenAccounts);
}
