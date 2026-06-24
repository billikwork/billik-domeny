import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] px-5">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ffd700] text-3xl font-bold text-black shadow-[0_8px_32px_rgba(255,215,0,0.3)]">
            B
          </div>
          <h1
            className="text-4xl tracking-wide text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Billik Admin
          </h1>
          <p className="mt-3 text-base text-zinc-400">
            Prihláste sa pre správu obsahu vašich stránok
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
          <Suspense
            fallback={
              <div className="flex items-center justify-center gap-3 py-8 text-zinc-400">
                <Spinner />
                <span className="text-base">Načítavam…</span>
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-600">
          Problémy s prihlásením? Kontaktujte správcu systému.
        </p>
      </div>
    </div>
  );
}