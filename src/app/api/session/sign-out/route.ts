import { NextRequest, NextResponse } from "next/server";
import {
  FALLBACK_SESSION_COOKIE_NAME,
  getFallbackSessionCookieOptions,
  shouldUseSecureAuthCookies,
} from "@/lib/auth/fallback-session";

export const dynamic = "force-dynamic";

const BETTER_AUTH_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
  "better-auth.csrf_token",
  "__Secure-better-auth.csrf_token",
];

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  const secure = shouldUseSecureAuthCookies(request.headers);

  response.cookies.set(FALLBACK_SESSION_COOKIE_NAME, "", {
    ...getFallbackSessionCookieOptions(secure),
    maxAge: 0,
  });
  response.cookies.set(FALLBACK_SESSION_COOKIE_NAME, "", {
    ...getFallbackSessionCookieOptions(false),
    maxAge: 0,
  });

  for (const cookieName of BETTER_AUTH_COOKIE_NAMES) {
    response.cookies.set(cookieName, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure: secure || cookieName.startsWith("__Secure-"),
    });
    response.cookies.set(cookieName, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });
  }

  return response;
}
