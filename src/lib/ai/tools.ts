import { PublicKey } from "@solana/web3.js";
import { getConnection } from "@/lib/solana/connection";
import { getWalletBalance } from "@/lib/solana/balance";
import { prepareTokenTransfer, prepareSolTransfer } from "@/lib/solana/transfer";
import { getSwapQuote, prepareSwapTransaction } from "@/lib/solana/swap";
import type { ToolDefinition } from "./provider";

/** Tool definitions in OpenAI function calling format */
export const toolDefinitions: ToolDefinition[] = [
  {
    name: "get_wallet_balance",
    description:
      "Get SOL balance and all SPL token balances for a Solana wallet address.",
    parameters: {
      type: "object",
      properties: {
        wallet_address: {
          type: "string",
          description: "The Solana wallet address (base58 encoded)",
        },
      },
      required: ["wallet_address"],
    },
  },
  {
    name: "get_token_price",
    description:
      "Get the current USD price of a token. Accepts token symbols (SOL, USDC, BONK, JUP, etc.) or Solana mint addresses.",
    parameters: {
      type: "object",
      properties: {
        token_mint: {
          type: "string",
          description: "The token symbol (e.g. SOL, USDC, BONK, JUP) or SPL token mint address",
        },
      },
      required: ["token_mint"],
    },
  },
  {
    name: "prepare_token_transfer",
    description:
      "Prepare a token transfer transaction. Returns a serialized transaction for the user to sign. Supports both SOL and SPL tokens.",
    parameters: {
      type: "object",
      properties: {
        sender_address: {
          type: "string",
          description: "The sender's wallet address",
        },
        recipient_address: {
          type: "string",
          description: "The recipient's wallet address",
        },
        token_mint: {
          type: "string",
          description:
            'The token mint address. Use "SOL" for native SOL transfers.',
        },
        amount: {
          type: "number",
          description:
            "The amount to transfer. For SOL, this is in SOL units. For SPL tokens, this is in base units (raw integer amount).",
        },
      },
      required: ["sender_address", "recipient_address", "token_mint", "amount"],
    },
  },
  {
    name: "prepare_swap",
    description:
      "Prepare a token swap transaction via Jupiter aggregator. Returns a serialized transaction for the user to sign.",
    parameters: {
      type: "object",
      properties: {
        input_mint: {
          type: "string",
          description: "The input token mint address",
        },
        output_mint: {
          type: "string",
          description: "The output token mint address",
        },
        amount: {
          type: "number",
          description: "The amount of input token in base units (raw integer)",
        },
        slippage_bps: {
          type: "number",
          description:
            "Slippage tolerance in basis points (e.g. 50 = 0.5%). Defaults to 50.",
        },
        user_public_key: {
          type: "string",
          description: "The user's wallet address for the swap",
        },
      },
      required: ["input_mint", "output_mint", "amount", "user_public_key"],
    },
  },
  {
    name: "get_transaction_history",
    description:
      "Get recent transaction history for a Solana wallet address.",
    parameters: {
      type: "object",
      properties: {
        wallet_address: {
          type: "string",
          description: "The Solana wallet address",
        },
        limit: {
          type: "number",
          description: "Number of recent transactions to fetch (default 10, max 50)",
        },
      },
      required: ["wallet_address"],
    },
  },
  {
    name: "lookup_solana_domain",
    description:
      "Resolve a .sol domain name to its associated Solana wallet address.",
    parameters: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          description:
            'The .sol domain name to resolve (e.g. "toly.sol" or "toly")',
        },
      },
      required: ["domain"],
    },
  },
  {
    name: "get_defi_position",
    description:
      "Check DeFi positions for a wallet across supported protocols.",
    parameters: {
      type: "object",
      properties: {
        wallet_address: {
          type: "string",
          description: "The wallet address to check positions for",
        },
        protocol: {
          type: "string",
          description:
            'The DeFi protocol to check (e.g. "raydium", "orca", "marinade", "jupiter")',
        },
      },
      required: ["wallet_address"],
    },
  },
];

/** Map of tool name to executor function */
export const toolExecutors: Record<
  string,
  (args: Record<string, unknown>) => Promise<unknown>
> = {
  get_wallet_balance: async (args) => {
    const walletAddress = args.wallet_address as string;
    return getWalletBalance(walletAddress);
  },

  get_token_price: async (args) => {
    const tokenMint = args.token_mint as string;

    // Map common mints/symbols to CoinGecko IDs
    const mintToGeckoId: Record<string, { id: string; symbol: string }> = {
      So11111111111111111111111111111111: { id: "solana", symbol: "SOL" },
      SOL: { id: "solana", symbol: "SOL" },
      solana: { id: "solana", symbol: "SOL" },
      EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: { id: "usd-coin", symbol: "USDC" },
      USDC: { id: "usd-coin", symbol: "USDC" },
      Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: { id: "tether", symbol: "USDT" },
      USDT: { id: "tether", symbol: "USDT" },
      mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: { id: "msol", symbol: "mSOL" },
      J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn: { id: "jito-staked-sol", symbol: "JitoSOL" },
      JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN: { id: "jupiter-exchange-solana", symbol: "JUP" },
      JUP: { id: "jupiter-exchange-solana", symbol: "JUP" },
      DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: { id: "bonk", symbol: "BONK" },
      BONK: { id: "bonk", symbol: "BONK" },
      rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof: { id: "render-token", symbol: "RNDR" },
      WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk: { id: "wen-4", symbol: "WEN" },
    };

    const mapped = mintToGeckoId[tokenMint];
    if (mapped) {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${mapped.id}&vs_currencies=usd&include_24hr_change=true`
      );
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      const data = await response.json();
      const priceData = data[mapped.id];
      if (!priceData) {
        return { error: "Token price not found", token: tokenMint };
      }
      return {
        token: mapped.symbol,
        mint: tokenMint,
        price: priceData.usd,
        change24h: priceData.usd_24h_change ? `${priceData.usd_24h_change.toFixed(2)}%` : null,
        currency: "USD",
        source: "coingecko",
      };
    }

    // For unknown mints, try CoinGecko contract lookup on Solana
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${encodeURIComponent(tokenMint)}&vs_currencies=usd&include_24hr_change=true`
    );
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    const data = await response.json();
    const priceData = data[tokenMint.toLowerCase()] || data[tokenMint];
    if (!priceData) {
      return { error: "Token price not found. Try using the token symbol (e.g. SOL, BONK, JUP).", mint: tokenMint };
    }
    return {
      mint: tokenMint,
      price: priceData.usd,
      change24h: priceData.usd_24h_change ? `${priceData.usd_24h_change.toFixed(2)}%` : null,
      currency: "USD",
      source: "coingecko",
    };
  },

  prepare_token_transfer: async (args) => {
    const senderAddress = args.sender_address as string;
    const recipientAddress = args.recipient_address as string;
    const tokenMint = args.token_mint as string;
    const amount = args.amount as number;

    if (tokenMint === "SOL" || tokenMint === "So11111111111111111111111111111111") {
      return prepareSolTransfer(senderAddress, recipientAddress, amount);
    }

    return prepareTokenTransfer(senderAddress, recipientAddress, tokenMint, amount);
  },

  prepare_swap: async (args) => {
    const inputMint = args.input_mint as string;
    const outputMint = args.output_mint as string;
    const amount = args.amount as number;
    const slippageBps = (args.slippage_bps as number) || 50;
    const userPublicKey = args.user_public_key as string;

    const quote = await getSwapQuote(inputMint, outputMint, amount, slippageBps);
    return prepareSwapTransaction(quote, userPublicKey);
  },

  get_transaction_history: async (args) => {
    const walletAddress = args.wallet_address as string;
    const limit = Math.min((args.limit as number) || 10, 50);
    const connection = getConnection();
    const publicKey = new PublicKey(walletAddress);

    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit,
    });

    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        try {
          const tx = await connection.getParsedTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          });
          return {
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime,
            err: sig.err,
            memo: sig.memo,
            type: tx?.transaction.message.instructions?.[0]
              ? (
                  tx.transaction.message.instructions[0] as {
                    program?: string;
                    programId?: { toBase58: () => string };
                  }
                ).program || (tx.transaction.message.instructions[0] as { programId?: { toBase58: () => string } }).programId?.toBase58()
              : "unknown",
          };
        } catch {
          return {
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime,
            err: sig.err,
            memo: sig.memo,
            type: "unknown",
          };
        }
      })
    );

    return { address: walletAddress, transactions, count: transactions.length };
  },

  lookup_solana_domain: async (args) => {
    let domain = args.domain as string;
    // Strip .sol suffix if present
    domain = domain.replace(/\.sol$/i, "");

    try {
      // Dynamic import to handle cases where @bonfida/spl-name-service isn't installed
      const { resolve } = await import("@bonfida/spl-name-service");
      const connection = getConnection();
      const owner = await resolve(connection, domain);
      return {
        domain: `${domain}.sol`,
        owner: owner.toBase58(),
      };
    } catch (error) {
      return {
        domain: `${domain}.sol`,
        error: `Could not resolve domain: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },

  get_defi_position: async (args) => {
    const walletAddress = args.wallet_address as string;
    const protocol = (args.protocol as string) || "all";

    // For DeFi position checking, we inspect token accounts for known protocol tokens.
    // Full protocol integration would require each protocol's SDK; for now, we check
    // for known staking / LP token mints.
    const balance = await getWalletBalance(walletAddress);

    const knownProtocolMints: Record<string, { protocol: string; type: string }> = {
      mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: { protocol: "marinade", type: "staked SOL (mSOL)" },
      "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": { protocol: "lido", type: "staked SOL (stSOL)" },
      bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1: { protocol: "blazestake", type: "staked SOL (bSOL)" },
      J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn: { protocol: "jito", type: "staked SOL (JitoSOL)" },
    };

    const positions = balance.tokenAccounts
      .filter((ta) => {
        if (protocol === "all") return ta.mint in knownProtocolMints;
        return (
          ta.mint in knownProtocolMints &&
          knownProtocolMints[ta.mint].protocol === protocol.toLowerCase()
        );
      })
      .map((ta) => ({
        mint: ta.mint,
        amount: ta.uiAmount,
        decimals: ta.decimals,
        ...knownProtocolMints[ta.mint],
      }));

    return {
      wallet: walletAddress,
      protocol: protocol,
      positions,
      note:
        positions.length === 0
          ? `No ${protocol === "all" ? "" : protocol + " "}DeFi positions found for this wallet.`
          : undefined,
    };
  },
};

/**
 * Execute a tool by name with the given arguments.
 * @param toolName - Name of the tool to execute
 * @param args - Arguments for the tool
 */
export async function executeTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const executor = toolExecutors[toolName];
  if (!executor) {
    throw new Error(`Unknown tool: ${toolName}`);
  }
  return executor(args);
}
