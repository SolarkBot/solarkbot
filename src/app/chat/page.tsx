"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import SignInButton from "@/components/wallet/SignInButton";
import WalletButton from "@/components/wallet/WalletButton";
import { authClient, signOut } from "@/lib/auth/client";
import { formatSOL, truncateAddress } from "@/lib/utils";
import {
  Activity,
  ArrowUpRight,
  Bot,
  ChevronRight,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  ShieldCheck,
  Sparkles,
  Wallet,
  Wifi,
  X,
} from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

interface RuntimeConfigIssue {
  id: string;
  severity: "error" | "warning";
  scope: string;
  message: string;
}

const OFFICIAL_CA = "HP2fUgqcZ8WTir7Ht53r1WwDJVDv9M82K5YUefvApump";

export default function ChatPage() {
  const { data: authSession, isPending } = authClient.useSession();
  const router = useRouter();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [chatResetKey, setChatResetKey] = useState(0);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [network, setNetwork] = useState<"devnet" | "mainnet-beta">("devnet");
  const [configIssues, setConfigIssues] = useState<RuntimeConfigIssue[]>([]);
  const isAuthenticated = Boolean(authSession?.session && authSession?.user);

  const walletAddress = publicKey?.toBase58() ?? null;
  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [activeConversationId, conversations]
  );

  useEffect(() => {
    if (!publicKey || !connection) return;
    const currentPublicKey = publicKey;

    let cancelled = false;

    async function fetchBalance() {
      try {
        const balance = await connection.getBalance(currentPublicKey);
        if (!cancelled) setSolBalance(balance);
      } catch {
        // Ignore transient balance fetch failures.
      }
    }

    fetchBalance();
    const interval = setInterval(fetchBalance, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [publicKey, connection]);

  useEffect(() => {
    const endpoint = connection.rpcEndpoint;
    setNetwork(endpoint.includes("mainnet") ? "mainnet-beta" : "devnet");
  }, [connection]);

  const refreshConversations = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const res = await fetch("/api/chat/conversations");
      if (!res.ok) return;

      const data = await res.json();
      setConversations(data);
    } catch {
      // Conversations API may not be available yet.
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    if (isAuthenticated) {
      setConfigIssues([]);
      return;
    }

    let cancelled = false;

    async function loadConfigIssues() {
      try {
        const response = await fetch("/api/health/config", {
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = await response.json();
        if (!cancelled) {
          setConfigIssues(Array.isArray(payload?.issues) ? payload.issues : []);
        }
      } catch {
        if (!cancelled) {
          setConfigIssues([]);
        }
      }
    }

    loadConfigIssues();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  function handleNewConversation() {
    setActiveConversationId(null);
    setChatResetKey((current) => current + 1);
    setSidebarOpen(false);
  }

  function handleConversationCreated(id: string) {
    setActiveConversationId(id);
    refreshConversations();
  }

  function handleSelectConversation(id: string) {
    setActiveConversationId(id);
    setSidebarOpen(false);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  if (isPending) {
    return (
      <ShellFrame>
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4 rounded-[28px] border border-white/10 bg-white/5 px-8 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-solana-green/70 border-t-transparent" />
            <p className="font-display text-sm uppercase tracking-[0.3em] text-white/75">
              Loading cockpit
            </p>
          </div>
        </div>
      </ShellFrame>
    );
  }

  if (!isAuthenticated) {
    return (
      <ShellFrame>
        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid w-full gap-8 lg:grid-cols-[1.05fr,0.95fr]">
            <section className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-solana-green/80 backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5" />
                Solana Mission Control
              </div>
              <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[0.95] text-white sm:text-5xl lg:text-6xl">
                Wallet-native AI, staged like a command deck instead of a form.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
                SolarkBot can inspect balances, surface wallet activity, explain transaction intent,
                and prepare onchain actions without forcing the interface to feel flat or generic.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <InfoTile
                  icon={Wallet}
                  label="Wallet aware"
                  value={publicKey ? truncateAddress(publicKey.toBase58()) : "Connect to begin"}
                />
                <InfoTile
                  icon={Activity}
                  label="Chain mode"
                  value={network === "mainnet-beta" ? "Mainnet live" : "Devnet sandbox"}
                />
                <InfoTile
                  icon={ShieldCheck}
                  label="Verified CA"
                  value="Official token pinned"
                />
              </div>

              <div className="mt-8 rounded-[30px] border border-solana-green/20 bg-[linear-gradient(135deg,rgba(20,241,149,0.14),rgba(10,15,24,0.35))] p-6 shadow-[0_18px_60px_rgba(20,241,149,0.08)] backdrop-blur-xl">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-solana-green/85">
                  <ShieldCheck className="h-4 w-4" />
                  Official contract address
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">
                  Treat any other contract address as unofficial. Verify it independently before
                  approving trades, transfers, or links.
                </p>
                <div className="mt-4 break-all rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-mono text-sm text-solana-green shadow-inner shadow-black/30">
                  {OFFICIAL_CA}
                </div>
                <Link
                  href="/for-agents"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white/75 transition hover:text-white"
                >
                  Read the operator guide
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </section>

            <section className="relative">
              <div className="absolute inset-0 rounded-[34px] bg-[radial-gradient(circle_at_top,rgba(153,69,255,0.18),transparent_60%)] blur-3xl" />
              <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,18,30,0.96),rgba(8,10,16,0.84))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/10 bg-white/6 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                      <Logo size={34} />
                    </div>
                    <div>
                      <p className="font-display text-2xl text-white">SolarkBot</p>
                      <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">
                        Secure Access
                      </p>
                    </div>
                  </Link>
                  <NetworkBadge network={network} />
                </div>

                <div className="mt-10">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-solana-green/80">
                    Sign in to continue
                  </p>
                  <h2 className="mt-3 font-display text-3xl text-white">
                    Open your wallet and launch the chat surface.
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-white/65">
                    Authentication stays anchored to your Solana wallet. Once signed in, you can
                    create conversations, inspect wallet context, and route requests through the
                    assistant.
                  </p>
                </div>

                {configIssues.length > 0 && (
                  <div className="mt-8 rounded-[26px] border border-amber-400/25 bg-amber-400/10 p-5">
                    <p className="text-[11px] uppercase tracking-[0.32em] text-amber-200">
                      Setup needs attention
                    </p>
                    <div className="mt-3 space-y-2">
                      {configIssues.map((issue) => (
                        <p
                          key={issue.id}
                          className={`text-sm leading-6 ${
                            issue.severity === "error" ? "text-amber-50" : "text-amber-100/80"
                          }`}
                        >
                          {issue.severity === "error" ? "Error: " : "Warning: "}
                          {issue.message}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 rounded-[28px] border border-white/10 bg-black/25 p-5 shadow-inner shadow-black/30">
                  <div className="flex flex-col gap-4">
                    {!publicKey ? <WalletButton /> : <SignInButton />}
                    {publicKey && (
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white/80">
                        Connected: {truncateAddress(publicKey.toBase58())}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </ShellFrame>
    );
  }

  return (
    <ShellFrame>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="relative mx-auto flex h-screen w-full max-w-[1700px] gap-4 px-3 py-3 sm:px-4 sm:py-4">
        <aside
          className={`fixed inset-y-3 left-3 z-50 w-[min(22rem,calc(100vw-1.5rem))] transition-transform duration-300 md:relative md:inset-auto md:w-80 md:shrink-0 md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-[110%]"
          }`}
        >
          <div className="flex h-full flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,18,30,0.94),rgba(8,11,18,0.84))] shadow-[0_28px_100px_rgba(0,0,0,0.46)] backdrop-blur-2xl">
            <div className="border-b border-white/10 px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/10 bg-white/6 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                    <Logo size={32} />
                  </div>
                  <div>
                    <p className="font-display text-2xl leading-none text-white">SolarkBot</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.32em] text-white/45">
                      Wallet Ops Deck
                    </p>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 md:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <InfoTile icon={Wifi} label="Network" value={network === "mainnet-beta" ? "Mainnet" : "Devnet"} />
                <InfoTile
                  icon={Wallet}
                  label="SOL ready"
                  value={solBalance !== null ? `${formatSOL(solBalance)} SOL` : "Syncing"}
                />
              </div>
            </div>

            <div className="px-5 pt-5">
              <Button
                variant="solana"
                className="h-12 w-full justify-start gap-3 rounded-[20px] px-4 text-sm font-semibold"
                onClick={handleNewConversation}
              >
                <Plus className="h-4 w-4" />
                Start new chat
              </Button>
            </div>

            <div className="px-5 pt-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">
                  Recent threads
                </p>
                <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/55">
                  {conversations.length}
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 px-5 pb-5 pt-4">
              <div className="space-y-2">
                {conversations.map((conversation) => {
                  const active = activeConversationId === conversation.id;

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={`group w-full rounded-[22px] border px-4 py-3 text-left transition duration-200 ${
                        active
                          ? "border-solana-green/35 bg-[linear-gradient(135deg,rgba(20,241,149,0.14),rgba(153,69,255,0.08))] shadow-[0_18px_40px_rgba(20,241,149,0.08)]"
                          : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border ${
                            active
                              ? "border-solana-green/30 bg-solana-green/10 text-solana-green"
                              : "border-white/10 bg-white/5 text-white/65"
                          }`}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className={`truncate text-sm font-medium ${active ? "text-white" : "text-white/80"}`}>
                              {conversation.title}
                            </p>
                            <ChevronRight
                              className={`h-4 w-4 shrink-0 transition ${
                                active ? "text-solana-green" : "text-white/25 group-hover:text-white/45"
                              }`}
                            />
                          </div>
                          <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-white/40">
                            {formatConversationTimestamp(conversation.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {conversations.length === 0 && (
                  <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.03] px-5 py-8 text-center">
                    <Bot className="mx-auto h-9 w-9 text-white/35" />
                    <p className="mt-4 font-display text-lg text-white">No threads yet</p>
                    <p className="mt-2 text-sm leading-6 text-white/48">
                      Open a new chat and the control deck will start tracking your recent sessions
                      here.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-white/10 p-5">
              <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 shadow-inner shadow-black/25">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.32em] text-solana-green/80">
                      Connected wallet
                    </p>
                    <p className="mt-2 font-mono text-sm text-white/80">
                      {walletAddress ? truncateAddress(walletAddress) : "No wallet connected"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
                    onClick={handleSignOut}
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <NetworkBadge network={network} />
                  {solBalance !== null && (
                    <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 font-mono text-xs text-white/70">
                      {formatSOL(solBalance)} SOL
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,12,20,0.9),rgba(9,10,18,0.76))] shadow-[0_32px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <header className="border-b border-white/10 px-4 py-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 md:hidden"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>

                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.34em] text-solana-green/75">
                      {activeConversation ? "Active Thread" : "Ready for Input"}
                    </p>
                    <h1 className="truncate font-display text-2xl text-white sm:text-[2rem]">
                      {activeConversation?.title ?? "Open a fresh Solana request"}
                    </h1>
                    <p className="mt-1 hidden text-sm text-white/48 sm:block">
                      Ask for balances, transfers, swaps, recent activity, or transaction explainers.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <Button
                    variant="ghost"
                    className="h-11 gap-2 rounded-[18px] border border-white/10 bg-white/5 px-4 text-white hover:bg-white/10"
                    onClick={handleNewConversation}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New chat</span>
                  </Button>
                  <NetworkBadge network={network} />
                  {walletAddress && (
                    <div className="hidden rounded-full border border-white/10 bg-black/20 px-4 py-2 font-mono text-xs text-white/72 lg:block">
                      {truncateAddress(walletAddress)}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-[18px] border border-white/10 bg-white/5 text-white hover:bg-white/10 md:hidden"
                    onClick={handleSignOut}
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </header>

            <ChatWindow
              conversationId={activeConversationId}
              resetKey={chatResetKey}
              onConversationCreated={handleConversationCreated}
            />
          </div>
        </div>
      </div>
    </ShellFrame>
  );
}

function ShellFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-14rem] top-[-4rem] h-[28rem] w-[28rem] rounded-full bg-solana-purple/18 blur-3xl" />
        <div className="absolute right-[-10rem] top-[-6rem] h-[32rem] w-[32rem] rounded-full bg-solana-green/10 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-cyan-400/8 blur-3xl" />
      </div>
      {children}
    </div>
  );
}

function NetworkBadge({ network }: { network: "devnet" | "mainnet-beta" }) {
  const live = network === "mainnet-beta";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] ${
        live
          ? "border-solana-green/25 bg-solana-green/12 text-solana-green"
          : "border-solana-purple/22 bg-solana-purple/12 text-solana-purple"
      }`}
    >
      <Wifi className="h-3.5 w-3.5" />
      {live ? "Mainnet" : "Devnet"}
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-solana-green">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-white/45">{label}</p>
      <p className="mt-2 text-sm font-medium text-white/82">{value}</p>
    </div>
  );
}

function formatConversationTimestamp(value: string) {
  const date = new Date(value);
  const elapsed = Date.now() - date.getTime();

  if (elapsed < 60 * 60 * 1000) {
    const minutes = Math.max(1, Math.round(elapsed / (60 * 1000)));
    return `${minutes}m ago`;
  }

  if (elapsed < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}
