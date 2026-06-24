import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] px-5">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#ffd700] text-2xl font-bold text-black">
            B
          </div>
          <h1
            className="text-3xl tracking-wide text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Billik Admin
          </h1>
          <p className="mt-2 text-sm text-zinc-400">Správa obsahu pre všetky domény</p>
        </div>
        <Suspense fallback={<p className="text-sm text-zinc-500">Načítavam…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}