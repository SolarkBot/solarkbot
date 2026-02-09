import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/chat/conversations
 * List all conversations for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    let walletAddress: string | null = null;

    const session = await getServerSession(authOptions);
    if (session?.user?.name) {
      walletAddress = session.user.name;
    } else {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      if (token?.walletAddress) {
        walletAddress = token.walletAddress as string;
      }
    }

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
