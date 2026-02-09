"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import WalletButton from "@/components/wallet/WalletButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import {
  Wallet,
  Zap,
  Bot,
  ArrowRight,
  Shield,
  Globe,
  TrendingUp,
  MessageSquare,
  Coins,
  Search,
  Send,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Wallet Auth (SIWS)",
    description:
      "Sign in with your Solana wallet. No passwords, no emails — your keypair is your identity.",
    gradient: "from-solana-purple to-indigo-500",
  },
  {
    icon: Zap,
    title: "x402 Micropayments",
    description:
      "Pay per message with USDC on Solana. Sub-cent AI interactions via the x402 protocol.",
    gradient: "from-solana-green to-emerald-400",
  },
  {
    icon: Bot,
    title: "Autonomous Agent",
    description:
      "AI that takes action — checks balances, swaps tokens, resolves .sol domains, and more.",
    gradient: "from-amber-500 to-orange-400",
  },
  {
    icon: Shield,
    title: "Non-Custodial",
    description:
      "Your keys, your coins. Transactions are prepared by the agent but signed only by you.",
    gradient: "from-rose-500 to-pink-400",
  },
  {
    icon: Globe,
    title: "Devnet & Mainnet",
    description:
      "Test safely on devnet or go live on mainnet. One toggle to switch between networks.",
    gradient: "from-sky-500 to-cyan-400",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Prices",
    description:
      "Live token prices, DeFi positions, and transaction history — always up to date.",
    gradient: "from-violet-500 to-purple-400",
  },
];

const tools = [
  { icon: Search, label: "Check Balance", example: "What's my SOL balance?" },
  { icon: TrendingUp, label: "Token Prices", example: "Price of BONK?" },
  { icon: Send, label: "Send Tokens", example: "Send 0.1 SOL to alice.sol" },
  { icon: Coins, label: "Swap Tokens", example: "Swap 1 SOL to USDC" },
  { icon: Globe, label: "Resolve .sol", example: "Who owns toly.sol?" },
  { icon: MessageSquare, label: "DeFi Positions", example: "My staking positions?" },
];

const stats = [
  { value: "7", label: "Agent Tools" },
  { value: "<1s", label: "Tx Finality" },
  { value: "$0.001", label: "Per Message" },
  { value: "24/7", label: "Always On" },
];

function TypewriterText({ texts }: { texts: string[] }) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[index];
    const speed = isDeleting ? 30 : 60;

    if (!isDeleting && displayed === current) {
      const timeout = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayed === "") {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayed(
        isDeleting
          ? current.slice(0, displayed.length - 1)
          : current.slice(0, displayed.length + 1)
      );
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, index, texts]);

  return (
    <span className="text-solana-green">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <Logo size={32} />
            <span className="text-lg font-bold tracking-tight">SolarkBot</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/chat" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Launch App
              </Button>
            </Link>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-solana-purple/20 blur-[120px]" />
          <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-solana-green/15 blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-solana-purple/10 blur-[100px]" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 sm:pb-32 sm:pt-28">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-solana-purple/30 bg-solana-purple/10 px-4 py-1.5 text-sm text-solana-purple">
              <Zap className="h-3.5 w-3.5" />
              Powered by Solana + AI
            </div>

            {/* Logo */}
            <div className="mb-8">
              <Logo size={80} className="drop-shadow-[0_0_30px_rgba(153,69,255,0.4)]" />
            </div>

            {/* Title */}
            <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
              <span className="bg-gradient-to-r from-solana-purple via-white to-solana-green bg-clip-text text-transparent">
                SolarkBot
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Your crypto-native AI assistant on Solana.
              <br className="hidden sm:block" />
              Chat, trade, and manage your wallet with natural language.
            </p>

            {/* Typewriter */}
            <div className="mt-6 h-8 font-mono text-sm sm:text-base">
              <TypewriterText
                texts={[
                  "What's my SOL balance?",
                  "Swap 1 SOL to USDC",
                  "Check the price of BONK",
                  "Resolve toly.sol",
                  "Send 0.5 SOL to alice.sol",
                  "Show my DeFi positions",
                ]}
              />
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <Link href="/chat">
                <Button
                  variant="solana"
                  size="lg"
                  className="group gap-2 px-8 text-base shadow-[0_0_30px_rgba(153,69,255,0.3)] transition-shadow hover:shadow-[0_0_40px_rgba(153,69,255,0.5)]"
                >
                  Launch App
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="gap-2 text-base" asChild>
                <a
                  href="https://github.com/SolarkBot"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Source
                  <ChevronRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/40 bg-card/30">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-10 sm:grid-cols-4 sm:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="bg-gradient-to-br from-solana-purple to-solana-green bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute -right-60 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-solana-purple/10 blur-[100px]" />
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for{" "}
              <span className="bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
                Web3 Natives
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Everything you need to interact with Solana through conversational AI.
              No dashboards, no complex UIs — just ask.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-solana-purple/40 hover:shadow-[0_0_30px_rgba(153,69,255,0.1)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-solana-purple/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <CardContent className="relative p-6">
                  <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Tools Showcase */}
      <section className="border-y border-border/40 bg-card/20 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What Can{" "}
              <span className="bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
                SolarkBot
              </span>{" "}
              Do?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              7 built-in tools that let you manage your Solana wallet through natural conversation.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <div
                key={tool.label}
                className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-4 transition-all hover:border-solana-purple/30 hover:bg-card"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-solana-purple/10 transition-colors group-hover:bg-solana-purple/20">
                  <tool.icon className="h-5 w-5 text-solana-purple" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{tool.label}</div>
                  <div className="truncate font-mono text-xs text-muted-foreground">
                    &quot;{tool.example}&quot;
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24">
        <div className="absolute -left-40 top-1/3 h-64 w-64 rounded-full bg-solana-green/10 blur-[100px]" />
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Get Started in{" "}
              <span className="bg-gradient-to-r from-solana-green to-solana-purple bg-clip-text text-transparent">
                3 Steps
              </span>
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Connect Wallet",
                description: "Link your Phantom, Solflare, or Coinbase wallet.",
              },
              {
                step: "02",
                title: "Sign In",
                description: "Authenticate with SIWS — one signature, zero passwords.",
              },
              {
                step: "03",
                title: "Start Chatting",
                description: "Ask anything about Solana. The agent handles the rest.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-card text-2xl font-bold text-solana-purple">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border/40 py-24">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-64 w-full max-w-2xl -translate-x-1/2 rounded-full bg-gradient-to-r from-solana-purple/20 to-solana-green/20 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-2xl px-4 text-center">
          <Logo size={56} className="mx-auto mb-6 drop-shadow-[0_0_20px_rgba(153,69,255,0.3)]" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to chat with Solana?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Connect your wallet and start your first conversation — 10 free messages per day.
          </p>
          <div className="mt-8">
            <Link href="/chat">
              <Button
                variant="solana"
                size="lg"
                className="group gap-2 px-10 text-base shadow-[0_0_30px_rgba(153,69,255,0.3)] transition-shadow hover:shadow-[0_0_40px_rgba(153,69,255,0.5)]"
              >
                Launch App
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Logo size={20} />
            <span className="text-sm font-medium">SolarkBot</span>
          </Link>
          <p className="text-center text-xs text-muted-foreground">
            Built on Solana. Powered by AI. Open source.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/chat" className="transition-colors hover:text-foreground">
              App
            </Link>
            <a href="https://github.com/SolarkBot" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">
              GitHub
            </a>
            <a href="https://x.com/solarkbot" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">
              X
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
