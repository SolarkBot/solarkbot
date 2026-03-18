"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";

interface PaymentGateProps {
  pricePerMessage: number;
  usdcBalance?: number | null;
  onPaymentComplete: () => void;
}

/**
 * UI overlay shown when free message limit is reached (402 response).
 * Displays upgrade prompt and allows the user to dismiss.
 */
export function PaymentGate({
  pricePerMessage,
  usdcBalance,
  onPaymentComplete,
}: PaymentGateProps) {
  // pricePerMessage is in atomic units (e.g. 1000 = 0.001 USDC)
  const displayPrice = (pricePerMessage / 1e6).toFixed(4);

  return (
    <Card className="mx-auto my-4 max-w-md border-solana-purple/30 bg-card/80">
      <CardContent className="flex flex-col items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-solana-purple/10">
          <Zap className="h-6 w-6 text-solana-purple" />
        </div>

        <div className="text-center">
          <h3 className="text-base font-semibold">Free messages used up</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            You&apos;ve reached today&apos;s free message limit. Come back tomorrow or upgrade to continue chatting.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Price per message:{" "}
            <span className="font-mono font-medium text-solana-purple">
              {displayPrice} USDC
            </span>
          </p>
        </div>

        <Button
          variant="solana"
          className="w-full"
          onClick={onPaymentComplete}
        >
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}
