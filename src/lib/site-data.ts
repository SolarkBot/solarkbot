import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Boxes,
  Braces,
  CandlestickChart,
  Github,
  Orbit,
  Palette,
  Radar,
  Rocket,
  Sparkles,
  UtilityPole,
} from "lucide-react";

type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const contractAddress = "HP2fUgqcZ8WTir7Ht53r1WwDJVDv9M82K5YUefvApump";

export const navLinks: NavLink[] = [
  { label: "Home", href: "#top" },
  { label: "Products", href: "#products" },
  { label: "Ecosystem", href: "#ecosystem" },
  { label: "GitHub", href: "https://github.com/SolarkBot", external: true },
  { label: "X", href: "https://x.com/solarkbot", external: true },
];

export const heroLinks = {
  dex: "https://dex.solarkbot.xyz/",
  nft: "https://nft.solarkbot.xyz/",
  github: "https://github.com/SolarkBot",
  x: "https://x.com/solarkbot",
};

export const heroStats = [
  { value: "02", label: "Live products" },
  { value: "01", label: "Brand universe" },
  { value: "∞", label: "Playful on-chain directions" },
] as const;

export const featuredProducts = [
  {
    title: "Solark DEX",
    subtitle: "Swap through a living market",
    description:
      "Token exchange built to feel visual, kinetic, and more alive than a static form stack.",
    href: heroLinks.dex,
    cta: "Open DEX",
    badge: "Live now",
    accent: "from-[#74f8d3]/40 via-[#8ea8ff]/30 to-transparent",
  },
  {
    title: "Solark NFT",
    subtitle: "Create inside an interactive studio",
    description:
      "A cinematic minting flow for generating visuals and turning creation into an experience.",
    href: heroLinks.nft,
    cta: "Open NFT Studio",
    badge: "Live now",
    accent: "from-[#ff9f66]/[0.35] via-[#8ea8ff]/20 to-transparent",
  },
  {
    title: "More Apps Incoming",
    subtitle: "A growing crypto playground",
    description:
      "SolarkBot is building more playful on-chain products across trading, creation, and experiments.",
    href: heroLinks.x,
    cta: "Follow the Journey",
    badge: "In motion",
    accent: "from-[#7be4ff]/30 via-[#74f8d3]/20 to-transparent",
  },
] as const;

export const valueProps: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: "Interactive First",
    description: "Every product should feel like an experience, not a control panel.",
    icon: Sparkles,
  },
  {
    title: "Crypto Native",
    description: "Built for traders, creators, collectors, and explorers who already live on-chain.",
    icon: Radar,
  },
  {
    title: "Designed with Personality",
    description: "Strong visuals, motion, and memorable flows replace anonymous dashboard tropes.",
    icon: Palette,
  },
  {
    title: "Growing Ecosystem",
    description: "DEX and NFT are only the opening portals in a larger product universe.",
    icon: Orbit,
  },
];

export const futureCards: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: "Launch Tools",
    description: "Sharper token and release experiences for projects that want more than plain utility.",
    icon: Rocket,
  },
  {
    title: "Creator Tools",
    description: "Interfaces for artists and builders who want on-chain creation to feel expressive.",
    icon: Palette,
  },
  {
    title: "Trading Experiences",
    description: "New ways to explore, route, and react to markets with more motion and context.",
    icon: CandlestickChart,
  },
  {
    title: "On-Chain Utilities",
    description: "Useful tools wrapped in cleaner interactions for daily crypto actions.",
    icon: UtilityPole,
  },
  {
    title: "Agent-Driven Apps",
    description: "Assistive products that make complex blockchain actions feel guided instead of rigid.",
    icon: Bot,
  },
  {
    title: "Interactive Experiments",
    description: "Smaller launches that test new mechanics, interfaces, and crypto-native play.",
    icon: Braces,
  },
];

export const signalCards = [
  {
    title: "2 Live Products",
    description: "DEX and NFT are already live, giving the ecosystem a real foundation today.",
    icon: Boxes,
  },
  {
    title: "Open Brand Presence",
    description: "Follow the build through GitHub and X as the brand keeps shipping publicly.",
    icon: Github,
  },
  {
    title: "More Apps Coming",
    description: "This homepage is an ecosystem hub, not a one-product landing page.",
    icon: Orbit,
  },
  {
    title: "Built for Web3 Natives",
    description: "Playful interfaces with real utility for on-chain users, not generic SaaS theatre.",
    icon: Sparkles,
  },
] as const;

export const footerLinks = [
  { label: "DEX", href: heroLinks.dex },
  { label: "NFT", href: heroLinks.nft },
  { label: "GitHub", href: heroLinks.github },
  { label: "X", href: heroLinks.x },
] as const;
