"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100">
      <header className="border-b border-white/10 bg-[#0a0a0b]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffd700] text-lg font-bold text-black">
                B
              </div>
              <div>
                <p className="text-sm font-bold tracking-wide">Billik Admin</p>
                <p className="text-xs text-zinc-500">Správa SEO landing stránok</p>
              </div>
            </Link>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-300 transition hover:border-white/30 hover:text-white"
          >
            Odhlásiť
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl tracking-wide text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h1>
          {subtitle ? <p className="mt-2 text-zinc-400">{subtitle}</p> : null}
        </div>
        {children}
      </main>
    </div>
  );
}