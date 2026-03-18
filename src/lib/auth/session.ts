import { auth } from ".";
import {
  FALLBACK_SESSION_COOKIE_NAME,
  parseCookieHeader,
  readFallbackSessionCookie,
} from "./fallback-session";

export async function getAuthSession(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (session?.session && session?.user) {
      return session;
    }
  } catch (error) {
    console.error("Better Auth getSession failed, trying fallback cookie session:", error);
  }

  const cookies = parseCookieHeader(request.headers.get("cookie"));
  return readFallbackSessionCookie(cookies.get(FALLBACK_SESSION_COOKIE_NAME));
}

export async function getSessionWalletAddress(request: Request) {
  const session = await getAuthSession(request);
  return session?.user?.name ?? null;
}
