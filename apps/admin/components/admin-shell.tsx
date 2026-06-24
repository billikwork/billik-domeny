"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type SiteNav = { id: string; domain: string; h1: string };

export function AdminShell({
  title,
  subtitle,
  sites = [],
  children,
}: {
  title: string;
  subtitle?: string;
  sites?: SiteNav[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

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
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-white/10 bg-[#0d0d0f] lg:flex">
          <div className="border-b border-white/10 px-5 py-6">
            <Link href="/" className="flex cursor-pointer items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ffd700] text-xl font-bold text-black shadow-[0_4px_20px_rgba(255,215,0,0.3)]">
                B
              </div>
              <div>
                <p className="text-base font-bold tracking-wide text-white">Billik Admin</p>
                <p className="text-sm text-zinc-500">Správa stránok</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Domény
            </p>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-base transition ${
                    pathname === "/"
                      ? "bg-[#ffd700]/15 font-semibold text-[#ffd700]"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                  Prehľad
                </Link>
              </li>
              {sites.map((site) => {
                const href = `/sites/${site.id}`;
                const active = pathname === href;
                return (
                  <li key={site.id}>
                    <Link
                      href={href}
                      className={`flex cursor-pointer flex-col rounded-xl px-3 py-3 transition ${
                        active
                          ? "bg-[#ffd700]/15 text-[#ffd700]"
                          : "text-zinc-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className={`text-base ${active ? "font-semibold" : "font-medium"}`}>
                        www.{site.domain}
                      </span>
                      <span className="mt-0.5 line-clamp-1 text-sm text-zinc-500">{site.h1}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-white/10 p-4">
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              onClick={logout}
              loading={loggingOut}
            >
              Odhlásiť sa
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-white/10 bg-[#0a0a0b]/95 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <Link href="/" className="flex cursor-pointer items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffd700] text-lg font-bold text-black">
                  B
                </div>
                <span className="text-sm font-bold">Billik Admin</span>
              </Link>
              <Button variant="secondary" size="sm" onClick={logout} loading={loggingOut}>
                Odhlásiť
              </Button>
            </div>
          </header>

          <main className="flex-1 px-5 py-8 lg:px-10">
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
      </div>
    </div>
  );
}