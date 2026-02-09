"use client";

import ReactMarkdown from "react-markdown";
import { cn, truncateAddress } from "@/lib/utils";

export interface MessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  agentActions?: AgentAction[];
  paymentRequired?: boolean;
}

export interface AgentAction {
  id: string;
  tool: string;
  params: Record<string, unknown>;
  result?: unknown;
  status: "loading" | "success" | "error";
  error?: string;
}

interface MessageBubbleProps {
  message: MessageData;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const timestamp = new Date(message.createdAt);

  return (
    <div
      className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%]",
          isUser
            ? "bg-solana-purple/20 text-foreground"
            : "bg-card border border-border text-card-foreground"
        )}
      >
        {/* Message content */}
        <div className="prose prose-sm prose-invert max-w-none break-words">
          <ReactMarkdown
            components={{
              // Style code blocks and inline code with monospace
              code: ({ children, className }) => {
                const isBlock = className?.includes("language-");
                if (isBlock) {
                  return (
                    <pre className="overflow-x-auto rounded-lg bg-background/50 p-3">
                      <code className="font-mono text-xs">{children}</code>
                    </pre>
                  );
                }
                return (
                  <code className="rounded bg-background/50 px-1.5 py-0.5 font-mono text-xs">
                    {children}
                  </code>
                );
              },
              // Auto-detect and format wallet addresses
              p: ({ children }) => (
                <p className="mb-2 last:mb-0">{children}</p>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Timestamp */}
        <div
          className={cn(
            "mt-1 text-[10px]",
            isUser ? "text-solana-purple/60" : "text-muted-foreground/50"
          )}
        >
          {timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}

/** Utility to render a wallet address inline with monospace + truncation */
export function WalletAddress({ address }: { address: string }) {
  return (
    <span className="inline-block rounded bg-background/50 px-1.5 py-0.5 font-mono text-xs">
      {truncateAddress(address)}
    </span>
  );
}
