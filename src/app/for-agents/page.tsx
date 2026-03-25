import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  ChevronRight,
  Command,
  Compass,
  KeyRound,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Wallet,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import {
  agentRelatedSurfaces,
  agentExamplePrompts,
  getAgentBaseUrl,
  agentGuardrails,
  agentPlatformSkills,
  agentWorkflow,
  getAgentInstructionText,
} from "@/lib/agent-guide";

export const metadata: Metadata = {
  title: "For AI Agents | SolarkBot",
  description:
    "Instructions for AI agents and operators using SolarkBot's Solana-native chat platform.",
};

const agentInstructionPreview = getAgentInstructionText(getAgentBaseUrl());

export default function ForAgentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader currentPath="/for-agents" />

      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 h-[30rem] w-[30rem] rounded-full bg-solana-green/10 blur-[140px]" />
          <div className="absolute right-0 top-10 h-[26rem] w-[26rem] rounded-full bg-amber-300/10 blur-[130px]" />
          <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-solana-purple/15 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 sm:pb-28 sm:pt-24">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-solana-green/20 bg-solana-green/10 px-4 py-1.5 text-sm text-solana-green">
                <Bot className="h-3.5 w-3.5" />
                Operator handbook for humans and AI agents
              </div>

              <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
                Use SolarkBot like an{" "}
                <span className="bg-gradient-to-r from-solana-green via-white to-amber-200 bg-clip-text text-transparent">
                  onchain copiloting agent
                </span>
                .
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                This page teaches another AI, an operator, or a power user how to work
                inside SolarkBot. It explains the supported skills, the safe operating
                flow, and the rules for clean wallet replies.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link href="/chat">
                  <Button variant="solana" size="lg" className="group gap-2 px-8">
                    Open Chat Workspace
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="gap-2 px-8" asChild>
                  <Link href="/for-agents/instructions">
                    Plain-Text Instructions
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  "Chat-first Solana workflow",
                  "Built-in wallet and market skills",
                  "Human approval for every transaction",
                ].map((fact) => (
                  <div
                    key={fact}
                    className="rounded-2xl border border-border/50 bg-card/40 px-4 py-4 text-sm text-foreground/90 backdrop-blur-sm"
                  >
                    {fact}
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-[30px] border border-border/60 bg-[#080b11]/90 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  If You Are An AI Agent
                </span>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
              </div>
              <div className="space-y-4 px-5 py-5">
                {[
                  "Open /chat and wait for wallet connection.",
                  "Use the connected wallet as the default wallet for self-queries.",
                  "Prefer token names and symbols over contract addresses.",
                  "Only show CA or mint addresses when the user explicitly asks.",
                  "Prepare transfers and swaps, but leave final approval to the user's wallet.",
                ].map((line) => (
                  <div
                    key={line}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-foreground/90"
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="absolute right-0 top-12 h-96 w-96 rounded-full bg-solana-purple/10 blur-[120px]" />
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Platform skills an AI agent can use
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Think of these as SolarkBot&apos;s built-in capabilities. Another AI does not need to wire extra tools first.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {agentPlatformSkills.map((skill, index) => {
              const iconMap = [Wallet, Sparkles, Compass, Waves, Command, MessageSquareText, ShieldCheck];
              const Icon = iconMap[index % iconMap.length];

              return (
                <Card
                  key={skill.name}
                  className="group overflow-hidden border-border/50 bg-card/55 backdrop-blur-sm"
                >
                  <div className="h-1 bg-gradient-to-r from-solana-green via-amber-200 to-solana-purple" />
                  <CardHeader>
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-solana-green/10 text-solana-green">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">{skill.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
                    <p>{skill.description}</p>
                    <div className="rounded-2xl border border-border/50 bg-background/60 px-4 py-3 font-mono text-xs text-foreground/90">
                      &quot;{skill.prompt}&quot;
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-border/40 bg-card/20 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Related product surfaces
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              These URLs are companion SolarkBot destinations. They are useful to know about, but they are not native skills inside the chat workspace.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {agentRelatedSurfaces.map((surface) => {
              const Icon = surface.id === "nft" ? Sparkles : Compass;

              return (
                <Card
                  key={surface.id}
                  className="overflow-hidden border-border/50 bg-card/55 backdrop-blur-sm"
                >
                  <div className="h-1 bg-gradient-to-r from-solana-green via-amber-200 to-solana-purple" />
                  <CardHeader>
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-solana-green/10 text-solana-green">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">{surface.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
                    <p>{surface.description}</p>
                    <div className="rounded-2xl border border-border/50 bg-background/60 px-4 py-3 font-mono text-xs text-foreground/90">
                      {surface.displayUrl}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-border/40 bg-card/20 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Recommended operating flow
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              This is the safest, most reliable way for an AI operator to use the platform.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {agentWorkflow.map((item) => (
              <Card key={item.step} className="border-border/50 bg-card/60 backdrop-blur-sm">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border/50 bg-background text-sm font-bold text-amber-200">
                    {item.step}
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-muted-foreground">
                  {item.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-amber-200/10 blur-[140px]" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-solana-purple/20 bg-solana-purple/10 px-4 py-2 text-sm text-solana-purple">
              <KeyRound className="h-4 w-4" />
              Instruction block for agents
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Give another AI this exact operating context
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              The plain-text version is designed for copy-paste or direct machine access. It explains what SolarkBot can do and how an agent should behave.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button variant="solana" size="lg" className="gap-2 px-8" asChild>
                <Link href="/for-agents/instructions">
                  Open Agent Instructions
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="gap-2 px-8" asChild>
                <Link href="/chat">
                  Use the Platform
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-border/60 bg-[#05070d] shadow-[0_32px_110px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                Plain-Text Instruction Pack
              </span>
              <Logo size={26} />
            </div>
            <pre className="overflow-x-auto px-5 py-5 text-xs leading-7 text-emerald-100">
              <code>{agentInstructionPreview}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="border-y border-border/40 bg-card/20 py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2">
          <Card className="border-border/50 bg-card/60">
            <CardHeader>
              <CardTitle className="text-2xl">Safety and output rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
              {agentGuardrails.map((rule) => (
                <div
                  key={rule}
                  className="rounded-2xl border border-border/40 bg-background/60 px-4 py-3 text-foreground/90"
                >
                  {rule}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-solana-green/10 via-card/70 to-amber-200/10">
            <CardHeader>
              <CardTitle className="text-2xl">Prompt patterns that work well</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {agentExamplePrompts.map((prompt) => (
                <div
                  key={prompt}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-foreground/90"
                >
                  &quot;{prompt}&quot;
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-64 w-full max-w-3xl -translate-x-1/2 rounded-full bg-gradient-to-r from-solana-green/20 via-solana-purple/20 to-amber-200/20 blur-[90px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <Logo
            size={56}
            className="mx-auto mb-6 drop-shadow-[0_0_24px_rgba(20,241,149,0.25)]"
          />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            One link for humans. One link for agents.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Send operators to this page, or send another agent straight to the plain-text instruction pack.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button variant="solana" size="lg" className="gap-2 px-10" asChild>
              <Link href="/for-agents/instructions">
                Open Plain Text
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="gap-2 px-10" asChild>
              <Link href="/chat">
                Launch SolarkBot
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
