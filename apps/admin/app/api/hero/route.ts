import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { isAuthenticated } from "@/lib/auth";
import { heroDirPath } from "@/lib/paths";

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("site");
  const width = Math.min(Number(searchParams.get("w") ?? 720), 1200);

  if (!siteId || !/^[a-z0-9-]+$/.test(siteId)) {
    return new NextResponse("Invalid site", { status: 400 });
  }

  const dir = heroDirPath(siteId);
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const heroFile = files.find((f) => f.startsWith("hero."));
  if (!heroFile) {
    return new NextResponse("Not found", { status: 404 });
  }

  const input = await fs.readFile(path.join(dir, heroFile));
  const optimized = await sharp(input)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();

  return new NextResponse(new Uint8Array(optimized), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "private, max-age=3600",
    },
  });
}