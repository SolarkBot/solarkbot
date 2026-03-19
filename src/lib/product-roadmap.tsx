import {
  BarChart3,
  Bell,
  Bot,
  Brain,
  Coins,
  FileText,
  Globe,
  Shield,
  Sparkles,
  Target,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface UpcomingFeatureGroup {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  points: string[];
  example: string;
  prompt: string;
  gradient: string;
}

export interface OperatorTemplate {
  id: string;
  icon: LucideIcon;
  title: string;
  category: string;
  description: string;
  prompt: string;
}

export const roadmapSignals = [
  "Assistant to operator",
  "Simulate before signing",
  "Automate strategy",
  "Protocol-native actions",
];

export const upcomingFeatureGroups: UpcomingFeatureGroup[] = [
  {
    id: "portfolio-intelligence",
    icon: BarChart3,
    title: "Portfolio Intelligence",
    description:
      "Surface exposure, PnL, and concentration risk before the user makes the next move.",
    points: [
      "SOL exposure checks",
      "PnL across tokens and NFTs",
      "Volatility and concentration scoring",
    ],
    example: '"Am I overexposed to SOL?"',
    prompt:
      "Give me a portfolio intelligence brief for my wallet. Focus on SOL exposure, concentration risk, major positions, and the first risks I should look at.",
    gradient: "from-sky-500 to-cyan-400",
  },
  {
    id: "transaction-explanation",
    icon: FileText,
    title: "Transaction Explanation",
    description:
      "Translate every signature request into human language before and after execution.",
    points: [
      "Swap route previews",
      "Fee and slippage breakdowns",
      "Post-trade settlement summaries",
    ],
    example: '"This swaps 1 SOL to ~150 USDC via Jupiter."',
    prompt:
      "Explain this transaction in plain language. Include the route, expected output, fees, slippage, and what my wallet balance will look like after execution.",
    gradient: "from-amber-500 to-orange-400",
  },
  {
    id: "memory-layer",
    icon: Brain,
    title: "Memory Layer",
    description:
      "Remember the tokens, addresses, and risk settings that make repeat flows feel personal.",
    points: [
      "Favorite tokens",
      "Frequent recipients",
      "Saved slippage and risk preferences",
    ],
    example: '"Use low slippage like last time."',
    prompt:
      "Create a memory profile for me: favorite tokens, frequent recipients, and a low-slippage preference for future swap flows.",
    gradient: "from-violet-500 to-fuchsia-400",
  },
  {
    id: "alerts-and-automation",
    icon: Bell,
    title: "Alerts and Automation",
    description:
      "Watch markets, trigger rules, and move from reactive chat to always-on wallet operations.",
    points: ["Price alerts", "Recurring buys", "Auto-exit conditions"],
    example: '"Alert me if SOL drops below $100."',
    prompt:
      "Design an alert and automation plan for SOL: price alerts, recurring buy ideas, and an auto-exit rule with safe defaults.",
    gradient: "from-emerald-400 to-lime-300",
  },
  {
    id: "strategy-execution",
    icon: Zap,
    title: "Strategy Execution",
    description:
      "Handle complex multi-step tasks with one instruction instead of a trail of manual clicks.",
    points: [
      "Best-pool staking",
      "Claim-and-restake flows",
      "Swap-then-send actions",
    ],
    example: '"Swap SOL to USDC and send it to Alice."',
    prompt:
      "Build a multi-step execution plan to swap SOL to USDC and send the output to Alice, including the checks I should review before approving anything.",
    gradient: "from-solana-purple to-indigo-500",
  },
  {
    id: "defi-power-features",
    icon: Coins,
    title: "DeFi Power Features",
    description:
      "Go deeper for serious users with yield discovery, copy trading, and portfolio analytics.",
    points: [
      "Yield aggregation",
      "Copy smart-money wallets",
      "Win rate, ROI, and spend analytics",
    ],
    example: '"Stake my SOL in the best pool."',
    prompt:
      "Show me a DeFi operator brief: best staking or yield options for idle SOL, plus the analytics I should track for performance and risk.",
    gradient: "from-rose-500 to-pink-400",
  },
  {
    id: "ecosystem-integrations",
    icon: Globe,
    title: "Ecosystem Integrations",
    description:
      "Turn SolarkBot into the front door for swaps, staking, NFTs, perps, and future cross-chain flows.",
    points: [
      "Jupiter, Marinade, Jito",
      "Tensor and Magic Eden",
      "Bridge and multi-wallet support",
    ],
    example: '"Show my NFTs and their floor prices."',
    prompt:
      "Map the integrations I would need for swaps, staking, NFTs, perps, and cross-chain flows. Start with Jupiter, Marinade, Jito, Tensor, and Magic Eden.",
    gradient: "from-teal-500 to-green-400",
  },
  {
    id: "security-platform-ux",
    icon: Shield,
    title: "Security, Platform, and UX",
    description:
      "Ship the trust layer and power-user surface that makes the product sticky and safe to use daily.",
    points: [
      "Simulation mode and scam detection",
      "Plugins, SDK, and referral loops",
      "Voice mode, shortcuts, and chat templates",
    ],
    example: '"Hey Solark, swap 1 SOL."',
    prompt:
      "Outline the trust-first flow for a risky wallet action. Include simulation mode, scam checks, plugin hooks, and fast voice or shortcut entrypoints.",
    gradient: "from-slate-300 to-zinc-100",
  },
];

export const operatorTemplates: OperatorTemplate[] = [
  {
    id: "wallet-brief",
    icon: BarChart3,
    title: "Wallet Brief",
    category: "Portfolio",
    description: "Start with exposure, concentration, and the positions that deserve attention.",
    prompt:
      "Give me an operator brief for my wallet. Prioritize exposure, concentration, and the first positions or risks I should care about.",
  },
  {
    id: "transaction-review",
    icon: FileText,
    title: "Transaction Review",
    category: "Explain",
    description: "Break down swaps, fees, slippage, and post-trade state in plain language.",
    prompt:
      "Explain a Solana transaction like an operator review. I want route, expected output, fees, slippage, and after-state in simple language.",
  },
  {
    id: "memory-profile",
    icon: Brain,
    title: "Memory Profile",
    category: "Preferences",
    description: "Capture favorite tokens, saved recipients, and low-risk defaults.",
    prompt:
      "Create a reusable preference profile for me with favorite tokens, frequent recipients, and conservative slippage defaults.",
  },
  {
    id: "automation-plan",
    icon: Bell,
    title: "Automation Plan",
    category: "Alerts",
    description: "Define rules for price alerts, recurring buys, and exit conditions.",
    prompt:
      "Design an automation plan for my wallet with price alerts, recurring buys, and auto-exit rules that keep risk controlled.",
  },
  {
    id: "execution-runbook",
    icon: Workflow,
    title: "Execution Runbook",
    category: "Strategy",
    description: "Turn one instruction into a safe multi-step task sequence.",
    prompt:
      "Turn this into an execution runbook: swap SOL to USDC, send it to Alice, and list the checks I should confirm before signing.",
  },
  {
    id: "defi-scout",
    icon: Target,
    title: "DeFi Scout",
    category: "Yield",
    description: "Compare staking, yield, copy-trading, and analytics opportunities.",
    prompt:
      "Act like a DeFi scout. Compare the best places to park idle SOL, note the tradeoffs, and tell me which analytics matter most.",
  },
  {
    id: "ecosystem-map",
    icon: Bot,
    title: "Ecosystem Map",
    category: "Integrations",
    description: "Frame the product around swaps, NFTs, perps, bridges, and multi-wallet flows.",
    prompt:
      "Map the next operator workflows for SolarkBot across swaps, staking, NFTs, perps, bridge flows, and multi-wallet support.",
  },
  {
    id: "trust-layer",
    icon: Sparkles,
    title: "Trust Layer",
    category: "Security",
    description: "Center simulation, scam detection, plugins, and fast-access UX.",
    prompt:
      "Design a trust-first wallet UX with simulation mode, scam detection, plugin hooks, chat templates, and a voice command layer.",
  },
];

export const operatorTrustLayers = [
  "Explain the action before the user signs anything.",
  "Carry forward token, recipient, and risk preferences into repeat flows.",
  "Treat simulation, scam checks, and approval review as default steps.",
];

export const operatorSurfaceHighlights = [
  "8 roadmap tracks surfaced inside the product workspace",
  "Prompt starters for portfolio, automation, execution, and trust flows",
  "One source of truth shared by marketing and in-app onboarding",
];

export const ecosystemTrackChips = [
  "Jupiter",
  "Marinade",
  "Jito",
  "Tensor",
  "Magic Eden",
  "Perps",
  "Bridge",
  "Multi-wallet",
];
