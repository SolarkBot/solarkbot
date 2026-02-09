"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
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

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [network, setNetwork] = useState<"devnet" | "mainnet-beta">("devnet");

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
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/chat/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch {
      // Conversations API may not be available yet
    }
  }, [status]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

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

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-solana-purple border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-background">
        <Logo size={64} />
        <h1 className="text-2xl font-bold">Welcome to SolarkBot</h1>
        <p className="max-w-sm text-center text-muted-foreground">
          Connect your Solana wallet and sign in to start chatting with your crypto-native AI assistant.
        </p>
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
              onClick={() => signOut({ callbackUrl: "/" })}
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
