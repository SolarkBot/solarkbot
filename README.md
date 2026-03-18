# SolarkBot

Crypto-native AI assistant for Solana with wallet sign-in, Groq/OpenAI/Anthropic model support, x402 payment flows, and agent tools for balances, transfers, swaps, and onchain lookups.

## Features

- Solana wallet sign-in powered by Better Auth and a custom SIWS flow
- Groq, OpenAI, or Anthropic as pluggable AI providers
- x402-style payment endpoints for paid usage
- Solana-aware tools for balances, transfers, swaps, history, and `.sol` resolution
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

Production site: [https://solarkbot.xyz](https://solarkbot.xyz).

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
