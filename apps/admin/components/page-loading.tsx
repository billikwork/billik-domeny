import { Spinner } from "@/components/ui/spinner";

export function PageLoading({ label = "Načítavam…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <Spinner className="h-10 w-10 text-[#ffd700]" />
      <p className="text-base text-zinc-400">{label}</p>
    </div>
  );
}

export function TableLoadingSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-white/5 py-4">
          <div className="h-5 w-48 rounded bg-white/10" />
          <div className="hidden h-5 flex-1 rounded bg-white/5 md:block" />
          <div className="h-5 w-32 rounded bg-white/5" />
          <div className="h-5 w-16 rounded bg-white/5" />
        </div>
      ))}
    </div>
  );
}

export function EditorLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex gap-3">
        <div className="h-10 w-36 rounded-xl bg-white/10" />
        <div className="h-10 w-36 rounded-xl bg-white/5" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-4 h-6 w-48 rounded bg-white/10" />
          <div className="space-y-3">
            <div className="h-12 rounded-xl bg-white/5" />
            <div className="h-12 rounded-xl bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}