import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { executeTool } from "@/lib/ai/tools";

const executeRequestSchema = z.object({
  toolName: z.string().min(1),
  parameters: z.record(z.unknown()),
});

/**
 * POST /api/agent/execute
 * Directly execute an agent tool. Requires authenticated session.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.name) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const walletAddress = session.user.name;

    const body = await request.json();
    const parsed = executeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { toolName, parameters } = parsed.data;

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

    // Log task
    const agentTask = await prisma.agentTask.create({
      data: {
        userId: user.id,
        toolName,
        parameters: parameters as unknown as import("@prisma/client").Prisma.InputJsonValue,
        status: "executing",
      },
    });

    try {
      const result = await executeTool(toolName, parameters);

      await prisma.agentTask.update({
        where: { id: agentTask.id },
        data: {
          status: "completed",
          result: result as unknown as import("@prisma/client").Prisma.InputJsonValue,
          completedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          taskId: agentTask.id,
          toolName,
          result,
        },
      });
    } catch (toolError) {
      const errorMessage =
        toolError instanceof Error ? toolError.message : "Tool execution failed";

      await prisma.agentTask.update({
        where: { id: agentTask.id },
        data: {
          status: "failed",
          result: { error: errorMessage },
          completedAt: new Date(),
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          taskId: agentTask.id,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Agent execute API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
