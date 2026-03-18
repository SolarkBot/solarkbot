"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble, type MessageData, type AgentAction } from "./MessageBubble";
import { AgentActionCard } from "./AgentActionCard";
import { PaymentGate } from "./PaymentGate";
import { Logo } from "@/components/Logo";
import { Send, Loader2 } from "lucide-react";

interface ChatWindowProps {
  conversationId: string | null;
  onConversationCreated?: (id: string) => void;
}

export function ChatWindow({ conversationId, onConversationCreated }: ChatWindowProps) {
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const [messages, setMessages] = useState<MessageData[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [paymentPrice, setPaymentPrice] = useState(1000); // 0.001 USDC
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load conversation messages when conversationId changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    async function loadMessages() {
      try {
        const res = await fetch(`/api/chat/conversations/${conversationId}/messages`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setMessages(data);
        }
      } catch {
        // Message loading may fail if API not ready
      }
    }

    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  }, [input]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: MessageData = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setPaymentRequired(false);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          conversationId,
        }),
      });

      if (res.status === 402) {
        // Payment required
        const data = await res.json().catch(() => ({}));
        setPaymentPrice(data.price || 1000);
        setUsdcBalance(data.usdcBalance ?? null);
        setPaymentRequired(true);
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to send message");
      }

      const json = await res.json();
      const data = json.data || json;

      // Map tool results to agent actions for display
      const agentActions: AgentAction[] | undefined =
        data.toolResults && data.toolResults.length > 0
          ? data.toolResults.map((tr: any) => ({
              id: tr.toolCallId || crypto.randomUUID(),
              toolName: tr.toolName,
              parameters: tr.arguments || {},
              result: tr.result,
              status: tr.result?.error ? "error" : "success",
            }))
          : undefined;

      const assistantMessage: MessageData = {
        id: data.conversationId || crypto.randomUUID(),
        role: "assistant",
        content: data.response || data.content || data.message || "",
        createdAt: new Date().toISOString(),
        agentActions,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Notify parent of new conversation so sidebar updates
      if (data.conversationId && !conversationId) {
        onConversationCreated?.(data.conversationId);
      }
    } catch {
      const errorMessage: MessageData = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handlePaymentComplete() {
    setPaymentRequired(false);
    // Re-send the last user message after payment
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      setInput(lastUserMsg.content);
      // Trigger send on next tick after input is set
      setTimeout(() => handleSend(), 0);
    }
  }

  // Empty state
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          <Logo size={64} />
          <div className="text-center">
            <h2 className="text-xl font-semibold">How can I help you?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ask me about Solana wallets, token prices, transactions, and more.
            </p>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {[
              "What's my SOL balance?",
              "Check the price of SOL",
              "Resolve toly.sol",
              "Send 0.01 SOL to...",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-solana-purple/50 hover:text-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input area */}
        <InputArea
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          textareaRef={textareaRef}
          onSend={handleSend}
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              <MessageBubble message={message} />
              {/* Render agent actions below assistant messages */}
              {message.agentActions?.map((action) => (
                <div key={action.id} className="ml-0 mt-1 max-w-[85%] sm:max-w-[70%]">
                  <AgentActionCard action={action} />
                </div>
              ))}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-solana-purple" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}

          {/* Payment gate */}
          {paymentRequired && (
            <PaymentGate
              pricePerMessage={paymentPrice}
              usdcBalance={usdcBalance}
              onPaymentComplete={handlePaymentComplete}
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <InputArea
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        textareaRef={textareaRef}
        onSend={handleSend}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

function InputArea({
  input,
  setInput,
  isLoading,
  textareaRef,
  onSend,
  onKeyDown,
}: InputAreaProps) {
  return (
    <div className="border-t border-border p-4">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message SolarkBot..."
            rows={1}
            className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 pr-12 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          />
        </div>
        <Button
          variant="solana"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-xl"
          onClick={onSend}
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-muted-foreground/50">
        SolarkBot may make mistakes. Always verify transactions before approving.
      </p>
    </div>
  );
}
