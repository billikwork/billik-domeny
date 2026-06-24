import { NextResponse } from "next/server";
import type { SiteConfig } from "@billik/site-config";
import { isAuthenticated } from "@/lib/auth";
import { readSiteConfig, writeSiteConfig } from "@/lib/github";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const site = await readSiteConfig(id);
    return NextResponse.json(site);
  } catch {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as SiteConfig;

  if (body.id !== id) {
    return NextResponse.json({ error: "Site id mismatch" }, { status: 400 });
  }

  try {
    const result = await writeSiteConfig(body);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}