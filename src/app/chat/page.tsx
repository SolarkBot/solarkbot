"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import SignInButton from "@/components/wallet/SignInButton";
import WalletButton from "@/components/wallet/WalletButton";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { truncateAddress, formatSOL } from "@/lib/utils";
import {
  MessageSquare,
  Plus,
  Menu,
  X,
  LogOut,
  Wifi,
} from "lucide-react";
import { authClient, signOut } from "@/lib/auth/client";

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
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [network, setNetwork] = useState<"devnet" | "mainnet-beta">("devnet");
  const [configIssues, setConfigIssues] = useState<RuntimeConfigIssue[]>([]);
  const isAuthenticated = Boolean(authSession?.session && authSession?.user);

  // No redirect — show sign-in UI instead

  // Fetch SOL balance
  useEffect(() => {
    if (!publicKey || !connection) return;

    let cancelled = false;

    async function fetchBalance() {
      try {
        const balance = await connection.getBalance(publicKey!);
        if (!cancelled) setSolBalance(balance);
      } catch {
        // Silently handle balance fetch errors
      }
    }

    fetchBalance();
    const interval = setInterval(fetchBalance, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [publicKey, connection]);

  // Detect network
  useEffect(() => {
    const endpoint = connection.rpcEndpoint;
    if (endpoint.includes("mainnet")) {
      setNetwork("mainnet-beta");
    } else {
      setNetwork("devnet");
    }
  }, [connection]);

  // Fetch conversations
  const refreshConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch("/api/chat/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch {
      // Conversations API may not be available yet
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
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-solana-purple border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-background">
        <Logo size={64} />
        <h1 className="text-2xl font-bold">Welcome to SolarkBot</h1>
        <p className="max-w-sm text-center text-muted-foreground">
          Connect your Solana wallet and sign in to start chatting with your crypto-native AI assistant.
        </p>
        <Link
          href="/for-agents"
          className="text-sm text-solana-green transition-colors hover:text-solana-green/80"
        >
          AI agent or operator? Read the platform guide.
        </Link>
        <div className="w-full max-w-xl rounded-2xl border border-solana-green/30 bg-solana-green/10 p-4 text-left shadow-[0_0_30px_rgba(20,241,149,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-solana-green">
            Disclaimer
          </p>
          <p className="mt-2 text-sm text-foreground/90">
            The official SolarkBot CA is below. Treat any other CA as unofficial and verify it before interacting.
          </p>
          <p className="mt-3 break-all rounded-xl border border-white/10 bg-black/20 px-3 py-2 font-mono text-sm text-solana-green">
            {OFFICIAL_CA}
          </p>
        </div>
        {configIssues.length > 0 && (
          <div className="w-full max-w-xl rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-left">
            <p className="text-sm font-semibold text-amber-200">
              Production setup needs attention
            </p>
            <div className="mt-2 space-y-2">
              {configIssues.map((issue) => (
                <p
                  key={issue.id}
                  className={`text-sm ${
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
        <div className="flex flex-col items-center gap-3">
          {!publicKey ? (
            <WalletButton />
          ) : (
            <SignInButton />
          )}
        </div>
        {publicKey && (
          <p className="text-xs text-muted-foreground">
            Connected: {truncateAddress(publicKey.toBase58())}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card transition-transform duration-200 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <Logo size={28} />
              <span className="font-semibold">SolarkBot</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* New chat button */}
          <div className="p-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleNewConversation}
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>

          {/* Conversation list */}
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-1 pb-3">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                    activeConversationId === conv.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">{conv.title}</span>
                </button>
              ))}
              {conversations.length === 0 && (
                <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                  No conversations yet. Start a new chat!
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-sm font-medium text-muted-foreground">
              {activeConversationId ? "Chat" : "New Chat"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* New Chat button */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={handleNewConversation}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Chat</span>
            </Button>
            {/* Network badge */}
            <div
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                network === "mainnet-beta"
                  ? "bg-solana-green/10 text-solana-green"
                  : "bg-solana-purple/10 text-solana-purple"
              }`}
            >
              <Wifi className="h-3 w-3" />
              {network === "mainnet-beta" ? "Mainnet" : "Devnet"}
            </div>

            {/* SOL balance */}
            {solBalance !== null && (
              <div className="hidden items-center gap-1 text-sm sm:flex">
                <span className="font-mono text-solana-green">
                  {formatSOL(solBalance)}
                </span>
                <span className="text-muted-foreground">SOL</span>
              </div>
            )}

            {/* Wallet address */}
            {publicKey && (
              <div className="hidden rounded-lg bg-secondary px-3 py-1.5 font-mono text-xs sm:block">
                {truncateAddress(publicKey.toBase58())}
              </div>
            )}

            {/* Sign out */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Chat area */}
        <ChatWindow
          conversationId={activeConversationId}
          onConversationCreated={handleConversationCreated}
        />
      </div>
    </div>
  );
}
