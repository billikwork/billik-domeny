"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      showToast("error", "Zadajte heslo pre prihlásenie.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        showToast("error", data.error ?? "Nesprávne heslo. Skúste to znova.");
        return;
      }

      showToast("success", "Prihlásenie úspešné. Presmerovávam…");
      const next = searchParams.get("next") || "/";
      router.push(next);
      router.refresh();
    } catch {
      showToast("error", "Nepodarilo sa pripojiť. Skontrolujte internetové pripojenie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Field label="Heslo" hint="Zadajte administrátorské heslo">
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          autoComplete="current-password"
          autoFocus
          placeholder="••••••••"
        />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        {loading ? "Prihlasujem…" : "Prihlásiť sa"}
      </Button>
    </form>
  );
}