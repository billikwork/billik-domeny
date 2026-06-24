"use client";

import { useId, useState } from "react";

export function Disclosure({
  title,
  description,
  icon,
  defaultOpen = false,
  badge,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ffd700]/40"
      >
        {icon ? (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ffd700]/15 text-[#ffd700]">
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold text-white">{title}</span>
            {badge ? (
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                {badge}
              </span>
            ) : null}
          </span>
          {description ? <span className="mt-1 block text-sm text-zinc-400">{description}</span> : null}
        </span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180 bg-white/5" : ""}`}
          aria-hidden="true"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/8 px-5 py-5">{children}</div>
        </div>
      </div>
    </section>
  );
}