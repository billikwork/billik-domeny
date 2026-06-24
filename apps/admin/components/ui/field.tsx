export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-base font-medium text-zinc-200">{label}</span>
      {hint ? <span className="mb-2 block text-sm text-zinc-500">{hint}</span> : null}
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-base text-white outline-none transition placeholder:text-zinc-500 focus:border-[#ffd700]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#ffd700]/20";