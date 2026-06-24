"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const onSitePage = pathname.startsWith("/sites/");

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0a0a0b]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" className="flex shrink-0 cursor-pointer items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffd700] text-lg font-bold text-black shadow-[0_4px_20px_rgba(255,215,0,0.25)]">
                B
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold tracking-wide text-white">Billik Admin</p>
                <p className="text-xs text-zinc-500">Správa stránok</p>
              </div>
            </Link>

            {onSitePage ? (
              <Link
                href="/"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-400 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Domény
              </Link>
            ) : null}
          </div>

          <Button variant="secondary" size="sm" onClick={logout} loading={loggingOut}>
            Odhlásiť sa
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl tracking-wide text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h1>
          {subtitle ? <p className="mt-2 text-base text-zinc-400">{subtitle}</p> : null}
        </div>
        {children}
      </main>
    </div>
  );
}