import { NextResponse } from "next/server";
import { getAgentBaseUrl, getAgentInstructionText } from "@/lib/agent-guide";

export const dynamic = "force-dynamic";

export async function GET() {
  const text = getAgentInstructionText(getAgentBaseUrl());

  return new NextResponse(text, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
