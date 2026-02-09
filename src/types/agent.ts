export interface AgentTask {
  id: string;
  toolName: string;
  parameters: Record<string, unknown>;
  result?: unknown;
  status: "pending" | "executing" | "completed" | "failed";
  transactionSig?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, ToolParameter>;
  requiresTransaction: boolean;
}

export interface ToolParameter {
  type: string;
  description: string;
  required?: boolean;
  default?: unknown;
}
