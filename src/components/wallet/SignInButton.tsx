"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { signIn } from "next-auth/react";
import { createSIWSMessage } from "@/lib/solana/wallet-auth";
import bs58 from "bs58";

export default function SignInButton() {
  const { publicKey, signMessage, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [loading, setLoading] = useState(false);

  const handleSignIn = useCallback(async () => {
    if (!connected || !publicKey) {
      setVisible(true);
      return;
    }

    if (!signMessage) {
      alert("Your wallet does not support message signing.");
      return;
    }

    setLoading(true);

    try {
      const walletAddress = publicKey.toBase58();

      // 1. Fetch nonce from the server
      const nonceRes = await fetch(
        `/api/auth/nonce?walletAddress=${encodeURIComponent(walletAddress)}`
      );
      if (!nonceRes.ok) {
        throw new Error("Failed to fetch nonce");
      }
      const { nonce } = await nonceRes.json();

      // 2. Construct the SIWS message
      const domain = window.location.host;
      const message = createSIWSMessage(walletAddress, nonce, domain);

      // 3. Sign the message with the wallet
      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(encodedMessage);
      const signature = bs58.encode(signatureBytes);

      // 4. Authenticate via NextAuth
      const result = await signIn("solana", {
        message,
        signature,
        redirect: false,
      });

      if (result?.error) {
        console.error("Sign-in failed:", result.error);
        alert("Sign-in failed. Please try again.");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      alert("Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, signMessage, setVisible]);

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#9945FF] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Signing in...
        </>
      ) : (
        "Sign In with Solana"
      )}
    </button>
  );
}
