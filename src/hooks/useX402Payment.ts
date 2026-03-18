"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  Transaction,
  PublicKey,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";

const USDC_MINT_MAINNET = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const USDC_MINT_DEVNET = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

export interface PaymentScheme {
  scheme: "exact";
  network: string;
  maxAmountRequired: string;
  payTo: string;
  requiredDeadlineSeconds: number;
  extra: { token: string };
}

export interface PaymentRequirement {
  x402Version: number;
  schemes: PaymentScheme[];
  resource: string;
  description: string;
}

export interface PaymentDetails {
  requirement: PaymentRequirement;
  scheme: PaymentScheme;
  amountUsdc: number;
  originalRequest: { url: string; init?: RequestInit };
}

/**
 * React hook that wraps fetch() to handle HTTP 402 responses using the x402 protocol.
 *
 * On 402: parses PAYMENT-REQUIRED header, prompts user to confirm payment,
 * builds a USDC SPL transfer, signs via wallet adapter, and retries the request.
 */
export function useX402Payment() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [isPaying, setIsPaying] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  // Internal: resolve after user confirms or rejects
  const [pendingResolve, setPendingResolve] = useState<{
    resolve: (value: Response) => void;
    reject: (reason: unknown) => void;
  } | null>(null);

  /**
   * Determine the USDC mint based on the payment network string.
   */
  const getUsdcMint = useCallback((network: string): PublicKey => {
    return network.includes("devnet") ? USDC_MINT_DEVNET : USDC_MINT_MAINNET;
  }, []);

  /**
   * Build, sign, and encode a USDC transfer transaction.
   */
  const buildPaymentTransaction = useCallback(
    async (scheme: PaymentScheme): Promise<string> => {
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected or does not support signing");
      }

      const merchantWallet = new PublicKey(scheme.payTo);
      const usdcMint = getUsdcMint(scheme.network);
      const amount = BigInt(scheme.maxAmountRequired);

      // Get or derive associated token accounts
      const senderATA = await getAssociatedTokenAddress(usdcMint, publicKey);
      const merchantATA = await getAssociatedTokenAddress(usdcMint, merchantWallet);

      const transaction = new Transaction();

      // Check if merchant ATA exists; if not, create it (payer covers rent)
      try {
        await getAccount(connection, merchantATA);
      } catch {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            merchantATA,
            merchantWallet,
            usdcMint
          )
        );
      }

      // Add the USDC transfer instruction
      transaction.add(
        createTransferInstruction(
          senderATA,
          merchantATA,
          publicKey,
          amount
        )
      );

      // Set recent blockhash and fee payer
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      transaction.feePayer = publicKey;

      // Sign with user's wallet
      const signed = await signTransaction(transaction);

      // Serialize to base64 for the X-PAYMENT header
      return Buffer.from(signed.serialize()).toString("base64");
    },
    [publicKey, signTransaction, connection, getUsdcMint]
  );

  /**
   * Confirm the pending payment — build, sign, and retry the original request.
   */
  const confirmPayment = useCallback(async () => {
    if (!paymentDetails || !pendingResolve) return;

    try {
      setIsPaying(true);

      const paymentBase64 = await buildPaymentTransaction(paymentDetails.scheme);

      // Retry the original request with X-PAYMENT header
      const { url, init } = paymentDetails.originalRequest;
      const retryInit: RequestInit = {
        ...init,
        headers: {
          ...(init?.headers || {}),
          "X-PAYMENT": paymentBase64,
          "X-WALLET-ADDRESS": publicKey?.toBase58() || "",
        },
      };

      const response = await fetch(url, retryInit);
      pendingResolve.resolve(response);
    } catch (err) {
      pendingResolve.reject(err);
    } finally {
      setIsPaying(false);
      setPaymentDetails(null);
      setPendingResolve(null);
    }
  }, [paymentDetails, pendingResolve, buildPaymentTransaction, publicKey]);

  /**
   * Reject the pending payment.
   */
  const rejectPayment = useCallback(() => {
    if (pendingResolve) {
      pendingResolve.reject(new Error("Payment rejected by user"));
    }
    setPaymentDetails(null);
    setPendingResolve(null);
    setIsPaying(false);
  }, [pendingResolve]);

  /**
   * Fetch wrapper that handles 402 Payment Required responses.
   *
   * If the response is 402, it parses the payment requirement
   * and prompts the user to confirm before retrying.
   */
  const fetchWithPayment = useCallback(
    async (url: string, init?: RequestInit): Promise<Response> => {
      // Include wallet address header if connected
      const headers: Record<string, string> = {
        ...(init?.headers as Record<string, string> || {}),
      };
      if (publicKey) {
        headers["X-WALLET-ADDRESS"] = publicKey.toBase58();
      }

      const response = await fetch(url, { ...init, headers });

      // Not a 402 — return directly
      if (response.status !== 402) {
        return response;
      }

      // Parse the payment requirement from header
      const paymentRequiredHeader = response.headers.get("PAYMENT-REQUIRED");
      if (!paymentRequiredHeader) {
        return response;
      }

      const requirement: PaymentRequirement = JSON.parse(
        atob(paymentRequiredHeader)
      );

      // Pick the first supported scheme
      const scheme = requirement.schemes[0];
      if (!scheme) {
        return response;
      }

      const amountUsdc = Number(scheme.maxAmountRequired) / 1e6;

      // Return a Promise that resolves once the user confirms or rejects
      return new Promise<Response>((resolve, reject) => {
        setPaymentDetails({
          requirement,
          scheme,
          amountUsdc,
          originalRequest: { url, init },
        });
        setPendingResolve({ resolve, reject });
      });
    },
    [publicKey]
  );

  return {
    fetchWithPayment,
    isPaying,
    paymentDetails,
    confirmPayment,
    rejectPayment,
  };
}
