import { NextResponse } from "next/server";
import { resetAll } from "@/lib/db";

export async function POST() {
  resetAll();
  return NextResponse.json({ score: 100, level: "trusted" });
}
