"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { truncateAddress, formatSOL } from "@/lib/utils";
import type { PendingTransaction, TransferDetails, SwapDetails } from "@/types/chat";
import {
  Send,
  ArrowRightLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface TransactionApprovalCardProps {
  transaction: PendingTransaction;
  onStatusChange?: (id: string, status: PendingTransaction["status"], txSig?: string) => void;
}

function isTransferDetails(details: TransferDetails | SwapDetails): details is TransferDetails {
  return "to" in details && "from" in details;
}

export function TransactionApprovalCard({
  transaction,
  onStatusChange,
}: TransactionApprovalCardProps) {
  const { signTransaction } = useWallet();
  const { connection } = useConnection();
  const [status, setStatus] = useState<PendingTransaction["status"]>(transaction.status);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isTransfer = isTransferDetails(transaction.details);
  const Icon = isTransfer ? Send : ArrowRightLeft;

  async function handleApprove() {
    if (!signTransaction) {
      setError("Wallet does not support signing");
      return;
    }

    try {
      // Signing phase
      setStatus("signing");
      setError(null);
      onStatusChange?.(transaction.id, "signing");

      const txBytes = Buffer.from(transaction.serializedTransaction, "base64");
      const tx = Transaction.from(txBytes);
      const signed = await signTransaction(tx);

      // Confirming phase
      setStatus("confirming");
      onStatusChange?.(transaction.id, "confirming");

      const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      setTxSignature(signature);

      const confirmation = await connection.confirmTransaction(signature, "confirmed");

      if (confirmation.value.err) {
        throw new Error("Transaction failed on-chain");
      }

      // Confirmed
      setStatus("confirmed");
      onStatusChange?.(transaction.id, "confirmed", signature);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transaction failed";

      // User rejected in wallet
      if (message.includes("rejected") || message.includes("User rejected")) {
        setStatus("rejected");
        onStatusChange?.(transaction.id, "rejected");
        setError("Transaction rejected");
      } else {
        setStatus("failed");
        onStatusChange?.(transaction.id, "failed");
        setError(message);
      }
    }
  }

  function handleReject() {
    setStatus("rejected");
    setError(null);
    onStatusChange?.(transaction.id, "rejected");
  }

  const isTerminal = status === "confirmed" || status === "failed" || status === "rejected";
  const isProcessing = status === "signing" || status === "confirming";

  return (
    <Card className="my-2 border-border/50 bg-background/50 overflow-hidden">
      {/* Status bar */}
      <div className={statusBarClass(status)} />

      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-solana-purple/10">
              <Icon className="h-4 w-4 text-solana-purple" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {isTransfer ? "Transfer" : "Swap"}
              </p>
              <p className="text-xs text-muted-foreground">{transaction.description}</p>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Transaction details */}
        {isTransfer ? (
          <TransferInfo details={transaction.details as TransferDetails} />
        ) : (
          <SwapInfo details={transaction.details as SwapDetails} />
        )}

        {/* Transaction signature link */}
        {txSignature && (
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <span>Tx:</span>
            <a
              href={`https://solscan.io/tx/${txSignature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-solana-purple hover:underline"
            >
              {truncateAddress(txSignature, 8)}
            </a>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {/* Action buttons */}
        {!isTerminal && !isProcessing && (
          <div className="mt-4 flex gap-2">
            <Button
              variant="solana"
              size="sm"
              className="flex-1"
              onClick={handleApprove}
            >
              Approve & Sign
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleReject}
            >
              Reject
            </Button>
          </div>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="mt-4 flex items-center justify-center gap-2 py-1">
            <Loader2 className="h-4 w-4 animate-spin text-solana-purple" />
            <span className="text-sm text-muted-foreground">
              {status === "signing" ? "Waiting for wallet signature..." : "Confirming on-chain..."}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TransferInfo({ details }: { details: TransferDetails }) {
  return (
    <div className="space-y-2 rounded-lg bg-secondary/50 p-3">
      <DetailRow label="From" value={truncateAddress(details.from, 6)} mono />
      <DetailRow label="To" value={truncateAddress(details.to, 6)} mono />
      <DetailRow
        label="Amount"
        value={`${details.amount} ${details.token}`}
        highlight
      />
      <DetailRow
        label="Est. Fee"
        value={`${details.estimatedFee} SOL`}
      />
    </div>
  );
}

function SwapInfo({ details }: { details: SwapDetails }) {
  return (
    <div className="space-y-2 rounded-lg bg-secondary/50 p-3">
      <DetailRow
        label="You Pay"
        value={`${details.inputAmount} ${details.inputToken}`}
        highlight
      />
      <DetailRow
        label="You Receive"
        value={`~${details.expectedOutput} ${details.outputToken}`}
        highlight
      />
      <DetailRow
        label="Min. Output"
        value={`${details.minimumOutput} ${details.outputToken}`}
      />
      <DetailRow
        label="Slippage"
        value={`${(details.slippageBps / 100).toFixed(2)}%`}
      />
      <DetailRow
        label="Price Impact"
        value={`${details.priceImpact.toFixed(2)}%`}
        warn={details.priceImpact > 3}
      />
      <DetailRow
        label="Est. Fee"
        value={`${details.estimatedFee} SOL`}
      />
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  highlight,
  warn,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={[
          mono ? "font-mono" : "",
          highlight ? "font-medium text-foreground" : "text-muted-foreground",
          warn ? "text-yellow-500 font-medium" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: PendingTransaction["status"] }) {
  switch (status) {
    case "pending":
      return (
        <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-500">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      );
    case "signing":
      return (
        <span className="flex items-center gap-1 rounded-full bg-solana-purple/10 px-2 py-0.5 text-xs text-solana-purple">
          <Loader2 className="h-3 w-3 animate-spin" />
          Signing
        </span>
      );
    case "confirming":
      return (
        <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-500">
          <Loader2 className="h-3 w-3 animate-spin" />
          Confirming
        </span>
      );
    case "confirmed":
      return (
        <span className="flex items-center gap-1 rounded-full bg-solana-green/10 px-2 py-0.5 text-xs text-solana-green">
          <CheckCircle2 className="h-3 w-3" />
          Confirmed
        </span>
      );
    case "failed":
      return (
        <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
          <XCircle className="h-3 w-3" />
          Failed
        </span>
      );
    case "rejected":
      return (
        <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          <XCircle className="h-3 w-3" />
          Rejected
        </span>
      );
  }
}

function statusBarClass(status: PendingTransaction["status"]): string {
  const base = "h-1 w-full";
  switch (status) {
    case "pending":
      return `${base} bg-yellow-500/50`;
    case "signing":
    case "confirming":
      return `${base} bg-solana-purple/50 animate-pulse`;
    case "confirmed":
      return `${base} bg-solana-green/50`;
    case "failed":
      return `${base} bg-destructive/50`;
    case "rejected":
      return `${base} bg-muted`;
  }
}
