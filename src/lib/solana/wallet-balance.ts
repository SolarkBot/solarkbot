import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getTokenMetadataMap } from "./token-metadata";

const MAX_METADATA_LOOKUPS = 40;
const MAX_VISIBLE_HOLDINGS = 24;
const MAX_VISIBLE_COLLECTIBLES = 12;

export interface TokenAccount {
  mint: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  name?: string | null;
  symbol?: string | null;
  displayName?: string;
  verified?: boolean;
  isCollectible?: boolean;
}

export interface PortfolioHolding {
  mint: string;
  name: string | null;
  symbol: string | null;
  displayName: string;
  amount: number;
  verified: boolean;
}

export interface WalletBalancePortfolio {
  fungibleTokens: PortfolioHolding[];
  collectibles: PortfolioHolding[];
  additionalFungibleTokenCount: number;
  additionalCollectibleCount: number;
  unlabeledFungibleTokenCount: number;
  unlabeledCollectibleCount: number;
}

export interface WalletBalanceResult {
  solBalance: number;
  lamports: number;
  tokenAccounts: TokenAccount[];
  portfolio: WalletBalancePortfolio;
}

function isCollectibleToken(account: TokenAccount) {
  return account.decimals === 0 && account.uiAmount > 0 && account.uiAmount <= 1;
}

function getDisplayName(name: string | null, symbol: string | null) {
  if (name && symbol && name.toLowerCase() !== symbol.toLowerCase()) {
    return `${name} (${symbol})`;
  }

  return name || symbol || "Unlabeled token";
}

function toPortfolioHolding(account: TokenAccount): PortfolioHolding {
  return {
    mint: account.mint,
    name: account.name || null,
    symbol: account.symbol || null,
    displayName: account.displayName || "Unlabeled token",
    amount: account.uiAmount,
    verified: Boolean(account.verified),
  };
}

function sortByAmountDesc(a: TokenAccount, b: TokenAccount) {
  return b.uiAmount - a.uiAmount;
}

function sortPortfolioAccounts(a: TokenAccount, b: TokenAccount) {
  if (Boolean(a.verified) !== Boolean(b.verified)) {
    return Number(Boolean(b.verified)) - Number(Boolean(a.verified));
  }

  return sortByAmountDesc(a, b);
}

function buildPortfolio(tokenAccounts: TokenAccount[]): WalletBalancePortfolio {
  const namedFungible = tokenAccounts
    .filter((account) => account.uiAmount > 0 && !account.isCollectible && (account.name || account.symbol))
    .sort(sortPortfolioAccounts);

  const namedCollectibles = tokenAccounts
    .filter((account) => account.uiAmount > 0 && account.isCollectible && (account.name || account.symbol))
    .sort(sortPortfolioAccounts);

  const totalFungible = tokenAccounts.filter(
    (account) => account.uiAmount > 0 && !account.isCollectible
  ).length;
  const totalCollectibles = tokenAccounts.filter(
    (account) => account.uiAmount > 0 && account.isCollectible
  ).length;

  return {
    fungibleTokens: namedFungible.slice(0, MAX_VISIBLE_HOLDINGS).map(toPortfolioHolding),
    collectibles: namedCollectibles
      .slice(0, MAX_VISIBLE_COLLECTIBLES)
      .map(toPortfolioHolding),
    additionalFungibleTokenCount: Math.max(0, namedFungible.length - MAX_VISIBLE_HOLDINGS),
    additionalCollectibleCount: Math.max(
      0,
      namedCollectibles.length - MAX_VISIBLE_COLLECTIBLES
    ),
    unlabeledFungibleTokenCount: Math.max(0, totalFungible - namedFungible.length),
    unlabeledCollectibleCount: Math.max(0, totalCollectibles - namedCollectibles.length),
  };
}

export async function buildWalletBalanceResult(
  lamports: number,
  tokenAccounts: Array<Pick<TokenAccount, "mint" | "amount" | "decimals" | "uiAmount">>
): Promise<WalletBalanceResult> {
  const nonZeroSorted = [...tokenAccounts]
    .filter((account) => account.uiAmount > 0)
    .sort(sortByAmountDesc);

  const mintsToEnrich = Array.from(new Set(nonZeroSorted.map((account) => account.mint))).slice(
    0,
    MAX_METADATA_LOOKUPS
  );
  const metadataMap = await getTokenMetadataMap(mintsToEnrich);

  const enrichedTokenAccounts: TokenAccount[] = tokenAccounts.map((account) => {
    const metadata = metadataMap.get(account.mint);
    const name = metadata?.name || null;
    const symbol = metadata?.symbol || null;

    return {
      ...account,
      name,
      symbol,
      displayName: getDisplayName(name, symbol),
      verified: metadata?.verified || false,
      isCollectible: isCollectibleToken(account),
    };
  });

  return {
    solBalance: lamports / LAMPORTS_PER_SOL,
    lamports,
    tokenAccounts: enrichedTokenAccounts,
    portfolio: buildPortfolio(enrichedTokenAccounts),
  };
}
