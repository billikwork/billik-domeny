import { NextResponse } from "next/server";
import { createSessionToken, sessionCookieOptions, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  const password = body.password ?? "";

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured on the server." },
      { status: 500 },
    );
  }

  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "Nesprávne heslo." }, { status: 401 });
  }

  const token = createSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Session could not be created." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  const opts = sessionCookieOptions();
  response.cookies.set(opts.name, token, opts);
  return response;
}