import { NextResponse } from "next/server";
import { getTrustScore, getActions } from "@/lib/db";
import { getTrustLevel } from "@/lib/trust";

export async function GET() {
  const score = getTrustScore();
  return NextResponse.json({
    score,
    level: getTrustLevel(score),
    actions: getActions(50),
  });
}
