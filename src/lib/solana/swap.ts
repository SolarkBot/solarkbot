const JUPITER_QUOTE_API = "https://quote-api.jup.ag/v6/quote";
const JUPITER_SWAP_API = "https://quote-api.jup.ag/v6/swap";

export interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: unknown[];
  contextSlot: number;
  timeTaken: number;
}

export interface SwapResult {
  serializedTransaction: string;
  quote: JupiterQuote;
  message: string;
}

/**
 * Get a swap quote from Jupiter Aggregator v6.
 * @param inputMint - Input token mint address
 * @param outputMint - Output token mint address
 * @param amount - Amount in input token base units (raw integer)
 * @param slippageBps - Slippage tolerance in basis points (e.g. 50 = 0.5%)
 */
export async function getSwapQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = 50
): Promise<JupiterQuote> {
  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: amount.toString(),
    slippageBps: slippageBps.toString(),
  });

  const response = await fetch(`${JUPITER_QUOTE_API}?${params}`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Jupiter quote API error (${response.status}): ${text}`);
  }

  return response.json();
}

/**
 * Prepare a swap transaction via Jupiter Aggregator v6.
 * Returns a base64-encoded serialized transaction for frontend signing.
 * @param quote - Jupiter quote object from getSwapQuote()
 * @param userPublicKey - User's wallet address (base58)
 */
export async function prepareSwapTransaction(
  quote: JupiterQuote,
  userPublicKey: string
): Promise<SwapResult> {
  const response = await fetch(JUPITER_SWAP_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Jupiter swap API error (${response.status}): ${text}`);
  }

  const data = await response.json();

  return {
    serializedTransaction: data.swapTransaction,
    quote,
    message: `Swap ${quote.inAmount} of ${quote.inputMint} for ~${quote.outAmount} of ${quote.outputMint}`,
  };
}
