import { NextResponse } from "next/server";
import {
  getBlockingRuntimeConfigIssues,
  getRuntimeConfigIssues,
} from "@/lib/runtime-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const issues = getRuntimeConfigIssues();

  return NextResponse.json({
    ok: getBlockingRuntimeConfigIssues().length === 0,
    issues,
  });
}
