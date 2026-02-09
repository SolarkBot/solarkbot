import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  toolCallId?: string;
  toolCalls?: ToolCall[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ChatCompletionResult {
  content: string;
  toolCalls: ToolCall[] | null;
  finishReason: string;
}

type AIProvider = "openai" | "anthropic";

function getProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || "openai") as AIProvider;
  if (provider !== "openai" && provider !== "anthropic") {
    throw new Error(`Unsupported AI_PROVIDER: ${provider}. Use "openai" or "anthropic".`);
  }
  return provider;
}

function getModel(provider: AIProvider): string {
  if (process.env.AI_MODEL) return process.env.AI_MODEL;
  return provider === "openai" ? "gpt-4o" : "claude-sonnet-4-20250514";
}

let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

/**
 * Unified chat completion function that works with both OpenAI and Anthropic.
 * Handles tool/function calling and returns a normalized response.
 * @param messages - Conversation messages
 * @param tools - Optional tool definitions in OpenAI function calling format
 */
export async function chatCompletion(
  messages: ChatMessage[],
  tools?: ToolDefinition[]
): Promise<ChatCompletionResult> {
  const provider = getProvider();
  const model = getModel(provider);

  if (provider === "openai") {
    return openaiCompletion(messages, tools, model);
  } else {
    return anthropicCompletion(messages, tools, model);
  }
}

async function openaiCompletion(
  messages: ChatMessage[],
  tools: ToolDefinition[] | undefined,
  model: string
): Promise<ChatCompletionResult> {
  const client = getOpenAIClient();

  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = messages.map((msg) => {
    if (msg.role === "tool") {
      return {
        role: "tool" as const,
        content: msg.content,
        tool_call_id: msg.toolCallId || "",
      };
    }
    if (msg.role === "assistant" && msg.toolCalls && msg.toolCalls.length > 0) {
      return {
        role: "assistant" as const,
        content: msg.content || null,
        tool_calls: msg.toolCalls.map((tc) => ({
          id: tc.id,
          type: "function" as const,
          function: {
            name: tc.name,
            arguments: JSON.stringify(tc.arguments),
          },
        })),
      };
    }
    return {
      role: msg.role as "system" | "user" | "assistant",
      content: msg.content,
    };
  });

  const openaiTools: OpenAI.Chat.ChatCompletionTool[] | undefined = tools?.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));

  const response = await client.chat.completions.create({
    model,
    messages: openaiMessages,
    tools: openaiTools,
    temperature: 0.7,
    max_tokens: 4096,
  });

  const choice = response.choices[0];
  const toolCalls: ToolCall[] | null =
    choice.message.tool_calls?.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments),
    })) ?? null;

  return {
    content: choice.message.content || "",
    toolCalls: toolCalls && toolCalls.length > 0 ? toolCalls : null,
    finishReason: choice.finish_reason || "stop",
  };
}

async function anthropicCompletion(
  messages: ChatMessage[],
  tools: ToolDefinition[] | undefined,
  model: string
): Promise<ChatCompletionResult> {
  const client = getAnthropicClient();

  // Separate system message from conversation messages
  let systemPrompt = "";
  const conversationMessages: ChatMessage[] = [];
  for (const msg of messages) {
    if (msg.role === "system") {
      systemPrompt += (systemPrompt ? "\n\n" : "") + msg.content;
    } else {
      conversationMessages.push(msg);
    }
  }

  // Convert messages to Anthropic format
  const anthropicMessages: Anthropic.MessageParam[] = [];

  for (const msg of conversationMessages) {
    if (msg.role === "user") {
      anthropicMessages.push({ role: "user", content: msg.content });
    } else if (msg.role === "assistant") {
      if (msg.toolCalls && msg.toolCalls.length > 0) {
        const content: Anthropic.ContentBlockParam[] = [];
        if (msg.content) {
          content.push({ type: "text", text: msg.content });
        }
        for (const tc of msg.toolCalls) {
          content.push({
            type: "tool_use",
            id: tc.id,
            name: tc.name,
            input: tc.arguments,
          });
        }
        anthropicMessages.push({ role: "assistant", content });
      } else {
        anthropicMessages.push({ role: "assistant", content: msg.content });
      }
    } else if (msg.role === "tool") {
      anthropicMessages.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: msg.toolCallId || "",
            content: msg.content,
          },
        ],
      });
    }
  }

  const anthropicTools: Anthropic.Tool[] | undefined = tools?.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters as Anthropic.Tool.InputSchema,
  }));

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt || undefined,
    messages: anthropicMessages,
    tools: anthropicTools,
    temperature: 0.7,
  });

  let content = "";
  const toolCalls: ToolCall[] = [];

  for (const block of response.content) {
    if (block.type === "text") {
      content += block.text;
    } else if (block.type === "tool_use") {
      toolCalls.push({
        id: block.id,
        name: block.name,
        arguments: block.input as Record<string, unknown>,
      });
    }
  }

  return {
    content,
    toolCalls: toolCalls.length > 0 ? toolCalls : null,
    finishReason: response.stop_reason || "end_turn",
  };
}
