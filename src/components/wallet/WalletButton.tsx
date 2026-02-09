"use client";

import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with wallet adapter
const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function WalletButton() {
  return (
    <WalletMultiButton
      style={{
        backgroundColor: "#9945FF",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 600,
        height: "40px",
        padding: "0 20px",
      }}
    />
  );
}
