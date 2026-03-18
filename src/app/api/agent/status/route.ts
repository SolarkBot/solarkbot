import { NextRequest, NextResponse } from "next/server";
import { getSessionWalletAddress } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/agent/status?taskId=xxx
 * Poll the status of an agent task. Requires authenticated session.
 */
export async function GET(request: NextRequest) {
  try {
    const walletAddress = await getSessionWalletAddress(request);
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const taskId = request.nextUrl.searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "taskId query parameter is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const task = await prisma.agentTask.findFirst({
      where: {
        id: taskId,
        userId: user.id,
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: task.id,
        toolName: task.toolName,
        parameters: task.parameters,
        status: task.status,
        result: task.result,
        transactionSig: task.transactionSig,
        createdAt: task.createdAt,
        completedAt: task.completedAt,
      },
    });
  } catch (error) {
    console.error("Agent status API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
