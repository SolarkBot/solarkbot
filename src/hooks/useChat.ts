"use client";

import { useState, useCallback, useRef } from "react";
import type {
  ChatMessage,
  ChatState,
  Conversation,
  PendingTransaction,
} from "@/types/chat";
import { useX402Payment } from "./useX402Payment";

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    conversationId: null,
  });

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    fetchWithPayment,
    isPaying,
    paymentDetails,
    confirmPayment,
    rejectPayment,
  } = useX402Payment();

  const updateTransactionStatus = useCallback(
    (messageId: string, txId: string, newStatus: PendingTransaction["status"], txSig?: string) => {
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) => {
          if (msg.id !== messageId || !msg.pendingTransactions) return msg;
          return {
            ...msg,
            pendingTransactions: msg.pendingTransactions.map((tx) =>
              tx.id === txId ? { ...tx, status: newStatus } : tx
            ),
          };
        }),
      }));
    },
    []
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || state.isLoading) return;

      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: null,
      }));

      try {
        // Use the x402-aware fetch — handles 402 automatically via payment prompt
        const response = await fetchWithPayment("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content.trim(),
            conversationId: state.conversationId,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.error || `Request failed with status ${response.status}`
          );
        }

        const data = await response.json();

        const assistantMessage: ChatMessage = {
          id: data.id || generateId(),
          role: "assistant",
          content: data.content || data.message || "",
          toolCalls: data.toolCalls,
          toolResults: data.toolResults,
          pendingTransactions: data.pendingTransactions,
          paymentId: data.paymentId,
          createdAt: data.createdAt || new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
          conversationId: data.conversationId || prev.conversationId,
        }));
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        // Payment rejection is not an error to display
        if (err instanceof Error && err.message === "Payment rejected by user") {
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [state.isLoading, state.conversationId, fetchWithPayment]
  );

  const loadConversation = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/chat/conversations/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to load conversation: ${response.status}`);
      }

      const data = await response.json();

      const messages: ChatMessage[] = (data.messages || []).map(
        (msg: Record<string, unknown>) => ({
          id: (msg.id as string) || generateId(),
          role: msg.role as ChatMessage["role"],
          content: (msg.content as string) || "",
          toolCalls: msg.toolCalls as ChatMessage["toolCalls"],
          toolResults: msg.toolResults as ChatMessage["toolResults"],
          pendingTransactions:
            msg.pendingTransactions as ChatMessage["pendingTransactions"],
          paymentId: msg.paymentId as string | undefined,
          createdAt:
            (msg.createdAt as string) || new Date().toISOString(),
        })
      );

      setState({
        messages,
        isLoading: false,
        error: null,
        conversationId: id,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load conversation";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, []);

  const createNewConversation = useCallback(() => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState({
      messages: [],
      isLoading: false,
      error: null,
      conversationId: null,
    });
  }, []);

  const getConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/chat/conversations");

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`);
      }

      const data = await response.json();
      const convos: Conversation[] = (data.conversations || data || []).map(
        (c: Record<string, unknown>) => ({
          id: c.id as string,
          title: (c.title as string | null) ?? null,
          createdAt: c.createdAt as string,
          updatedAt: c.updatedAt as string,
          messageCount: c.messageCount as number | undefined,
        })
      );

      setConversations(convos);
      return convos;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch conversations";
      setState((prev) => ({ ...prev, error: errorMessage }));
      return [];
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    conversationId: state.conversationId,
    conversations,
    isPaying,
    paymentDetails,
    confirmPayment,
    rejectPayment,
    sendMessage,
    loadConversation,
    createNewConversation,
    getConversations,
    clearError,
    updateTransactionStatus,
  };
}
