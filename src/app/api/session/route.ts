import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getAuthSession(request);
  return NextResponse.json(session ?? null);
}
