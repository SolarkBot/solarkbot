import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Bot,
  ChevronRight,
  Coins,
  Globe,
  MessageSquare,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { isLucidAgentsEnabled } from "@/lib/features";

export const metadata: Metadata = {
  title: "Create Lucid Agents | SolarkBot",
  description:
    "Build hosted Lucid agents with xgate MCP, reusable skills, and natural language prompts.",
};

const flow = [
  {
    step: "01",
    title: "Set up your AI",
    description:
      "Use Claude Code, Claude CLI, or Cursor as the coding agent that writes the Lucid handler and calls MCP tools for you.",
  },
  {
    step: "02",
    title: "Connect xgate MCP",
    description:
      "Open the xgate frontend, connect your wallet with SIWE, and copy the MCP URL and session token into your client config.",
  },
  {
    step: "03",
    title: "Install the skill",
    description:
      "Add the lucid-agent-creator skill so your AI knows the JS handler contract, create_lucid_agent tool, and paid entrypoint setup rules.",
  },
  {
    step: "04",
    title: "Prompt your AI",
    description:
      "Ask for the agent in plain English. The AI writes the handler, prepares entrypoints, and calls create_lucid_agent through MCP.",
  },
  {
    step: "05",
    title: "Receive a hosted agent",
    description:
      "Lucid returns the created agent object with id, slug, invoke URL, and entrypoint metadata. No self-hosting or deploy step required.",
  },
];

const prompts = [
  "Create a Lucid agent that echoes input",
  "Create an agent that fetches weather by city",
  "Create a paid agent that processes data",
  "Create an agent with identityConfig stored for later registration",
];

const notes = [
  {
    icon: Globe,
    title: "Lucid API Base URL",
    description:
      "The MCP server already points at the Lucid API instance. Agents do not need to manage raw API endpoints themselves.",
  },
  {
    icon: Coins,
    title: "Paid Agents",
    description:
      "If you configure paid entrypoints, setup fees are paid from the xgate server wallet in USDC. That wallet needs enough balance.",
  },
  {
    icon: Shield,
    title: "Identity Registration",
    description:
      "identityConfig can be stored now, but auto-registration needs an agent wallet and is typically completed later in the dashboard.",
  },
  {
    icon: Zap,
    title: "Network",
    description:
      "Agents created via MCP use the Base network flow described in the Lucid docs. Entrypoint-level network overrides are not accepted.",
  },
];

const troubleshooting = [
  {
    title: "Insufficient funds",
    description:
      "The xgate server wallet does not have enough USDC to pay the setup fee for a paid entrypoint.",
  },
  {
    title: "Agent slug already exists",
    description:
      "Choose a different slug and rerun create_lucid_agent with the updated identifier.",
  },
  {
    title: "Lucid API is unavailable",
    description:
      "The hosted Lucid API instance is currently down or unreachable. Retry once the service is healthy again.",
  },
  {
    title: "Invalid JavaScript code",
    description:
      "The generated handler has syntax or contract issues. Fix the JS and retry the MCP tool invocation.",
  },
  {
    title: "Validation failed",
    description:
      "Your input schema or entrypoint definition is malformed. Review the returned validation errors and tighten the payload.",
  },
];

const quickFacts = [
  "Hosted instantly on the Lucid platform",
  "MCP-driven flow through xgate",
  "Reusable skill for handlers and entrypoints",
  "Supports PaymentsConfig and identityConfig guidance",
];

function CodeBlock({
  label,
  code,
}: {
  label: string;
  code: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-black/40 shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
      </div>
      <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function AgentsPage() {
  if (!isLucidAgentsEnabled()) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader currentPath="/agents" />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-solana-green/10 blur-[120px]" />
          <div className="absolute right-0 top-0 h-[26rem] w-[26rem] rounded-full bg-amber-400/10 blur-[130px]" />
          <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-solana-purple/15 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 sm:pb-28 sm:pt-24">
          <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-1.5 text-sm text-amber-100">
                <Bot className="h-3.5 w-3.5" />
                Create agents with agents
              </div>

              <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
                Ship a{" "}
                <span className="bg-gradient-to-r from-amber-200 via-white to-solana-green bg-clip-text text-transparent">
                  hosted Lucid agent
                </span>{" "}
                without touching deploy infrastructure.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Use xgate MCP, the Lucid skill, and a coding agent like Claude or
                Cursor to turn a plain-English prompt into a live hosted agent with
                an invoke URL.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link href="#flow">
                  <Button variant="solana" size="lg" className="group gap-2 px-8">
                    See the flow
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="gap-2 px-8" asChild>
                  <a href="https://xgate.run" target="_blank" rel="noopener noreferrer">
                    Open xgate
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {quickFacts.map((fact) => (
                  <div
                    key={fact}
                    className="rounded-2xl border border-border/50 bg-card/40 px-4 py-4 text-sm text-foreground/90 backdrop-blur-sm"
                  >
                    {fact}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <CodeBlock
                label="CLI Quickstart"
                code={`bunx @lucid-agents/cli my-agent`}
              />
              <CodeBlock
                label="Tool Result"
                code={`{\n  "id": "ag_771fc5c2081e",\n  "slug": "test-echo-fixed",\n  "invokeUrl": "https://lucid-dev.daydreams.systems/agents/{id}/entrypoints/{key}/invoke"\n}`}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border/40 bg-card/20">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl">What you get</CardTitle>
                <CardDescription>
                  A working hosted agent on the Lucid platform, created by your AI through MCP.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm leading-7 text-muted-foreground">
                <p>
                  You describe the agent you want. Your coding agent writes the
                  JavaScript handler, calls <code>create_lucid_agent</code>, and
                  returns the agent object.
                </p>
                <p>
                  There is no separate self-hosting step, no extra deployment pipeline,
                  and no manual platform setup beyond configuring xgate MCP and
                  installing the skill.
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-300/20 bg-gradient-to-br from-amber-200/10 via-card/70 to-solana-green/10">
              <CardHeader>
                <CardTitle className="text-2xl">Prompt examples</CardTitle>
                <CardDescription>
                  Natural language requests that the AI can translate into a Lucid handler.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {prompts.map((prompt) => (
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
        </div>
      </section>

      <section id="flow" className="relative py-24">
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-solana-purple/10 blur-[120px]" />
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              The end-to-end creation flow
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Configure the bridge once, then let your AI handle agent code generation and MCP invocation.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-5">
            {flow.map((item) => (
              <Card
                key={item.step}
                className="relative overflow-hidden border-border/50 bg-card/55 backdrop-blur-sm"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300 via-solana-purple to-solana-green" />
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border/50 bg-background text-sm font-bold text-amber-200">
                    {item.step}
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-muted-foreground">
                  {item.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/40 bg-card/20 py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Configure xgate MCP
              </h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                The standard path is to use the xgate frontend, connect your wallet with SIWE,
                and drop the provided MCP URL and bearer token into your AI client.
              </p>
            </div>

            <CodeBlock
              label="MCP Config"
              code={`{\n  "mcpServers": {\n    "xgate": {\n      "url": "<xgate-mcp-url>",\n      "headers": {\n        "Authorization": "Bearer <session-token>"\n      }\n    }\n  }\n}`}
            />
          </div>

          <div className="grid gap-5">
            <Card className="border-border/50 bg-card/60">
              <CardHeader>
                <CardTitle className="text-xl">Claude Code / Claude CLI</CardTitle>
                <CardDescription>
                  Use the marketplace to install the Lucid agent creator skill.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  label="Claude"
                  code={`/plugin marketplace add daydreamsai/skills-market\n/plugin install lucid-agent-creator@daydreams-skills`}
                />
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/60">
              <CardHeader>
                <CardTitle className="text-xl">Cursor or manual install</CardTitle>
                <CardDescription>
                  Copy the skill into your project and optionally pull the companion guide too.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock
                  label="Skill"
                  code={`mkdir -p .claude/skills/lucid-agent-creator && \\\ncurl -fsSL https://raw.githubusercontent.com/daydreamsai/skills-market/main/plugins/lucid-agent-creator/skills/SKILL.md \\\n  -o .claude/skills/lucid-agent-creator/SKILL.md`}
                />
                <CodeBlock
                  label="Optional Guide"
                  code={`curl -fsSL https://raw.githubusercontent.com/daydreamsai/skills-market/main/plugins/lucid-agent-creator/GUIDE.md \\\n  -o .claude/skills/lucid-agent-creator/GUIDE.md`}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="absolute left-0 top-10 h-80 w-80 rounded-full bg-solana-green/10 blur-[110px]" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-solana-purple/20 bg-solana-purple/10 px-4 py-2 text-sm text-solana-purple">
              <MessageSquare className="h-4 w-4" />
              What the skill teaches
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Handler contract, payments, identity, and tool invocation
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              The lucid-agent-creator skill gives your AI the shape of the JavaScript handler,
              the create_lucid_agent call contract, how to wire PaymentsConfig for paid agents,
              and how to store identityConfig when agent-wallet setup happens later.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Card className="border-border/50 bg-card/60">
              <CardHeader>
                <CardTitle className="text-lg">Handler essentials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
                <p>Write the JavaScript handler in the expected Lucid contract.</p>
                <p>Return typed entrypoints and keep the handler syntax valid.</p>
                <p>
                  Include <code>allowedHosts</code> when external fetch access is needed.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/60">
              <CardHeader>
                <CardTitle className="text-lg">Payments and auth</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
                <p>Use PaymentsConfig when an entrypoint should be paid.</p>
                <p>The xgate server wallet handles setup-payment and payment-as-auth.</p>
                <p>Paid entrypoints need sufficient USDC in that wallet.</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/60">
              <CardHeader>
                <CardTitle className="text-lg">Identity config</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
                <p>identityConfig can be included with <code>autoRegister</code>.</p>
                <p>Auto-registration waits until an agent wallet is configured later.</p>
                <p>You can complete that step in the Lucid dashboard afterward.</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/60">
              <CardHeader>
                <CardTitle className="text-lg">Result payload</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
                <p>The MCP tool returns the agent object directly to your AI session.</p>
                <p>
                  Important fields include <code>id</code>, <code>slug</code>, and{" "}
                  <code>invokeUrl</code>.
                </p>
                <p>No extra hosting or deployment step is required after creation.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-y border-border/40 bg-card/20 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Operational notes
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              These are the practical constraints and expectations that matter once you move from prompt to created agent.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {notes.map((note) => (
              <Card key={note.title} className="border-border/50 bg-card/55 backdrop-blur-sm">
                <CardHeader>
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-solana-purple/10 text-solana-purple">
                    <note.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-muted-foreground">
                  {note.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Troubleshooting
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              The common Lucid creation failures are operational, not mysterious. Here is the shortlist to keep close.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {troubleshooting.map((item) => (
              <Card key={item.title} className="border-border/50 bg-card/55">
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-muted-foreground">
                  {item.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-border/40 py-24">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-64 w-full max-w-3xl -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-300/20 via-solana-purple/20 to-solana-green/20 blur-[90px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <Logo
            size={56}
            className="mx-auto mb-6 drop-shadow-[0_0_24px_rgba(153,69,255,0.35)]"
          />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to build a Lucid agent from a prompt?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Connect xgate MCP, install the skill, and let your coding agent turn requirements into a hosted endpoint.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button variant="solana" size="lg" className="gap-2 px-10" asChild>
              <a href="https://xgate.run" target="_blank" rel="noopener noreferrer">
                Open xgate
                <ArrowRight className="h-4 w-4" />
              </a>
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
