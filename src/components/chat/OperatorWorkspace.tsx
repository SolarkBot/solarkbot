"use client";

import { ArrowRight, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ecosystemTrackChips,
  operatorSurfaceHighlights,
  operatorTemplates,
  operatorTrustLayers,
  roadmapSignals,
  upcomingFeatureGroups,
} from "@/lib/product-roadmap";

interface OperatorWorkspaceProps {
  walletLabel?: string | null;
  networkLabel: string;
  onPromptSelect: (prompt: string) => void;
}

export function OperatorWorkspace({
  walletLabel,
  networkLabel,
  onPromptSelect,
}: OperatorWorkspaceProps) {
  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(153,69,255,0.22),transparent_60%)]" />
      <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-solana-green/10 blur-[120px]" />
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#050915] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_34%,transparent_72%,rgba(255,255,255,0.04))]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:88px_88px]" />
          <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-solana-purple/20 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-[120px]" />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-solana-green/20 bg-solana-green/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-solana-green">
                <Sparkles className="h-3.5 w-3.5" />
                Operator workspace
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {networkLabel}
              </div>
              {walletLabel ? (
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  {walletLabel}
                </div>
              ) : null}
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
              <div>
                <div className="flex items-center gap-4">
                  <Logo size={56} className="shrink-0 drop-shadow-[0_0_24px_rgba(153,69,255,0.35)]" />
                  <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                    Roadmap live in the app
                  </div>
                </div>
                <h2 className="mt-6 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
                  Build with the next version of SolarkBot before the backend catches up.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  The chat surface now reflects the upcoming product tracks: portfolio
                  intelligence, operator automation, DeFi execution, ecosystem integrations,
                  and trust-first wallet UX. Click any module to stage a prompt in the composer.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    variant="solana"
                    className="gap-2 rounded-xl px-5"
                    onClick={() =>
                      onPromptSelect(
                        "Give me an operator brief for my wallet. Prioritize exposure, concentration, and the first positions or risks I should care about."
                      )
                    }
                  >
                    Run operator brief
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl border-white/10 bg-white/[0.03] px-5 hover:bg-white/[0.06]"
                    onClick={() =>
                      onPromptSelect(
                        "Design an automation plan for my wallet with price alerts, recurring buys, and auto-exit rules that keep risk controlled."
                      )
                    }
                  >
                    Stage automation flow
                  </Button>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {roadmapSignals.map((signal) => (
                    <div
                      key={signal}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-medium text-foreground/90"
                    >
                      {signal}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <Card className="overflow-hidden rounded-[28px] border-white/10 bg-white/[0.04] shadow-none">
                  <CardContent className="p-0">
                    <div className="border-b border-white/10 px-5 py-4">
                      <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        Control board
                      </div>
                      <div className="mt-2 text-xl font-semibold">What is now inside the product surface</div>
                    </div>
                    <div className="grid gap-3 px-5 py-5">
                      {operatorSurfaceHighlights.map((highlight) => (
                        <div
                          key={highlight}
                          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm leading-6 text-foreground/90"
                        >
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[28px] border-white/10 bg-gradient-to-br from-solana-purple/10 via-white/[0.02] to-solana-green/10 shadow-none">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-solana-green" />
                      <div className="text-lg font-semibold">Trust defaults</div>
                    </div>
                    <div className="mt-4 grid gap-3">
                      {operatorTrustLayers.map((layer) => (
                        <div
                          key={layer}
                          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-foreground/90"
                        >
                          {layer}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="rounded-[28px] border-border/60 bg-card/55 shadow-none backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Wand2 className="h-5 w-5 text-solana-purple" />
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Prompt desk
                  </div>
                  <div className="mt-1 text-xl font-semibold">Stage roadmap prompts in one click</div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {operatorTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => onPromptSelect(template.prompt)}
                    className="group rounded-[24px] border border-border/60 bg-background/40 p-4 text-left transition-colors hover:border-solana-purple/40 hover:bg-background/70"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-solana-purple/12 p-2 text-solana-purple transition-colors group-hover:bg-solana-purple/20">
                        <template.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                          {template.category}
                        </div>
                        <div className="mt-1 text-base font-semibold">{template.title}</div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-border/60 bg-card/55 shadow-none backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Ecosystem scope
              </div>
              <div className="mt-2 text-xl font-semibold">
                The app is now framed around the product surfaces you listed
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Swaps, staking, NFTs, perps, bridges, and trust rails all appear in the
                workspace so the product direction is visible before full execution logic ships.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {ecosystemTrackChips.map((chip) => (
                  <div
                    key={chip}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-foreground/90"
                  >
                    {chip}
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  How to use it
                </div>
                <div className="mt-3 grid gap-3 text-sm leading-6 text-foreground/90">
                  <div>Pick a roadmap track below.</div>
                  <div>Click <span className="font-medium text-foreground">Use prompt</span> to stage a starter command.</div>
                  <div>Refine it in the composer, then send it into the conversation.</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          {upcomingFeatureGroups.map((item) => (
            <Card
              key={item.id}
              className="group relative overflow-hidden rounded-[28px] border-border/60 bg-card/55 shadow-none backdrop-blur-sm"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.gradient}`} />
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardContent className="relative flex h-full flex-col p-6">
                <div className="flex items-start gap-4">
                  <div className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                      Roadmap track
                    </div>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {item.points.map((point) => (
                    <div
                      key={point}
                      className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/35 px-4 py-3 text-sm text-foreground/90"
                    >
                      <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${item.gradient}`} />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[22px] border border-white/10 bg-black/20 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Example
                  </div>
                  <div className="mt-2 font-mono text-sm text-solana-green">{item.example}</div>
                </div>

                <div className="mt-6">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                    onClick={() => onPromptSelect(item.prompt)}
                  >
                    Use prompt
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}
