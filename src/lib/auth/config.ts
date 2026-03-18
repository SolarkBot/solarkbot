export function getAuthBaseUrl() {
  return process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || "https://solarkbot.xyz";
}

export function getAuthSecret() {
  return (
    process.env.BETTER_AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "change-me-before-production-change-me"
  );
}

export function getExpectedAuthHost() {
  return new URL(getAuthBaseUrl()).host;
}

export function isBetterAuthInfraEnabled() {
  return Boolean(process.env.BETTER_AUTH_API_KEY);
}
