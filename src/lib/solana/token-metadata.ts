const JUPITER_TOKEN_SEARCH_URL = "https://lite-api.jup.ag/tokens/v2/search";

export interface TokenMetadata {
  mint: string;
  name: string | null;
  symbol: string | null;
  icon: string | null;
  verified: boolean;
}

interface JupiterTokenSearchResult {
  id: string;
  name?: string;
  symbol?: string;
  icon?: string;
  isVerified?: boolean;
  tags?: string[];
}

const globalForTokenMetadata = globalThis as unknown as {
  tokenMetadataCache?: Map<string, Promise<TokenMetadata | null>>;
};

const tokenMetadataCache =
  globalForTokenMetadata.tokenMetadataCache ??
  (globalForTokenMetadata.tokenMetadataCache = new Map<string, Promise<TokenMetadata | null>>());

const KNOWN_TOKEN_METADATA: Record<string, TokenMetadata> = {
  So11111111111111111111111111111111111111112: {
    mint: "So11111111111111111111111111111111111111112",
    name: "Wrapped SOL",
    symbol: "SOL",
    icon: null,
    verified: true,
  },
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    name: "USD Coin",
    symbol: "USDC",
    icon: null,
    verified: true,
  },
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    name: "Tether USD",
    symbol: "USDT",
    icon: null,
    verified: true,
  },
  JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN: {
    mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    name: "Jupiter",
    symbol: "JUP",
    icon: null,
    verified: true,
  },
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    name: "Bonk",
    symbol: "BONK",
    icon: null,
    verified: true,
  },
};

async function fetchTokenMetadataFromJupiter(mint: string) {
  const response = await fetch(
    `${JUPITER_TOKEN_SEARCH_URL}?query=${encodeURIComponent(mint)}`,
    {
      cache: "force-cache",
    }
  );

  if (!response.ok) {
    throw new Error(`Jupiter token API error: ${response.status}`);
  }

  const payload = (await response.json()) as JupiterTokenSearchResult[];
  const exactMatch =
    payload.find((token) => token.id.toLowerCase() === mint.toLowerCase()) ||
    payload[0];

  if (!exactMatch) {
    return null;
  }

  return {
    mint,
    name: exactMatch.name || null,
    symbol: exactMatch.symbol || null,
    icon: exactMatch.icon || null,
    verified:
      Boolean(exactMatch.isVerified) ||
      exactMatch.tags?.includes("verified") ||
      exactMatch.tags?.includes("strict") ||
      false,
  } satisfies TokenMetadata;
}

export async function getTokenMetadata(mint: string) {
  const known = KNOWN_TOKEN_METADATA[mint];
  if (known) {
    return known;
  }

  const cached = tokenMetadataCache.get(mint);
  if (cached) {
    return cached;
  }

  const lookupPromise = fetchTokenMetadataFromJupiter(mint).catch(() => null);
  tokenMetadataCache.set(mint, lookupPromise);
  return lookupPromise;
}

export async function getTokenMetadataMap(mints: string[]) {
  const entries = await Promise.all(
    mints.map(async (mint) => [mint, await getTokenMetadata(mint)] as const)
  );

  return new Map(entries);
}
