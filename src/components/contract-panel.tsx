"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

import { contractAddress } from "@/lib/site-data";

export function ContractPanel() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    const fallbackCopy = () => {
      const textarea = document.createElement("textarea");
      textarea.value = contractAddress;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();

      const copiedWithFallback = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (!copiedWithFallback) {
        throw new Error("Fallback copy failed");
      }
    };

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(contractAddress);
      } else {
        fallbackCopy();
      }
      setCopied(true);
    } catch {
      try {
        fallbackCopy();
        setCopied(true);
      } catch {
        setCopied(false);
      }
    }
  };

  return (
    <div className="surface-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(116,248,211,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,159,102,0.12),transparent_30%)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow mb-4">Official CA</p>
          <h3 className="font-display text-2xl text-white sm:text-3xl">SolarkBot Contract Address</h3>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/[0.64] sm:text-base">
            Cleanly surfaced for quick access. Copy the address directly from the brand homepage
            whenever you need to reference the official SolarkBot contract.
          </p>
        </div>

        <div className="flex w-full max-w-2xl flex-col gap-3">
          <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#09101f]/80 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:px-5">
            <code className="block overflow-x-auto whitespace-nowrap text-sm tracking-[0.16em] text-white/[0.78] sm:text-[15px]">
              {contractAddress}
            </code>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">
              Displayed exactly as issued
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="button-secondary min-w-[168px] justify-center"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              Copy Address
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={copied ? "copied" : "idle"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-sm text-accent/90"
            >
              {copied ? "Contract address copied to clipboard." : "Tap once to copy the full CA."}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
