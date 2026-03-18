import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

/** Singleton Redis client — reused across hot reloads in development */
export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

/** Store a nonce in Redis with 5-minute TTL */
export async function storeNonce(walletAddress: string, nonce: string): Promise<void> {
  await redis.set(`nonce:${walletAddress}`, nonce, "EX", 300);
}

/** Retrieve and delete a nonce (one-time use) */
export async function consumeNonce(walletAddress: string): Promise<string | null> {
  const nonce = await redis.get(`nonce:${walletAddress}`);
  if (nonce) {
    await redis.del(`nonce:${walletAddress}`);
  }
  return nonce;
}

/** Check and increment rate limit. Returns true if the request is allowed. */
export async function checkRateLimit(
  walletAddress: string,
  limit: number = 60,
  windowSeconds: number = 60
): Promise<boolean> {
  const key = `ratelimit:${walletAddress}`;
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }
  return current <= limit;
}

/** Track free message usage per wallet per day */
export async function checkFreeMessages(walletAddress: string): Promise<{ used: number; allowed: boolean }> {
  const maxFree = parseInt(process.env.FREE_MESSAGES_PER_DAY || "10", 10);
  const key = `free:${walletAddress}:${new Date().toISOString().slice(0, 10)}`;
  const used = parseInt((await redis.get(key)) || "0", 10);
  return { used, allowed: used < maxFree };
}

/** Increment free message counter */
export async function incrementFreeMessages(walletAddress: string): Promise<void> {
  const key = `free:${walletAddress}:${new Date().toISOString().slice(0, 10)}`;
  const pipeline = redis.pipeline();
  pipeline.incr(key);
  pipeline.expire(key, 86400); // 24 hours
  await pipeline.exec();
}
