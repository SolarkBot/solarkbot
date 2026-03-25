# SolarkBot

Crypto-native AI assistant for Solana with wallet sign-in, Groq/OpenAI/Anthropic model support, x402 payment flows, agent tools for balances, transfers, swaps, and onchain lookups, plus companion NFT and DEX product surfaces.

## Features

- Solana wallet sign-in powered by Better Auth and a custom SIWS flow
- Groq, OpenAI, or Anthropic as pluggable AI providers
- x402-style payment endpoints for paid usage
- Solana-aware tools for balances, transfers, swaps, history, and `.sol` resolution
- Companion public surfaces at `nft.solarkbot.xyz` and `dex.solarkbot.xyz`
- Prisma + PostgreSQL persistence for users, sessions, chats, tasks, and payments
- Redis-backed nonce storage, rate limits, and free-tier counters

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 14 App Router, React, TypeScript, Tailwind CSS, shadcn/ui |
| Auth | Better Auth, Prisma adapter, optional Better Auth Infra plugins |
| Wallet | `@solana/wallet-adapter-*`, `@solana/web3.js` |
| Backend | Next.js route handlers, Prisma ORM, PostgreSQL, Redis |
| AI | Groq, OpenAI, or Anthropic |
| Payments | x402 helpers on Solana USDC |

## Local Setup

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run dev
```

Local auth now accepts the active loopback host in development, so SIWS works on `localhost` and `127.0.0.1` without editing server code. For the cleanest cookie and link behavior, keep `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, and `NEXTAUTH_URL` aligned with the local URL you actually open in the browser.

If your local dev server starts returning stale `_next` assets or chunk 404s, run this reset path:

```bash
npm run dev:reset
```

That command stops repo-local `next dev` processes, clears `.next`, and starts a fresh dev server. You can pass extra args through to Next, for example `npm run dev:reset -- --hostname 127.0.0.1 --port 3000`.

Production site: [https://solarkbot.xyz](https://solarkbot.xyz).
Companion surfaces: [https://nft.solarkbot.xyz](https://nft.solarkbot.xyz) and [https://dex.solarkbot.xyz](https://dex.solarkbot.xyz).

## Required Environment Variables

### Core app

- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- `DATABASE_URL`
- `REDIS_URL`
- `MERCHANT_WALLET_ADDRESS`

### AI provider

- `AI_PROVIDER` set to `groq`, `openai`, or `anthropic`
- `AI_MODEL`
- `GROQ_API_KEY` if using Groq
- `OPENAI_API_KEY` if using OpenAI
- `ANTHROPIC_API_KEY` if using Anthropic

### Solana

- `SOLANA_NETWORK`
- `SOLANA_RPC_URL`
- `NEXT_PUBLIC_SOLANA_RPC_URL`
- `NEXT_PUBLIC_SOLANA_NETWORK`
- `SOLSCAN_API_KEY` for optional Solscan balance / history lookups
- `SOLSCAN_API_BASE_URL` if you need a non-default Solscan API host

### Optional Better Auth Infra

- `NEXT_PUBLIC_BETTER_AUTH_INFRA_ENABLED=true`
- `BETTER_AUTH_API_KEY`
- `BETTER_AUTH_API_URL`
- `BETTER_AUTH_KV_URL`

### Compatibility fallback

`NEXTAUTH_URL` and `NEXTAUTH_SECRET` are still accepted as fallbacks, but Better Auth env names are now the primary config.

## Production Rollout

Use [.env.vercel](./.env.vercel) as the reference for Vercel. Before redeploying:

1. Set `BETTER_AUTH_URL` and `NEXTAUTH_URL` to `https://solarkbot.xyz`.
2. Replace `DATABASE_URL` with a hosted Postgres connection string.
3. Replace `REDIS_URL` with a hosted Redis connection string.
4. Set `MERCHANT_WALLET_ADDRESS` so payment-gated flows can settle correctly.
5. If the hosted database is new, run `npm run db:push` against it before redeploying.

Production should never point `DATABASE_URL` or `REDIS_URL` at `localhost`, because Vercel cannot reach local services.

## Auth Flow

1. The client requests a nonce from `/api/auth/nonce`.
2. The wallet signs a Sign-In With Solana message.
3. The signed payload is posted to `/api/auth/solana/sign-in`.
4. Better Auth creates the session and stores it in PostgreSQL.
5. Protected routes read the current session through Better Auth.

## Database Notes

The Prisma schema now includes Better Auth tables alongside the app tables:

- `User`
- `Session`
- `Account`
- `Verification`
- `Conversation`
- `Message`
- `AgentTask`
- `Payment`

After pulling auth changes, run:

```bash
npm run db:generate
npm run db:push
```

## Better Auth Infra

This repo conditionally mounts Better Auth Infra only when `BETTER_AUTH_API_KEY` is present on the server and `NEXT_PUBLIC_BETTER_AUTH_INFRA_ENABLED=true` on the client. That keeps local development simple while still supporting `dash()` and `sentinel()` when you want them.

## Build Check

```bash
npm run build
```

On local Windows machines, `npm run build` now detects Prisma engine file locks caused by active Node or Next.js processes. When an existing generated Prisma client is already available, the build reuses it and prints an actionable warning instead of hard-failing. If you want a fully clean local build, stop dev servers first or run `npm run dev:reset`.
