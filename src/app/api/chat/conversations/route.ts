import { NextRequest, NextResponse } from "next/server";
import { getSessionWalletAddress } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/chat/conversations
 * List all conversations for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const walletAddress = await getSessionWalletAddress(request);
    if (!walletAddress) {
      return NextResponse.json([], { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return NextResponse.json([], { status: 200 });
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Conversations API error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
