"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Orbit, Sparkles } from "lucide-react";
import Link from "next/link";

import { heroLinks } from "@/lib/site-data";

type OrbitNode = {
  size: string;
  delay: number;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
};

const orbitNodes: OrbitNode[] = [
  { size: "h-4 w-4", top: "10%", left: "22%", delay: 0.2 },
  { size: "h-3 w-3", top: "24%", right: "16%", delay: 0.7 },
  { size: "h-2.5 w-2.5", bottom: "18%", left: "20%", delay: 1.3 },
  { size: "h-3.5 w-3.5", bottom: "28%", right: "18%", delay: 0.9 },
];

const portalCards = [
  {
    title: "Solark DEX",
    label: "Live portal",
    copy: "Swap flows with visual energy and cleaner momentum.",
    href: heroLinks.dex,
    className: "left-[6%] top-[14%] rotate-[-8deg]",
    glow: "from-[#74f8d3]/[0.35] via-[#95a5ff]/[0.15] to-transparent",
  },
  {
    title: "Solark NFT",
    label: "Creative portal",
    copy: "Mint inside a more cinematic studio flow.",
    href: heroLinks.nft,
    className: "right-[2%] top-[38%] rotate-[8deg]",
    glow: "from-[#ff9f66]/[0.28] via-[#94b0ff]/[0.15] to-transparent",
  },
] as const;

export function HeroVisual() {
  return (
    <div className="relative mx-auto flex h-[520px] w-full max-w-[640px] items-center justify-center lg:mx-0">
      <div className="absolute inset-0 rounded-[2.5rem] bg-[radial-gradient(circle_at_50%_50%,rgba(116,248,211,0.16),transparent_34%),radial-gradient(circle_at_15%_20%,rgba(255,159,102,0.14),transparent_32%),radial-gradient(circle_at_80%_12%,rgba(142,168,255,0.2),transparent_28%)]" />
      <div className="absolute inset-[8%] rounded-[2.5rem] border border-white/10 bg-white/[0.035] shadow-card backdrop-blur-sm" />
      <div className="absolute inset-[12%] rounded-[2.25rem] border border-white/[0.08] bg-hero-grid bg-[size:64px_64px] opacity-35" />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[18%] rounded-full border border-dashed border-white/10"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[28%] rounded-full border border-dashed border-white/[0.08]"
      />

      {orbitNodes.map((node, index) => (
        <motion.span
          key={`${node.delay}-${index}`}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0.35, 1, 0.5], scale: [0.8, 1.15, 0.9] }}
          transition={{ duration: 5.5, repeat: Infinity, delay: node.delay }}
          className={`absolute ${node.size} rounded-full bg-gradient-to-br from-white to-accent shadow-[0_0_24px_rgba(116,248,211,0.5)]`}
          style={{
            top: node.top,
            right: node.right,
            bottom: node.bottom,
            left: node.left,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0.6, scale: 0.95 }}
        animate={{ opacity: [0.65, 1, 0.7], scale: [0.95, 1.02, 0.96] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 flex h-[260px] w-[260px] items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(142,168,255,0.22),transparent_32%),radial-gradient(circle_at_70%_65%,rgba(116,248,211,0.2),transparent_30%),linear-gradient(180deg,rgba(10,16,32,0.98),rgba(9,11,24,0.72))] shadow-[0_0_120px_rgba(116,248,211,0.12)]"
      >
        <span className="absolute inset-[10%] rounded-full border border-white/[0.08]" />
        <span className="absolute inset-[18%] rounded-full border border-white/[0.08] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)]" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[22%] rounded-full border border-dashed border-accent/25"
        />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white/70">
            <Orbit className="h-3.5 w-3.5 text-accent" />
            Ecosystem Hub
          </span>
          <div>
            <p className="font-display text-4xl tracking-[0.24em] text-white">SOLARK</p>
            <p className="mt-1 text-sm uppercase tracking-[0.5em] text-white/[0.42]">Alive On-Chain</p>
          </div>
        </div>
      </motion.div>

      {portalCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: [0, -8, 0] }}
          transition={{
            opacity: { duration: 0.7, delay: 0.25 + index * 0.2 },
            y: { duration: 7 + index, repeat: Infinity, ease: "easeInOut" },
          }}
          className={`absolute z-20 w-[220px] rounded-[1.75rem] border border-white/[0.12] bg-[#0d1327]/80 p-4 shadow-card backdrop-blur-xl ${card.className}`}
        >
          <div className={`absolute inset-0 rounded-[1.75rem] bg-gradient-to-br ${card.glow} opacity-70`} />
          <div className="relative">
            <div className="mb-5 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/[0.72]">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                {card.label}
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-white/80">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
            <p className="font-display text-xl text-white">{card.title}</p>
            <p className="mt-2 text-sm leading-6 text-white/[0.66]">{card.copy}</p>
            <Link
              href={card.href}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-accent hover:text-white"
            >
              Enter portal
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      ))}

      <motion.div
        animate={{ x: [0, 14, 0], y: [0, -12, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-[16%] h-20 w-20 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,159,102,0.32),transparent_68%)] blur-xl"
      />
      <motion.div
        animate={{ x: [0, -10, 0], y: [0, 10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[18%] top-12 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(116,248,211,0.28),transparent_72%)] blur-xl"
      />
    </div>
  );
}
