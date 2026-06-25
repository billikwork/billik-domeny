import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getSitesForDashboard } from "@/lib/sites-meta";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sites = await getSitesForDashboard();
  return NextResponse.json(
    { sites },
    { headers: { "Cache-Control": "private, max-age=60" } },
  );
}