# SolarkBot — Crypto-Native AI Assistant on Solana  
( https://solarkbot.xyz )

 Built for Solana: AI assistant with wallet authentication, x402 micropayments, and autonomous agent capabilities. Open source, self-hostable, built for the decentralized web.

## Features

- **Wallet Authentication** — Sign In With Solana (SIWS) as the identity layer. No emails, no passwords.
- **x402 Micropayments** — HTTP 402 Payment Required protocol for pay-per-use AI interactions using USDC on Solana.
- **Autonomous Agent Tools** — AI agents that can read wallet balances, execute swaps via Jupiter, send tokens, resolve .sol domains, and interact with Solana DeFi protocols.
- **Pluggable AI** — Switch between OpenAI (GPT-4o) and Anthropic (Claude Sonnet) with one env var.
- **Self-Hostable** — Docker Compose setup for easy deployment.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Wallet | @solana/wallet-adapter-react, @solana/web3.js v1 |
| Auth | NextAuth.js with custom Solana credential provider |
| Backend | Next.js API Routes, Prisma ORM, PostgreSQL, Redis |
| AI | OpenAI SDK / Anthropic SDK (pluggable) |
| Payments | x402 protocol, USDC on Solana |
| DeFi | Jupiter Aggregator API for swaps |
| Infra | Docker, docker-compose |

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- A Solana wallet (Phantom, Solflare, etc.)

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/solarkbot.git
cd solarkbot

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your values (at minimum):
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - AI provider key (OPENAI_API_KEY or ANTHROPIC_API_KEY)
# - MERCHANT_WALLET_ADDRESS (your Solana wallet for receiving payments)

# Generate Prisma client and push schema
npm run db:generate
npm run db:push

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Deployment

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with your production values

# Start all services
docker-compose up -d

# The app will be available at http://localhost:3000 (https://solarkbot.xyz )
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTAUTH_URL` | Yes | Your app URL (e.g., `https://solarkbot.xyz`) |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT signing |
| `AI_PROVIDER` | Yes | `openai` or `anthropic` |
| `OPENAI_API_KEY` | If using OpenAI | OpenAI API key |
| `ANTHROPIC_API_KEY` | If using Anthropic | Anthropic API key |
| `AI_MODEL` | No | Model name (default: `gpt-4o` or `claude-sonnet-4-20250514`) |
| `SOLANA_NETWORK` | No | `devnet` (default) or `mainnet-beta` |
| `SOLANA_RPC_URL` | No | Custom RPC URL (default: public devnet) |
| `MERCHANT_WALLET_ADDRESS` | Yes | Solana wallet to receive x402 payments |
| `CHAT_PRICE_USDC` | No | Price per AI message in USDC (default: `0.001`) |
| `FREE_MESSAGES_PER_DAY` | No | Free messages per wallet per day (default: `10`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Next.js App   │────▶│  API Routes      │────▶│  PostgreSQL │
│   (React UI)    │     │  (Route Handlers)│     │  (Prisma)   │
│                 │     │                  │     └─────────────┘
│  Wallet Adapter │     │  NextAuth (SIWS) │
│  x402 Client    │     │  x402 Middleware  │     ┌─────────────┐
│  Chat UI        │     │  AI Agent Loop   │────▶│   Redis     │
└─────────────────┘     │  Tool Executor   │     └─────────────┘
                        └──────────────────┘
                               │
                        ┌──────┴──────┐
                        ▼             ▼
                 ┌────────────┐ ┌──────────┐
                 │  Solana    │ │  AI API  │
                 │  (web3.js) │ │ (OpenAI/ │
                 │  Jupiter   │ │ Anthropic│
                 └────────────┘ └──────────┘
```

## Agent Tools

The AI assistant has access to these Solana-native tools:

| Tool | Description | Type |
|------|-------------|------|
| `get_wallet_balance` | Get SOL and token balances | Read-only |
| `get_token_price` | Get real-time USD token prices | Read-only |
| `prepare_token_transfer` | Prepare a token transfer tx | Requires signing |
| `prepare_swap` | Prepare a Jupiter swap tx | Requires signing |
| `get_transaction_history` | Get recent wallet transactions | Read-only |
| `lookup_solana_domain` | Resolve .sol domains | Read-only |
| `get_defi_position` | Check DeFi protocol positions | Read-only |

Write operations (transfers, swaps) always return unsigned transactions that the user must approve and sign in their wallet.

## x402 Payment Flow

1. Client sends request to protected endpoint
2. If no payment and free tier exhausted → HTTP 402 with `PAYMENT-REQUIRED` header
3. Client builds USDC transfer tx, signs with wallet (does NOT submit)
4. Client re-sends request with `X-PAYMENT` header containing signed tx
5. Server verifies and submits tx, returns response with `X-PAYMENT-RECEIPT`

## Security

- Wallet-based auth only (no passwords to leak)
- Nonce-based replay attack prevention
- Rate limiting (60 req/min per wallet)
- Agent spending limits (configurable max per action)
- No private keys stored server-side for user wallets
- All write operations require explicit user wallet signing
- Input validation with Zod on all API endpoints

## Development

```bash
# Run dev server
npm run dev

# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed
```

### Devnet Testing

1. Install Solana CLI and switch to devnet
2. Airdrop SOL: `solana airdrop 2`
3. Switch Phantom to devnet: Settings → Developer Settings → Change Network
4. Run the setup script: `bash scripts/setup-devnet.sh`

## License

MIT


