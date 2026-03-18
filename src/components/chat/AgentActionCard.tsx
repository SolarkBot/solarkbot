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
  get_wallet_balance: Wallet,
  get_token_price: TrendingUp,
  prepare_token_transfer: Send,
  prepare_swap: TrendingUp,
  lookup_solana_domain: Globe,
  get_transaction_history: Search,
  get_defi_position: Wallet,
};

const TOOL_LABELS: Record<string, string> = {
  get_wallet_balance: "Wallet Snapshot",
  get_token_price: "Token Price",
  prepare_token_transfer: "Token Transfer",
  prepare_swap: "Swap Quote",
  lookup_solana_domain: "Resolve .sol Domain",
  get_transaction_history: "Transaction History",
  get_defi_position: "DeFi Positions",
};

interface AgentActionCardProps {
  action: AgentAction;
}

export function AgentActionCard({ action }: AgentActionCardProps) {
  const Icon = TOOL_ICONS[action.toolName] || Search;
  const label = TOOL_LABELS[action.toolName] || action.toolName;

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
        {action.parameters && Object.keys(action.parameters).length > 0 && (
          <div className="mt-2 space-y-1">
            {Object.entries(action.parameters).map(([key, value]) => (
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
        {action.status === "success" && action.result != null ? (
          <div className="mt-2">
            <ActionResult action={action} />
          </div>
        ) : null}

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

function ActionResult({ action }: { action: AgentAction }) {
  if (action.toolName === "get_wallet_balance" && isWalletBalanceResult(action.result)) {
    return <WalletBalancePreview result={action.result} />;
  }

  if (action.toolName === "get_token_price" && isTokenPriceResult(action.result)) {
    return (
      <div className="rounded-xl border border-solana-green/10 bg-solana-green/5 px-3 py-3">
        <div className="text-sm font-medium text-foreground">
          {action.result.token || action.result.mint}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          ${Number(action.result.price).toLocaleString(undefined, {
            maximumFractionDigits: 6,
          })}{" "}
          USD
        </div>
        {action.result.change24h ? (
          <div className="mt-2 text-xs text-solana-green">
            24h change: {action.result.change24h}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-md bg-solana-green/5 px-3 py-2">
      <pre className="whitespace-pre-wrap font-mono text-xs text-solana-green">
        {typeof action.result === "string"
          ? action.result
          : JSON.stringify(action.result, null, 2)}
      </pre>
    </div>
  );
}

interface WalletBalancePreviewResult {
  solBalance: number;
  holdings?: Array<{
    displayName?: string;
    amount: number;
  }>;
  collectibles?: Array<{
    displayName?: string;
    amount: number;
  }>;
  summary?: {
    additionalFungibleTokenCount?: number;
    unlabeledFungibleTokenCount?: number;
  };
}

function isWalletBalanceResult(value: unknown): value is WalletBalancePreviewResult {
  return Boolean(
    value &&
      typeof value === "object" &&
      "solBalance" in value &&
      "holdings" in value
  );
}

function isTokenPriceResult(
  value: unknown
): value is { token?: string; mint?: string; price: number; change24h?: string } {
  return Boolean(value && typeof value === "object" && "price" in value);
}

function WalletBalancePreview({ result }: { result: WalletBalancePreviewResult }) {
  const visibleHoldings = (result.holdings || []).slice(0, 6);

  return (
    <div className="overflow-hidden rounded-2xl border border-solana-purple/15 bg-gradient-to-br from-solana-purple/8 via-background to-solana-green/8">
      <div className="border-b border-border/50 px-4 py-3">
        <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Wallet Snapshot
        </div>
        <div className="mt-1 text-lg font-semibold text-foreground">
          {Number(result.solBalance).toLocaleString(undefined, {
            maximumFractionDigits: 6,
          })}{" "}
          SOL
        </div>
      </div>
      <div className="space-y-3 px-4 py-4">
        {visibleHoldings.length > 0 ? (
          <div className="space-y-2">
            {visibleHoldings.map((holding, index) => (
              <div
                key={`${holding.displayName || "holding"}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-background/60 px-3 py-2"
              >
                <span className="truncate text-sm text-foreground">
                  {holding.displayName || "Unlabeled token"}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {Number(holding.amount).toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No named token holdings found.</p>
        )}

        {result.summary?.additionalFungibleTokenCount ||
        result.summary?.unlabeledFungibleTokenCount ? (
          <p className="text-xs text-muted-foreground">
            {result.summary?.additionalFungibleTokenCount
              ? `+ ${result.summary.additionalFungibleTokenCount} more named holdings`
              : null}
            {result.summary?.additionalFungibleTokenCount &&
            result.summary?.unlabeledFungibleTokenCount
              ? " • "
              : null}
            {result.summary?.unlabeledFungibleTokenCount
              ? `${result.summary.unlabeledFungibleTokenCount} unlabeled tokens hidden`
              : null}
          </p>
        ) : null}
      </div>
    </div>
  );
}
