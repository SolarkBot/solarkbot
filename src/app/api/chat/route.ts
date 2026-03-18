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

    // Get user from DB
    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check free message quota (skip for paid users / future payment check)
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

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId: user.id },
        include: { messages: { orderBy: { createdAt: "asc" }, take: 50 } },
      });
      if (!conversation) {
        return NextResponse.json(
          { success: false, error: "Conversation not found" },
          { status: 404 }
        );
      }
    } else {
      conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          title: message.slice(0, 100),
        },
        include: { messages: true },
      });
    }

    // Build conversation history from DB messages
    // For assistant messages with tool calls, we also inject the tool_result messages
    // that Anthropic requires after every tool_use block.
    const conversationHistory: ChatMessage[] = [];
    for (const msg of conversation.messages) {
      const toolCalls = msg.toolCalls
        ? (msg.toolCalls as unknown as ChatMessage["toolCalls"])
        : undefined;

      conversationHistory.push({
        role: msg.role as "user" | "assistant" | "tool",
        content: msg.content,
        toolCallId: undefined,
        toolCalls,
      });

      // If assistant message had tool calls, inject tool_result messages
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

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    // Run agent executor
    const agentResponse = await runAgentExecutor(
      message,
      conversationHistory,
      walletAddress,
      user.id
    );

    // Save assistant response
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

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // Increment free message counter
    await incrementFreeMessages(walletAddress);

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conversation.id,
        response: agentResponse.response,
        toolResults: agentResponse.toolResults,
        pendingTransactions: agentResponse.pendingTransactions,
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
