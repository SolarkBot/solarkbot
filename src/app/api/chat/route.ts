import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionWalletAddress } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, checkFreeMessages, incrementFreeMessages } from "@/lib/redis";
import { runAgentExecutor } from "@/lib/ai/agent-executor";
import type { ChatMessage } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";

const chatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().nullable().optional(),
});

/**
 * POST /api/chat
 * Send a message to the AI agent. Requires authenticated session.
 */
export async function POST(request: NextRequest) {
  try {
    const walletAddress = await getSessionWalletAddress(request);
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rate limiting
    const allowed = await checkRateLimit(walletAddress);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { message, conversationId } = parsed.data;

    const freeCheck = await checkFreeMessages(walletAddress);
    if (!freeCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Free message limit reached for today. Please try again tomorrow or upgrade.",
          freeMessagesUsed: freeCheck.used,
        },
        { status: 402 }
      );
    }

    let persistenceEnabled = false;
    let userId = walletAddress;
    let conversation: { id: string } | null = null;
    const conversationHistory: ChatMessage[] = [];

    try {
      const user = await prisma.user.findUnique({
        where: { walletAddress },
      });

      if (user) {
        userId = user.id;

        let dbConversation;
        if (conversationId) {
          dbConversation = await prisma.conversation.findFirst({
            where: { id: conversationId, userId: user.id },
            include: { messages: { orderBy: { createdAt: "asc" }, take: 50 } },
          });
        } else {
          dbConversation = await prisma.conversation.create({
            data: {
              userId: user.id,
              title: message.slice(0, 100),
            },
            include: { messages: true },
          });
        }

        if (dbConversation) {
          conversation = { id: dbConversation.id };
          persistenceEnabled = true;

          for (const msg of dbConversation.messages) {
            const toolCalls = msg.toolCalls
              ? (msg.toolCalls as unknown as ChatMessage["toolCalls"])
              : undefined;

            conversationHistory.push({
              role: msg.role as "user" | "assistant" | "tool",
              content: msg.content,
              toolCallId: undefined,
              toolCalls,
            });

            if (msg.role === "assistant" && toolCalls && toolCalls.length > 0) {
              const toolResults = msg.toolResults as { id: string; name: string; result: unknown }[] | null;
              for (let i = 0; i < toolCalls.length; i++) {
                const tc = toolCalls[i];
                const result = toolResults?.[i]?.result ?? { status: "completed" };
                conversationHistory.push({
                  role: "tool",
                  content: JSON.stringify(result),
                  toolCallId: tc.id,
                });
              }
            }
          }

          await prisma.message.create({
            data: {
              conversationId: dbConversation.id,
              role: "user",
              content: message,
            },
          });
        }
      }
    } catch (error) {
      console.error("Chat persistence unavailable, using stateless mode:", error);
    }

    // Run agent executor
    const agentResponse = await runAgentExecutor(
      message,
      conversationHistory,
      walletAddress,
      userId
    );

    if (persistenceEnabled && conversation) {
      try {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: "assistant",
            content: agentResponse.response,
            toolCalls:
              agentResponse.toolResults.length > 0
                ? (agentResponse.toolResults.map((tr) => ({
                    id: tr.toolCallId,
                    name: tr.toolName,
                    arguments: tr.arguments,
                  })) as unknown as import("@prisma/client").Prisma.InputJsonValue)
                : undefined,
            toolResults:
              agentResponse.toolResults.length > 0
                ? (agentResponse.toolResults.map((tr) => ({
                    id: tr.toolCallId,
                    name: tr.toolName,
                    result: tr.result,
                  })) as unknown as import("@prisma/client").Prisma.InputJsonValue)
                : undefined,
          },
        });

        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date() },
        });
      } catch (error) {
        console.error("Failed to persist assistant response, continuing statelessly:", error);
      }
    }

    // Increment free message counter
    await incrementFreeMessages(walletAddress);

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conversation?.id ?? null,
        response: agentResponse.response,
        toolResults: agentResponse.toolResults,
        pendingTransactions: agentResponse.pendingTransactions,
        stateless: !persistenceEnabled,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
