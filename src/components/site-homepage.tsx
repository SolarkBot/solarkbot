import { ArrowRight, ArrowUpRight, Github, Sparkles } from "lucide-react";
import Link from "next/link";

import { ContractPanel } from "@/components/contract-panel";
import { HeroVisual } from "@/components/hero-visual";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import {
  featuredProducts,
  futureCards,
  heroLinks,
  heroStats,
  signalCards,
  valueProps,
} from "@/lib/site-data";

function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(142,168,255,0.24),transparent_65%)] blur-3xl" />
        <div className="absolute left-[10%] top-40 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,159,102,0.18),transparent_70%)] blur-3xl" />
        <div className="absolute right-[8%] top-44 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(116,248,211,0.18),transparent_72%)] blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-16 px-6 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:pb-28">
        <Reveal className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[11px] uppercase tracking-[0.34em] text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Crypto apps, made fun and interactive
          </span>
          <h1 className="mt-7 max-w-3xl font-display text-5xl leading-[0.96] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            Crypto apps
            <span className="block bg-[linear-gradient(120deg,#ffffff_0%,#9cebdd_48%,#ffbf8b_100%)] bg-clip-text text-transparent">
              that feel alive
            </span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/[0.66] sm:text-xl">
            SolarkBot builds immersive crypto products that turn on-chain actions into playful
            experiences instead of dead dashboards. This is the front door to a growing ecosystem of
            living interfaces.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Link
              href={heroLinks.dex}
              target="_blank"
              rel="noreferrer noopener"
              className="button-primary"
            >
              Explore DEX
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href={heroLinks.nft}
              target="_blank"
              rel="noreferrer noopener"
              className="button-secondary"
            >
              Enter NFT Studio
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="#ecosystem"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.28em] text-white/[0.62] transition hover:text-white"
            >
              View Ecosystem
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {heroStats.map((item, index) => (
              <Reveal
                key={item.label}
                delay={0.08 * index}
                className="rounded-[1.6rem] border border-white/[0.08] bg-white/[0.035] p-5 shadow-card backdrop-blur-sm"
              >
                <div className="font-display text-3xl text-white">{item.value}</div>
                <p className="mt-2 text-sm uppercase tracking-[0.22em] text-white/[0.46]">{item.label}</p>
              </Reveal>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15} className="relative">
          <HeroVisual />
        </Reveal>
      </div>
    </section>
  );
}

function BrandStatement() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-5xl px-6 py-6 sm:px-8 lg:px-12">
        <Reveal className="surface-card rounded-[2.3rem] p-8 text-center sm:p-10">
          <p className="eyebrow mb-4">Brand Thesis</p>
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
            Not another boring crypto interface
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-white/[0.66] sm:text-lg">
            Most crypto products feel mechanical and lifeless. SolarkBot builds with motion,
            atmosphere, and interaction so every action feels more memorable, more visual, and more
            like an experience.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function FeaturedProducts() {
  return (
    <section id="products" className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
      <Reveal>
        <SectionHeading
          eyebrow="Current Portals"
          title="Live products with more pulse than the average crypto stack"
          description="The SolarkBot ecosystem already has live apps in market and creation. More portals are on the way."
        />
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {featuredProducts.map((product, index) => (
          <Reveal key={product.title} delay={0.08 * index}>
            <div className="group relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1326]/80 p-6 shadow-card backdrop-blur-xl transition duration-500 hover:-translate-y-1.5 hover:border-white/[0.16]">
              <div className={`absolute inset-0 bg-gradient-to-br ${product.accent} opacity-90`} />
              <div className="absolute inset-x-0 top-0 h-px bg-white/[0.16]" />
              <div className="relative flex h-full flex-col">
                <div className="mb-8 flex items-center justify-between">
                  <span className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/[0.72]">
                    {product.badge}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/[0.42]">
                    Product
                  </span>
                </div>
                <h3 className="font-display text-3xl text-white">{product.title}</h3>
                <p className="mt-3 text-sm uppercase tracking-[0.24em] text-accent/[0.85]">
                  {product.subtitle}
                </p>
                <p className="mt-6 flex-1 text-base leading-7 text-white/[0.66]">{product.description}</p>
                <Link
                  href={product.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.28em] text-white transition group-hover:text-accent"
                >
                  {product.cta}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function WhySection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Reveal>
          <SectionHeading
            eyebrow="Why SolarkBot"
            title="We build playful on-chain experiences, not dead dashboards"
            description="Every SolarkBot product is shaped around feeling, motion, and clarity as much as core functionality."
          />
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2">
          {valueProps.map((item, index) => (
            <Reveal key={item.title} delay={0.06 * index}>
              <div className="surface-card group h-full rounded-[1.8rem] p-6 transition duration-500 hover:-translate-y-1.5">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-accent">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-2xl text-white">{item.title}</h3>
                <p className="mt-3 text-base leading-7 text-white/[0.64]">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function EcosystemSection() {
  return (
    <section id="ecosystem" className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
      <Reveal>
        <SectionHeading
          eyebrow="Future Surface"
          title="An expanding crypto playground"
          description="SolarkBot is building a larger universe of apps and experiments. These cards point to the directions ahead without pretending those products are already launched."
        />
      </Reveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {futureCards.map((item, index) => (
          <Reveal key={item.title} delay={0.06 * index}>
            <div className="group relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.035] p-6 shadow-card backdrop-blur-sm transition duration-500 hover:-translate-y-1 hover:border-white/[0.18]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(142,168,255,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(116,248,211,0.12),transparent_36%)] opacity-0 transition duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/[0.46]">
                  Coming soon
                </div>
                <h3 className="font-display text-2xl text-white">{item.title}</h3>
                <p className="mt-3 text-base leading-7 text-white/[0.64]">{item.description}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function SignalsSection() {
  return (
    <section id="signals" className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <Reveal>
          <SectionHeading
            eyebrow="Open Build Signals"
            title="Real signals, no fake social proof"
            description="Trust comes from live products, visible links, and a brand that is clearly building out into a broader crypto-native world."
          />

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href={heroLinks.github}
              target="_blank"
              rel="noreferrer noopener"
              className="button-secondary"
            >
              <Github className="h-4 w-4" />
              GitHub Org
            </Link>
            <Link
              href={heroLinks.x}
              target="_blank"
              rel="noreferrer noopener"
              className="button-secondary"
            >
              <ArrowUpRight className="h-4 w-4" />
              Follow on X
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2">
          {signalCards.map((item, index) => (
            <Reveal key={item.title} delay={0.06 * index}>
              <div className="surface-card h-full rounded-[1.7rem] p-6">
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-accent">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-2xl text-white">{item.title}</h3>
                <p className="mt-3 text-base leading-7 text-white/[0.64]">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
      <Reveal className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[rgba(13,19,38,0.86)] p-8 shadow-card backdrop-blur-2xl sm:p-10 lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,159,102,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(116,248,211,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">Final Portal</p>
            <h2 className="font-display text-4xl tracking-tight text-white sm:text-5xl">
              Step into the SolarkBot universe
            </h2>
            <p className="mt-5 text-base leading-8 text-white/[0.66] sm:text-lg">
              Explore the live products, follow the brand, and keep close to the next wave of
              interactive crypto releases.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap lg:justify-end">
            <Link
              href={heroLinks.dex}
              target="_blank"
              rel="noreferrer noopener"
              className="button-primary"
            >
              Launch DEX
            </Link>
            <Link
              href={heroLinks.nft}
              target="_blank"
              rel="noreferrer noopener"
              className="button-secondary"
            >
              Visit NFT Studio
            </Link>
            <Link
              href={heroLinks.x}
              target="_blank"
              rel="noreferrer noopener"
              className="button-secondary"
            >
              Follow on X
            </Link>
            <Link
              href={heroLinks.github}
              target="_blank"
              rel="noreferrer noopener"
              className="button-secondary"
            >
              GitHub
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function SiteHomepage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,18,0.18),rgba(5,8,18,0.6))]" />
      <div className="noise-mask pointer-events-none absolute inset-0 opacity-[0.045]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <SiteNavbar />

      <main className="relative z-10">
        <HeroSection />
        <BrandStatement />
        <FeaturedProducts />
        <WhySection />
        <EcosystemSection />
        <SignalsSection />

        <section id="contract" className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
          <Reveal>
            <ContractPanel />
          </Reveal>
        </section>

        <FinalCta />
      </main>

      <SiteFooter />
    </div>
  );
}
