"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn, truncateAddress } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  Send,
  Globe,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { AgentAction } from "./MessageBubble";

const TOOL_ICONS: Record<string, React.ElementType> = {
  getBalance: Wallet,
  getTokenPrice: TrendingUp,
  sendSOL: Send,
  sendToken: Send,
  resolveDomain: Globe,
  lookupWallet: Search,
};

const TOOL_LABELS: Record<string, string> = {
  getBalance: "Check Balance",
  getTokenPrice: "Token Price",
  sendSOL: "Send SOL",
  sendToken: "Send Token",
  resolveDomain: "Resolve .sol Domain",
  lookupWallet: "Lookup Wallet",
};

interface AgentActionCardProps {
  action: AgentAction;
}

export function AgentActionCard({ action }: AgentActionCardProps) {
  const Icon = TOOL_ICONS[action.tool] || Search;
  const label = TOOL_LABELS[action.tool] || action.tool;

  return (
    <Card className="my-2 border-border/50 bg-background/50">
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-solana-purple/10">
              <Icon className="h-4 w-4 text-solana-purple" />
            </div>
            <span className="text-sm font-medium">{label}</span>
          </div>
          <StatusIndicator status={action.status} />
        </div>

        {/* Parameters */}
        {action.params && Object.keys(action.params).length > 0 && (
          <div className="mt-2 space-y-1">
            {Object.entries(action.params).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">{key}:</span>
                <span className="font-mono">
                  {typeof value === "string" && value.length > 30
                    ? truncateAddress(value, 8)
                    : String(value)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Result */}
        {action.status === "success" && action.result != null && (
          <div className="mt-2 rounded-md bg-solana-green/5 px-3 py-2">
            <pre className="font-mono text-xs text-solana-green whitespace-pre-wrap">
              {typeof action.result === "string"
                ? action.result
                : JSON.stringify(action.result, null, 2)}
            </pre>
          </div>
        )}

        {/* Error */}
        {action.status === "error" && action.error && (
          <div className="mt-2 rounded-md bg-destructive/10 px-3 py-2">
            <p className="text-xs text-destructive">{action.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusIndicator({ status }: { status: AgentAction["status"] }) {
  switch (status) {
    case "loading":
      return <Loader2 className="h-4 w-4 animate-spin text-solana-purple" />;
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-solana-green" />;
    case "error":
      return <XCircle className="h-4 w-4 text-destructive" />;
  }
}
