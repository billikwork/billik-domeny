import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { readSiteConfig, writeHeroImage, writeSiteConfig } from "@/lib/github";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file" }, { status: 400 });
  }

  const allowed = ["image/png", "image/jpeg", "image/webp"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Podporované formáty: PNG, JPEG, WebP" }, { status: 400 });
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Maximálna veľkosť súboru je 8 MB" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpeg";
    const hero = await writeHeroImage(id, buffer, extension);

    const site = await readSiteConfig(id);
    site.heroImage = hero.heroImage;
    const save = await writeSiteConfig(site);

    return NextResponse.json({ ok: true, heroImage: hero.heroImage, ...save });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}