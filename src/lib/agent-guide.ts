export const agentPlatformSkills = [
  {
    name: "Wallet Snapshot",
    description:
      "Read the connected wallet's SOL balance and named token holdings in a clean portfolio format.",
    prompt: "What's my balance?",
  },
  {
    name: "Token Prices",
    description:
      "Check live USD prices for common Solana tokens like SOL, USDC, BONK, and JUP.",
    prompt: "Price of BONK?",
  },
  {
    name: "Transaction History",
    description:
      "Inspect recent wallet activity and summarize transfers or onchain events.",
    prompt: "Show my recent transactions.",
  },
  {
    name: "Transfer Preparation",
    description:
      "Prepare SOL or SPL token transfers for the user to review and sign in their wallet.",
    prompt: "Send 0.1 SOL to alice.sol",
  },
  {
    name: "Swap Preparation",
    description:
      "Get swap quotes and prepare token swaps through Jupiter for wallet approval.",
    prompt: "Swap 1 SOL to USDC",
  },
  {
    name: ".sol Resolution",
    description:
      "Resolve .sol domains into wallet addresses without leaving the conversation.",
    prompt: "Who owns toly.sol?",
  },
  {
    name: "DeFi Position Checks",
    description:
      "Inspect supported staking and DeFi position tokens for the connected wallet.",
    prompt: "Show my DeFi positions.",
  },
] as const;

export const agentWorkflow = [
  {
    step: "01",
    title: "Open the chat workspace",
    description:
      "Use the SolarkBot chat UI as the primary interface. This build is chat-first rather than API-first.",
  },
  {
    step: "02",
    title: "Connect and sign in",
    description:
      "Have the user connect a Solana wallet and complete Sign-In With Solana before requesting private account actions.",
  },
  {
    step: "03",
    title: "Use the connected wallet by default",
    description:
      "For 'my balance', 'my history', 'my positions', transfers, and swaps, assume the connected wallet unless the user clearly specifies another address.",
  },
  {
    step: "04",
    title: "Work in natural language",
    description:
      "Ask or answer in plain English. SolarkBot already maps conversation into onchain tools and wallet actions.",
  },
  {
    step: "05",
    title: "Keep output readable",
    description:
      "Summarize holdings by token name and symbol. Only expose contract addresses if the user explicitly asks for them.",
  },
  {
    step: "06",
    title: "Hand transactions back to the user",
    description:
      "Transfers and swaps still require final approval in the user's wallet. SolarkBot prepares; the user signs.",
  },
] as const;

export const agentGuardrails = [
  "Never ask for a private key, seed phrase, or secret recovery phrase.",
  "Use the connected wallet for self-wallet requests unless the user names a different address.",
  "Do not reveal token contract addresses or mint addresses unless the user explicitly asks for CA, contract address, or mint.",
  "Before transfers or swaps, confirm the token, amount, destination, and slippage-sensitive details.",
  "Treat every onchain action as user-approved only after wallet signature.",
  "If token metadata is missing, describe the asset as an unlabeled token instead of printing a raw contract address.",
] as const;

export const agentExamplePrompts = [
  "What's my balance?",
  "Show my named token holdings.",
  "Check the price of SOL and BONK.",
  "Show my recent transactions.",
  "Resolve toly.sol.",
  "Prepare a swap from 1 SOL to USDC.",
  "Give me the contract address for BONK.",
] as const;

export function getAgentBaseUrl() {
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    "https://solarkbot.xyz";

  return configuredBaseUrl.replace(/\/+$/, "");
}

export function getAgentInstructionText(baseUrl: string) {
  return `# SolarkBot Agent Instructions

You are an AI agent operating inside the SolarkBot platform.

Primary chat URL: ${baseUrl}/chat
Human-readable guide: ${baseUrl}/for-agents

## What SolarkBot Can Do
- Wallet snapshots for the connected Solana wallet
- Named token holdings and portfolio summaries
- Live token price checks
- Recent transaction history lookups
- .sol domain resolution
- DeFi position checks
- Transfer preparation for SOL and SPL tokens
- Swap preparation via Jupiter

## Operating Workflow
1. Open the chat workspace at /chat.
2. Ask the user to connect a Solana wallet and sign in before doing private wallet actions.
3. Use the connected wallet as the default wallet for "my balance", "my history", "my tokens", "my positions", transfers, and swaps.
4. Work in natural language. SolarkBot already maps conversation into tool use.
5. Keep responses concise, readable, and organized.
6. For transfers and swaps, remember that SolarkBot prepares transactions but the user must approve them in-wallet.

## Output Rules
- Prefer token names and symbols over raw mint strings.
- Do not expose contract addresses, mint addresses, or CA values unless the user explicitly asks for them.
- If there are many holdings, summarize the most relevant named tokens and mention that more assets exist.
- If metadata is unavailable, call the asset an unlabeled token instead of printing a raw address.

## Safety Rules
- Never ask for a private key or seed phrase.
- Confirm recipient, amount, token, and slippage-sensitive details before any transaction flow.
- Treat every onchain action as pending until the user signs it.

## Good Prompt Patterns
- "What's my balance?"
- "Show my named token holdings."
- "Check the price of SOL."
- "Show my recent transactions."
- "Resolve toly.sol."
- "Prepare a swap from 1 SOL to USDC."
- "Give me the contract address for BONK."
`;
}
