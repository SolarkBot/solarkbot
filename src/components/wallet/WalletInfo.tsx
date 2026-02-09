"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { signOut } from "next-auth/react";

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function WalletInfo() {
  const { publicKey, disconnect } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    let cancelled = false;

    async function fetchBalance() {
      try {
        const lamports = await connection.getBalance(publicKey!);
        if (!cancelled) {
          setBalance(lamports / LAMPORTS_PER_SOL);
        }
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        if (!cancelled) {
          setBalance(null);
        }
      }
    }

    fetchBalance();

    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [publicKey, connection]);

  if (!publicKey) return null;

  const walletAddress = publicKey.toBase58();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    await disconnect();
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-white">
          {truncateAddress(walletAddress)}
        </span>
        <span className="text-xs text-white/60">
          {balance !== null ? `${balance.toFixed(4)} SOL` : "Loading..."}
        </span>
      </div>
      <button
        onClick={handleSignOut}
        className="rounded-md bg-white/10 px-3 py-1 text-xs font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white"
      >
        Sign Out
      </button>
    </div>
  );
}
