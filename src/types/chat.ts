export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  pendingTransactions?: PendingTransaction[];
  paymentId?: string;
  createdAt: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  name: string;
  result: unknown;
  status: "success" | "error";
}

export interface PendingTransaction {
  id: string;
  type: "transfer" | "swap";
  description: string;
  details: TransferDetails | SwapDetails;
  serializedTransaction: string; // base64
  status:
    | "pending"
    | "signing"
    | "confirming"
    | "confirmed"
    | "failed"
    | "rejected";
}

export interface TransferDetails {
  from: string;
  to: string;
  amount: number;
  token: string;
  tokenMint: string;
  estimatedFee: number;
}

export interface SwapDetails {
  inputToken: string;
  inputMint: string;
  inputAmount: number;
  outputToken: string;
  outputMint: string;
  expectedOutput: number;
  minimumOutput: number;
  slippageBps: number;
  priceImpact: number;
  estimatedFee: number;
}

export interface Conversation {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
}
