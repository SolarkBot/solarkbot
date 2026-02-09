/**
 * Database seed script for SolarkBot
 * Run with: npm run db:seed (or npx tsx scripts/seed-db.ts)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TEST_WALLETS = [
  "DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy",
  "7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv",
  "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
];

async function main() {
  console.log("Seeding database...\n");

  // Create test users
  for (const walletAddress of TEST_WALLETS) {
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {},
      create: {
        walletAddress,
        freeMessagesUsed: 0,
        totalSpentUsdc: 0,
      },
    });
    console.log(`Created/updated user: ${user.walletAddress}`);

    // Create a test conversation for each user
    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: "Welcome Chat",
        messages: {
          create: [
            {
              role: "assistant",
              content:
                "Welcome to SolarkBot! I'm your crypto-native AI assistant on Solana. I can help you check balances, swap tokens, send transfers, and more. How can I help you today?",
            },
          ],
        },
      },
    });
    console.log(`  Created conversation: ${conversation.id}`);
  }

  // Create some sample agent tasks
  const firstUser = await prisma.user.findFirst();
  if (firstUser) {
    await prisma.agentTask.createMany({
      data: [
        {
          userId: firstUser.id,
          toolName: "get_wallet_balance",
          parameters: { walletAddress: firstUser.walletAddress },
          result: {
            sol: 5.234,
            tokens: [
              { symbol: "USDC", amount: 100.0, mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
            ],
          },
          status: "completed",
          completedAt: new Date(),
        },
        {
          userId: firstUser.id,
          toolName: "get_token_price",
          parameters: { tokenMintAddress: "So11111111111111111111111111111111111111112" },
          result: { symbol: "SOL", price: 185.42, currency: "USD" },
          status: "completed",
          completedAt: new Date(),
        },
      ],
    });
    console.log(`\nCreated sample agent tasks for user: ${firstUser.walletAddress}`);
  }

  console.log("\nDatabase seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
