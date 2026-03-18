#!/bin/bash
# SolarkBot Devnet Setup Script
# This script sets up a test environment on Solana devnet

set -e

echo "=== SolarkBot Devnet Setup ==="
echo ""

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "Error: Solana CLI is not installed."
    echo "Install it from: https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

# Check if spl-token CLI is installed
if ! command -v spl-token &> /dev/null; then
    echo "Warning: spl-token CLI is not installed."
    echo "Install it with: cargo install spl-token-cli"
    echo "Skipping token operations..."
    SPL_TOKEN_AVAILABLE=false
else
    SPL_TOKEN_AVAILABLE=true
fi

# Switch to devnet
echo "Switching to Solana devnet..."
solana config set --url https://api.devnet.solana.com

# Check for existing keypair or create new one
KEYPAIR_PATH="$HOME/.config/solana/id.json"
if [ -f "$KEYPAIR_PATH" ]; then
    echo "Using existing keypair at $KEYPAIR_PATH"
else
    echo "Creating new keypair..."
    solana-keygen new --no-passphrase -o "$KEYPAIR_PATH"
fi

WALLET_ADDRESS=$(solana address)
echo ""
echo "Wallet address: $WALLET_ADDRESS"

# Airdrop SOL
echo ""
echo "Requesting SOL airdrop (2 SOL)..."
solana airdrop 2 || {
    echo "Airdrop failed. You may have hit the rate limit."
    echo "Try again later or use https://faucet.solana.com"
}

# Wait for confirmation
sleep 5

# Show balance
echo ""
echo "Current SOL balance:"
solana balance

# Devnet USDC info
DEVNET_USDC_MINT="4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
echo ""
echo "=== Devnet USDC Setup ==="
echo "Devnet USDC Mint: $DEVNET_USDC_MINT"

if [ "$SPL_TOKEN_AVAILABLE" = true ]; then
    # Create associated token account for devnet USDC
    echo "Creating USDC token account..."
    spl-token create-account "$DEVNET_USDC_MINT" 2>/dev/null || echo "Token account may already exist"

    echo ""
    echo "To get devnet USDC, you can:"
    echo "  1. Use a devnet USDC faucet"
    echo "  2. Create your own test token mint"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Your test wallet: $WALLET_ADDRESS"
echo "Network: devnet"
echo ""
echo "Add these to your .env file:"
echo "  SOLANA_NETWORK=devnet"
echo "  SOLANA_RPC_URL=https://api.devnet.solana.com"
echo "  MERCHANT_WALLET_ADDRESS=$WALLET_ADDRESS"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env and fill in the values"
echo "  2. Run 'npm install' to install dependencies"
echo "  3. Run 'npm run db:push' to create database tables"
echo "  4. Run 'npm run dev' to start the development server"
echo "  5. Open http://localhost:3000 and connect your wallet"
