import { NextRequest, NextResponse } from "next/server";
import { getSessionWalletAddress } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/chat/conversations/:conversationId/messages
 * Load messages for a specific conversation.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const walletAddress = await getSessionWalletAddress(request);
    if (!walletAddress) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return NextResponse.json([], { status: 200 });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.conversationId,
        userId: user.id,
      },
    });

    if (!conversation) {
      return NextResponse.json([], { status: 200 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: params.conversationId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        role: true,
        content: true,
        toolCalls: true,
        toolResults: true,
        createdAt: true,
      },
    });

    // Map to the format ChatWindow expects
    const formatted = messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
      agentActions: msg.toolCalls
        ? (msg.toolCalls as any[]).map((tc: any, i: number) => ({
            id: tc.id || `action-${i}`,
            toolName: tc.name,
            parameters: tc.arguments || {},
            result: msg.toolResults
              ? (msg.toolResults as any[])[i]?.result
              : undefined,
            status: "success",
          }))
        : undefined,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Messages API error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
