type HeadersLike = {
  get(name: string): string | null;
};

type RequestLike = {
  headers?: HeadersLike;
};

function isProductionDeployment() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

function getNormalizedHost(value: string) {
  return value.trim().toLowerCase();
}

function getHostname(host: string) {
  if (host.startsWith("[")) {
    const closingBracketIndex = host.indexOf("]");
    return closingBracketIndex >= 0
      ? host.slice(1, closingBracketIndex)
      : host;
  }

  return host.split(":")[0];
}

function isLocalDevHost(host: string | null) {
  if (!host) {
    return false;
  }

  const hostname = getHostname(host);
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  );
}

function getRequestHost(headers?: HeadersLike) {
  const forwardedHost = headers?.get("x-forwarded-host");
  const host = forwardedHost || headers?.get("host");

  if (!host) {
    return null;
  }

  return getNormalizedHost(host.split(",")[0]);
}

function getRequestProtocol(headers?: HeadersLike) {
  const forwardedProtocol = headers?.get("x-forwarded-proto");
  if (forwardedProtocol) {
    return getNormalizedHost(forwardedProtocol.split(",")[0]);
  }

  return isProductionDeployment() ? "https" : "http";
}

function getRequestOrigin(headers?: HeadersLike) {
  const requestHost = getRequestHost(headers);
  if (!requestHost) {
    return null;
  }

  return `${getRequestProtocol(headers)}://${requestHost}`;
}

function getHeadersFromRequest(
  request?: RequestLike | HeadersLike
): HeadersLike | undefined {
  if (!request) {
    return undefined;
  }

  if ("get" in request) {
    return request;
  }

  return request.headers;
}

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
  return new URL(getAuthBaseUrl()).host.toLowerCase();
}

export function getRequestAwareExpectedAuthHost(headers?: HeadersLike) {
  const configuredHost = getExpectedAuthHost();

  if (isProductionDeployment()) {
    return configuredHost;
  }

  const requestHost = getRequestHost(headers);
  if (isLocalDevHost(requestHost)) {
    return requestHost;
  }

  return configuredHost;
}

export function getTrustedAuthOrigins(request?: RequestLike | HeadersLike) {
  const configuredOrigin = getAuthBaseUrl();
  const headers = getHeadersFromRequest(request);
  const requestHost = getRequestHost(headers);
  const requestOrigin = getRequestOrigin(headers);

  if (isProductionDeployment() || !isLocalDevHost(requestHost) || !requestOrigin) {
    return [configuredOrigin];
  }

  return Array.from(new Set([configuredOrigin, requestOrigin]));
}

export function isBetterAuthInfraEnabled() {
  return Boolean(process.env.BETTER_AUTH_API_KEY);
}
