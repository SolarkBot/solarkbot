import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionWalletAddress } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { executeTool, toolDefinitions } from "@/lib/ai/tools";
import {
  checkFreeMessages,
  checkRateLimit,
  incrementFreeMessages,
} from "@/lib/redis";

export const dynamic = "force-dynamic";

const executeRequestSchema = z.object({
  toolName: z.string().min(1),
  parameters: z.record(z.string(), z.unknown()),
});

const allowedToolNames = new Set(toolDefinitions.map((tool) => tool.name));

/**
 * POST /api/agent/execute
 * Directly execute an agent tool. Requires authenticated session.
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

    const rateLimitAllowed = await checkRateLimit(walletAddress, 30, 60);
    if (!rateLimitAllowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = executeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { toolName, parameters } = parsed.data;

    if (!allowedToolNames.has(toolName)) {
      return NextResponse.json(
        { success: false, error: "Unsupported tool" },
        { status: 400 }
      );
    }

    const freeTier = await checkFreeMessages(walletAddress);
    if (!freeTier.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Free usage limit reached. Payment is required for more agent actions.",
          code: "FREE_TIER_EXHAUSTED",
        },
        { status: 402 }
      );
    }

    let agentTask: { id: string } | null = null;

    try {
      const user = await prisma.user.findUnique({
        where: { walletAddress },
      });

      if (user) {
        agentTask = await prisma.agentTask.create({
          data: {
            userId: user.id,
            toolName,
            parameters: parameters as unknown as import("@prisma/client").Prisma.InputJsonValue,
            status: "executing",
          },
        });
      }
    } catch (error) {
      console.error("Agent task persistence unavailable, continuing without task log:", error);
    }

    try {
      const result = await executeTool(toolName, parameters, {
        connectedWalletAddress: walletAddress,
      });

      await incrementFreeMessages(walletAddress);

      if (agentTask) {
        await prisma.agentTask.update({
          where: { id: agentTask.id },
          data: {
            status: "completed",
            result: result as unknown as import("@prisma/client").Prisma.InputJsonValue,
            completedAt: new Date(),
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          taskId: agentTask?.id ?? null,
          toolName,
          result,
        },
      });
    } catch (toolError) {
      const errorMessage =
        toolError instanceof Error ? toolError.message : "Tool execution failed";

      if (agentTask) {
        await prisma.agentTask.update({
          where: { id: agentTask.id },
          data: {
            status: "failed",
            result: { error: errorMessage },
            completedAt: new Date(),
          },
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          taskId: agentTask?.id ?? null,
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
