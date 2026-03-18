type IssueSeverity = "error" | "warning";
type IssueScope = "auth" | "database" | "redis" | "ai" | "payments" | "solana";

export interface RuntimeConfigIssue {
  id: string;
  severity: IssueSeverity;
  scope: IssueScope;
  message: string;
}

function getEnv(name: string) {
  return process.env[name]?.trim() || "";
}

function isLocalHost(host: string | null) {
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function isProductionDeployment() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

function getUrlHost(value: string) {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isPlaceholder(value: string) {
  const normalized = value.toLowerCase();
  return (
    !value ||
    normalized.includes("your-") ||
    normalized.includes("replace_with_") ||
    normalized.includes("generate-a-random") ||
    normalized === "change-me-before-production-change-me"
  );
}

function addIssue(
  issues: RuntimeConfigIssue[],
  id: string,
  severity: IssueSeverity,
  scope: IssueScope,
  message: string
) {
  issues.push({ id, severity, scope, message });
}

export function getRuntimeConfigIssues() {
  const issues: RuntimeConfigIssue[] = [];
  const isProduction = isProductionDeployment();
  const databaseUrl = getEnv("DATABASE_URL");
  const redisUrl = getEnv("REDIS_URL");
  const authUrl = getEnv("BETTER_AUTH_URL") || getEnv("NEXTAUTH_URL");
  const authSecret = getEnv("BETTER_AUTH_SECRET") || getEnv("NEXTAUTH_SECRET");
  const appUrl = getEnv("NEXT_PUBLIC_APP_URL");
  const aiProvider = (getEnv("AI_PROVIDER") || "openai").toLowerCase();
  const merchantWallet = getEnv("MERCHANT_WALLET_ADDRESS");

  if (!authUrl) {
    addIssue(
      issues,
      "missing-auth-url",
      "error",
      "auth",
      "BETTER_AUTH_URL is missing. Set it to https://solarkbot.xyz in production."
    );
  } else if (isProduction && isLocalHost(getUrlHost(authUrl))) {
    addIssue(
      issues,
      "local-auth-url",
      "error",
      "auth",
      "BETTER_AUTH_URL still points to localhost. Update it to https://solarkbot.xyz in Vercel."
    );
  }

  if (isProduction && appUrl && isLocalHost(getUrlHost(appUrl))) {
    addIssue(
      issues,
      "local-app-url",
      "warning",
      "auth",
      "NEXT_PUBLIC_APP_URL points to localhost. Public links will be wrong in production."
    );
  }

  if (isPlaceholder(authSecret)) {
    addIssue(
      issues,
      "missing-auth-secret",
      "error",
      "auth",
      "BETTER_AUTH_SECRET is missing or still using a placeholder value."
    );
  }

  if (!databaseUrl) {
    addIssue(
      issues,
      "missing-database-url",
      "warning",
      "database",
      "DATABASE_URL is missing. The app will run in stateless mode without saved chats until a hosted Postgres URL is configured."
    );
  } else {
    const databaseHost = getUrlHost(databaseUrl);
    if (isProduction && isLocalHost(databaseHost)) {
      addIssue(
        issues,
        "local-database-url",
        "warning",
        "database",
        "DATABASE_URL points to localhost. Vercel cannot reach your local Postgres, so the app will run in stateless mode."
      );
    }
  }

  if (!redisUrl) {
    addIssue(
      issues,
      "missing-redis-url",
      "warning",
      "redis",
      "REDIS_URL is missing. The app will fall back to Postgres for nonce and usage tracking, but hosted Redis is still recommended."
    );
  } else {
    const redisHost = getUrlHost(redisUrl);
    if (isProduction && isLocalHost(redisHost)) {
      addIssue(
        issues,
        "local-redis-url",
        "warning",
        "redis",
        "REDIS_URL points to localhost. Vercel cannot reach your local Redis, so the app will fall back to Postgres."
      );
    }
  }

  if (aiProvider === "groq" && isPlaceholder(getEnv("GROQ_API_KEY"))) {
    addIssue(
      issues,
      "missing-groq-key",
      "error",
      "ai",
      "GROQ_API_KEY is missing, so chat completions will fail."
    );
  }

  if (aiProvider === "openai" && isPlaceholder(getEnv("OPENAI_API_KEY"))) {
    addIssue(
      issues,
      "missing-openai-key",
      "error",
      "ai",
      "OPENAI_API_KEY is missing, so chat completions will fail."
    );
  }

  if (aiProvider === "anthropic" && isPlaceholder(getEnv("ANTHROPIC_API_KEY"))) {
    addIssue(
      issues,
      "missing-anthropic-key",
      "error",
      "ai",
      "ANTHROPIC_API_KEY is missing, so chat completions will fail."
    );
  }

  if (isPlaceholder(merchantWallet)) {
    addIssue(
      issues,
      "missing-merchant-wallet",
      "warning",
      "payments",
      "MERCHANT_WALLET_ADDRESS is not configured. Payment-gated flows will not work correctly."
    );
  }

  return issues;
}

export function getBlockingRuntimeConfigIssues() {
  return getRuntimeConfigIssues().filter((issue) => issue.severity === "error");
}
