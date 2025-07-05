
import { NextResponse } from "next/server";
import { getRecommendations } from "@/lib/recommendations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const budget = Number(searchParams.get("budget")) || 0;
  const origin = searchParams.get("origin") || "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json(
      { error: "Date range parameters are missing" },
      { status: 400 }
    );
  }

  const recommendations = getRecommendations(budget, origin, {
    from: new Date(from),
    to: new Date(to),
  });
  return NextResponse.json(recommendations);
}
