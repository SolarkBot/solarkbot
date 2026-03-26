"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, Sparkles, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { navLinks } from "@/lib/site-data";
import { cn } from "@/lib/utils";

function Brand() {
  return (
    <Link href="#top" className="group inline-flex items-center gap-3">
      <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.06] shadow-card">
        <Image
          src="/solarkbot-logo.png"
          alt="SolarkBot"
          width={44}
          height={44}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.26),transparent_60%)]" />
      </span>
      <span className="flex flex-col">
        <span className="font-display text-lg tracking-[0.22em] text-white sm:text-xl">
          SOLARKBOT
        </span>
        <span className="text-[11px] uppercase tracking-[0.3em] text-white/[0.42]">
          Interactive crypto studio
        </span>
      </span>
    </Link>
  );
}

export function SiteNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const closeMenu = () => setMenuOpen(false);

    window.addEventListener("resize", closeMenu);
    return () => window.removeEventListener("resize", closeMenu);
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          backgroundColor: scrolled ? "rgba(9, 13, 27, 0.76)" : "rgba(9, 13, 27, 0.18)",
          borderColor: scrolled ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(18px)",
        }}
        className="fixed inset-x-4 top-4 z-50 mx-auto max-w-7xl rounded-full border transition-colors"
      >
        <div className="flex items-center justify-between gap-6 px-4 py-3 sm:px-6">
          <Brand />

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer noopener" : undefined}
                className="text-sm tracking-[0.18em] text-white/[0.62] transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href="#ecosystem" className="button-secondary">
              Explore Apps
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.24 }}
            className="fixed inset-x-4 top-24 z-40 rounded-[2rem] border border-white/10 bg-[rgba(9,13,27,0.95)] p-5 shadow-card backdrop-blur-2xl lg:hidden"
          >
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/5 px-4 py-3">
              <Sparkles className="h-4 w-4 text-accent" />
              <p className="text-sm text-white/70">Step into the SolarkBot universe.</p>
            </div>

            <nav className="flex flex-col gap-2">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer noopener" : undefined}
                  className={cn(
                    "rounded-2xl border border-white/[0.08] px-4 py-3 text-sm tracking-[0.18em] text-white/[0.72] transition hover:bg-white/5 hover:text-white",
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link
              href="#ecosystem"
              className="button-primary mt-4 w-full justify-center"
              onClick={() => setMenuOpen(false)}
            >
              Explore Apps
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
