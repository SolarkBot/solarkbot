import Redis from "ioredis";
import { prisma } from "./db/prisma";

const globalForRedis = globalThis as unknown as {
  redis: Redis | null | undefined;
};

function isProductionDeployment() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

function getRedisHost(redisUrl: string) {
  try {
    return new URL(redisUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function getConfiguredRedisUrl() {
  const configuredUrl = process.env.REDIS_URL?.trim();
  if (configuredUrl) {
    return configuredUrl;
  }

  if (!isProductionDeployment()) {
    return "redis://localhost:6379";
  }

  return null;
}

function createRedisClient() {
  const redisUrl = getConfiguredRedisUrl();
  if (!redisUrl) {
    return null;
  }

  const redisHost = getRedisHost(redisUrl);
  if (isProductionDeployment() && (redisHost === "localhost" || redisHost === "127.0.0.1" || redisHost === "::1")) {
    return null;
  }

  return new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });
}

function getRedisClient() {
  if (globalForRedis.redis !== undefined) {
    return globalForRedis.redis ?? null;
  }

  const client = createRedisClient();
  globalForRedis.redis = client ?? null;

  return client;
}

async function runWithRedisFallback<T>(
  label: string,
  redisTask: (client: Redis) => Promise<T>,
  fallbackTask: () => Promise<T>
) {
  const client = getRedisClient();
  if (client) {
    try {
      return await redisTask(client);
    } catch (error) {
      console.error(`Redis operation failed for ${label}, falling back to database:`, error);
    }
  }

  return fallbackTask();
}

function getEndOfToday() {
  const date = new Date();
  date.setUTCHours(23, 59, 59, 999);
  return date;
}

async function setCounterValue(identifier: string, value: number, expiresAt: Date) {
  const now = new Date();
  const existing = await prisma.verification.findFirst({
    where: {
      identifier,
      expiresAt: {
        gt: now,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (existing) {
    await prisma.verification.update({
      where: { id: existing.id },
      data: {
        value: String(value),
        expiresAt,
      },
    });
    return;
  }

  await prisma.verification.create({
    data: {
      identifier,
      value: String(value),
      expiresAt,
    },
  });
}

async function getCounterValue(identifier: string) {
  const now = new Date();
  const record = await prisma.verification.findFirst({
    where: {
      identifier,
      expiresAt: {
        gt: now,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return record ? parseInt(record.value || "0", 10) : 0;
}

async function storeNonceInDatabase(walletAddress: string, nonce: string) {
  const identifier = `nonce:${walletAddress}`;
  await prisma.verification.deleteMany({
    where: { identifier },
  });
  await prisma.verification.create({
    data: {
      identifier,
      value: nonce,
      expiresAt: new Date(Date.now() + 300_000),
    },
  });
}

async function consumeNonceFromDatabase(walletAddress: string) {
  const identifier = `nonce:${walletAddress}`;
  const now = new Date();
  const record = await prisma.verification.findFirst({
    where: {
      identifier,
      expiresAt: {
        gt: now,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  await prisma.verification.deleteMany({
    where: { identifier },
  });

  return record?.value ?? null;
}

function getRateLimitIdentifier(walletAddress: string, windowSeconds: number) {
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
  return `ratelimit:${walletAddress}:${windowSeconds}:${bucket}`;
}

function getFreeMessageIdentifier(walletAddress: string) {
  return `free:${walletAddress}:${new Date().toISOString().slice(0, 10)}`;
}

/** Store a nonce with 5-minute TTL. Redis is preferred, DB is the fallback. */
export async function storeNonce(walletAddress: string, nonce: string): Promise<void> {
  try {
    await runWithRedisFallback(
      "storeNonce",
      async (client) => {
        await client.set(`nonce:${walletAddress}`, nonce, "EX", 300);
      },
      () => storeNonceInDatabase(walletAddress, nonce)
    );
  } catch (error) {
    console.error("Failed to store nonce in Redis and Postgres:", error);
  }
}

/** Retrieve and delete a nonce (one-time use). */
export async function consumeNonce(walletAddress: string): Promise<string | null> {
  try {
    return await runWithRedisFallback(
      "consumeNonce",
      async (client) => {
        const identifier = `nonce:${walletAddress}`;
        const nonce = await client.get(identifier);
        if (nonce) {
          await client.del(identifier);
        }
        return nonce;
      },
      () => consumeNonceFromDatabase(walletAddress)
    );
  } catch (error) {
    console.error("Failed to consume nonce from Redis and Postgres:", error);
    return null;
  }
}

/** Check and increment rate limit. Returns true if the request is allowed. */
export async function checkRateLimit(
  walletAddress: string,
  limit: number = 60,
  windowSeconds: number = 60
): Promise<boolean> {
  try {
    return await runWithRedisFallback(
      "checkRateLimit",
      async (client) => {
        const key = `ratelimit:${walletAddress}`;
        const current = await client.incr(key);
        if (current === 1) {
          await client.expire(key, windowSeconds);
        }
        return current <= limit;
      },
      async () => {
        const identifier = getRateLimitIdentifier(walletAddress, windowSeconds);
        const current = (await getCounterValue(identifier)) + 1;
        await setCounterValue(
          identifier,
          current,
          new Date(Date.now() + windowSeconds * 1000)
        );
        return current <= limit;
      }
    );
  } catch (error) {
    console.error("Failed to apply rate limiting in Redis and Postgres:", error);
    return true;
  }
}

/** Track free message usage per wallet per day */
export async function checkFreeMessages(walletAddress: string): Promise<{ used: number; allowed: boolean }> {
  const maxFree = parseInt(process.env.FREE_MESSAGES_PER_DAY || "10", 10);

  try {
    return await runWithRedisFallback(
      "checkFreeMessages",
      async (client) => {
        const key = getFreeMessageIdentifier(walletAddress);
        const used = parseInt((await client.get(key)) || "0", 10);
        return { used, allowed: used < maxFree };
      },
      async () => {
        const used = await getCounterValue(getFreeMessageIdentifier(walletAddress));
        return { used, allowed: used < maxFree };
      }
    );
  } catch (error) {
    console.error("Failed to read free-message usage from Redis and Postgres:", error);
    return { used: 0, allowed: true };
  }
}

/** Increment free message counter */
export async function incrementFreeMessages(walletAddress: string): Promise<void> {
  try {
    await runWithRedisFallback(
      "incrementFreeMessages",
      async (client) => {
        const key = getFreeMessageIdentifier(walletAddress);
        const pipeline = client.pipeline();
        pipeline.incr(key);
        pipeline.expire(key, 86400);
        await pipeline.exec();
      },
      async () => {
        const identifier = getFreeMessageIdentifier(walletAddress);
        const current = (await getCounterValue(identifier)) + 1;
        await setCounterValue(identifier, current, getEndOfToday());
      }
    );
  } catch (error) {
    console.error("Failed to increment free-message usage in Redis and Postgres:", error);
  }
}
