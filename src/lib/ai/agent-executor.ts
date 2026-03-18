import { chatCompletion, type ChatMessage, type ToolCall } from "./provider";
import { toolDefinitions, executeTool } from "./tools";
import { getSystemPrompt } from "./system-prompt";
import { prisma } from "@/lib/db/prisma";

export interface ToolResult {
  toolCallId: string;
  toolName: string;
  arguments: Record<string, unknown>;
  result: unknown;
  isTransaction: boolean;
}

export interface PendingTransaction {
  toolCallId: string;
  toolName: string;
  serializedTransaction: string;
  message: string;
}

export interface AgentResponse {
  response: string;
  toolResults: ToolResult[];
  pendingTransactions: PendingTransaction[];
}

const MAX_ITERATIONS = 10;
const TRANSACTION_TOOLS = new Set(["prepare_token_transfer", "prepare_swap"]);

function wantsContractAddresses(message: string) {
  return /\b(ca|contract address|contract addresses|mint|mint address|token address|token addresses)\b/i.test(
    message
  );
}

/**
 * ReAct-style agent loop. Calls the AI model with tools, executes tool calls,
 * feeds results back, and loops until the AI returns a final text response.
 * @param userMessage - The user's message
 * @param conversationHistory - Prior conversation messages
 * @param walletAddress - Connected user's wallet address
 * @param userId - Database user ID for logging agent tasks
 */
export async function runAgentExecutor(
  userMessage: string,
  conversationHistory: ChatMessage[],
  walletAddress: string,
  userId: string
): Promise<AgentResponse> {
  const network = process.env.SOLANA_NETWORK || "mainnet-beta";
  const includeContractAddresses = wantsContractAddresses(userMessage);
  const systemPrompt = getSystemPrompt(walletAddress, network, {
    includeContractAddresses,
  });

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const allToolResults: ToolResult[] = [];
  const pendingTransactions: PendingTransaction[] = [];

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const result = await chatCompletion(messages, toolDefinitions);

    // No tool calls -- final response
    if (!result.toolCalls || result.toolCalls.length === 0) {
      return {
        response: result.content,
        toolResults: allToolResults,
        pendingTransactions,
      };
    }

    // Add assistant message with tool calls to conversation
    messages.push({
      role: "assistant",
      content: result.content,
      toolCalls: result.toolCalls,
    });

    // Execute each tool call
    for (const toolCall of result.toolCalls) {
      const toolResult = await executeToolCall(
        toolCall,
        userId,
        walletAddress,
        includeContractAddresses
      );
      allToolResults.push(toolResult);

      // If this is a transaction-producing tool, extract the pending transaction
      if (toolResult.isTransaction && toolResult.result) {
        const txResult = toolResult.result as {
          serializedTransaction?: string;
          message?: string;
        };
        if (txResult.serializedTransaction) {
          pendingTransactions.push({
            toolCallId: toolCall.id,
            toolName: toolCall.name,
            serializedTransaction: txResult.serializedTransaction,
            message: txResult.message || "",
          });
        }
      }

      // Add tool result back to conversation
      messages.push({
        role: "tool",
        content: JSON.stringify(toolResult.result),
        toolCallId: toolCall.id,
      });
    }
  }

  // Exceeded max iterations, return what we have
  return {
    response:
      "I've reached my processing limit for this request. Here's what I was able to gather so far. Please try again with a simpler request if needed.",
    toolResults: allToolResults,
    pendingTransactions,
  };
}

async function executeToolCall(
  toolCall: ToolCall,
  userId: string,
  walletAddress: string,
  includeContractAddresses: boolean
): Promise<ToolResult> {
  let agentTask: { id: string } | null = null;

  try {
    agentTask = await prisma.agentTask.create({
      data: {
        userId,
        toolName: toolCall.name,
        parameters: toolCall.arguments as unknown as import("@prisma/client").Prisma.InputJsonValue,
        status: "executing",
      },
    });
  } catch (error) {
    console.error("Agent tool logging unavailable, continuing without task persistence:", error);
  }

  try {
    const result = await executeTool(toolCall.name, toolCall.arguments, {
      connectedWalletAddress: walletAddress,
      includeContractAddresses,
    });

    if (agentTask) {
      try {
        await prisma.agentTask.update({
          where: { id: agentTask.id },
          data: {
            status: "completed",
            result: result as unknown as import("@prisma/client").Prisma.InputJsonValue,
            completedAt: new Date(),
          },
        });
      } catch (error) {
        console.error("Failed to persist completed agent tool result:", error);
      }
    }

    return {
      toolCallId: toolCall.id,
      toolName: toolCall.name,
      arguments: toolCall.arguments,
      result,
      isTransaction: TRANSACTION_TOOLS.has(toolCall.name),
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (agentTask) {
      try {
        await prisma.agentTask.update({
          where: { id: agentTask.id },
          data: {
            status: "failed",
            result: { error: errorMessage },
            completedAt: new Date(),
          },
        });
      } catch (updateError) {
        console.error("Failed to persist failed agent tool result:", updateError);
      }
    }

    return {
      toolCallId: toolCall.id,
      toolName: toolCall.name,
      arguments: toolCall.arguments,
      result: { error: errorMessage },
      isTransaction: false,
    };
  }
}
