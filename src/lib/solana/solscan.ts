import { buildWalletBalanceResult, type TokenAccount, type WalletBalanceResult } from "./wallet-balance";

const DEFAULT_SOLSCAN_API_BASE_URL = "https://pro-api.solscan.io/v2.0";
const SOLSCAN_PAGE_SIZE = 40;
const SOLSCAN_MAX_TOKEN_ACCOUNT_PAGES = 5;

interface SolscanResponse<T> {
  success?: boolean;
  data?: T;
  errors?: {
    code?: number;
    message?: string;
  };
}

interface SolscanAccountDetail {
  account: string;
  lamports: number;
}

interface SolscanTokenAccount {
  token_account: string;
  token_address: string;
  amount: number | string;
  token_decimals: number;
  owner: string;
}

interface SolscanTransaction {
  slot: number;
  fee: number;
  status: string;
  signer: string[];
  block_time: number;
  tx_hash: string;
  parsed_instructions?: Array<{
    type?: string;
    program_id?: string;
    program?: string;
  }>;
  program_ids?: string[];
  time?: string;
}

export interface TransactionHistoryItem {
  signature: string;
  slot: number;
  blockTime: number | null;
  err: string | null;
  memo: string | null;
  type: string;
}

export function hasSolscanApiKey() {
  return Boolean(process.env.SOLSCAN_API_KEY);
}

function getSolscanBaseUrl() {
  return process.env.SOLSCAN_API_BASE_URL || DEFAULT_SOLSCAN_API_BASE_URL;
}

function getSolscanHeaders() {
  const apiKey = process.env.SOLSCAN_API_KEY;
  if (!apiKey) {
    throw new Error("SOLSCAN_API_KEY is not configured");
  }

  return {
    accept: "application/json",
    token: apiKey,
  };
}

async function fetchSolscan<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined>
) {
  const url = new URL(`${getSolscanBaseUrl()}${path}`);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    headers: getSolscanHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Solscan API error: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as SolscanResponse<T>;
  if (payload.success === false || payload.data === undefined) {
    throw new Error(payload.errors?.message || "Solscan API returned an invalid response");
  }

  return payload.data;
}

function toUiAmount(amount: string, decimals: number) {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return parsed / 10 ** decimals;
}

async function getSolscanTokenAccounts(address: string) {
  const tokenAccounts: SolscanTokenAccount[] = [];

  for (let page = 1; page <= SOLSCAN_MAX_TOKEN_ACCOUNT_PAGES; page++) {
    const pageData = await fetchSolscan<SolscanTokenAccount[]>(
      "/account/token-accounts",
      {
        address,
        type: "token",
        page,
        page_size: SOLSCAN_PAGE_SIZE,
        hide_zero: true,
      }
    );

    tokenAccounts.push(...pageData);

    if (pageData.length < SOLSCAN_PAGE_SIZE) {
      break;
    }
  }

  return tokenAccounts;
}

export async function getWalletBalanceFromSolscan(
  walletAddress: string
): Promise<WalletBalanceResult> {
  const [accountDetail, tokenAccounts] = await Promise.all([
    fetchSolscan<SolscanAccountDetail>("/account/detail", {
      address: walletAddress,
    }),
    getSolscanTokenAccounts(walletAddress),
  ]);

  const lamports = Number(accountDetail.lamports || 0);

  const normalizedTokenAccounts: TokenAccount[] = tokenAccounts.map((account) => {
    const amount = String(account.amount ?? "0");
    const decimals = Number(account.token_decimals || 0);

    return {
      mint: account.token_address,
      amount,
      decimals,
      uiAmount: toUiAmount(amount, decimals),
    };
  });

  return buildWalletBalanceResult(lamports, normalizedTokenAccounts);
}

export async function getTransactionHistoryFromSolscan(
  walletAddress: string,
  limit: number
) {
  const normalizedLimit = Math.min(Math.max(limit, 1), 50);
  const transactions: SolscanTransaction[] = [];
  let before: string | undefined;

  while (transactions.length < normalizedLimit) {
    const pageLimit = Math.min(normalizedLimit - transactions.length, SOLSCAN_PAGE_SIZE);
    const pageData = await fetchSolscan<SolscanTransaction[]>(
      "/account/transactions",
      {
        address: walletAddress,
        limit: pageLimit,
        before,
      }
    );

    if (pageData.length === 0) {
      break;
    }

    transactions.push(...pageData);
    before = pageData[pageData.length - 1]?.tx_hash;

    if (pageData.length < pageLimit || !before) {
      break;
    }
  }

  return transactions.slice(0, normalizedLimit).map<TransactionHistoryItem>((tx) => ({
    signature: tx.tx_hash,
    slot: tx.slot,
    blockTime: tx.block_time ?? null,
    err: tx.status === "Success" ? null : tx.status || "Fail",
    memo: null,
    type:
      tx.parsed_instructions?.[0]?.type ||
      tx.parsed_instructions?.[0]?.program ||
      tx.parsed_instructions?.[0]?.program_id ||
      tx.program_ids?.[0] ||
      "unknown",
  }));
}
