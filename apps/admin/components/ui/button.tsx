import { Spinner } from "./spinner";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-[#ffd700] text-black hover:bg-[#ffe44d] active:bg-[#e6c200] shadow-[0_2px_12px_rgba(255,215,0,0.25)]",
  secondary:
    "border border-white/20 bg-white/5 text-zinc-100 hover:border-white/35 hover:bg-white/10 active:bg-white/15",
  ghost: "text-zinc-300 hover:bg-white/8 hover:text-white active:bg-white/12",
  danger:
    "border border-red-500/30 bg-red-500/10 text-red-200 hover:border-red-500/50 hover:bg-red-500/20 active:bg-red-500/25",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm gap-2",
  md: "px-5 py-3 text-base gap-2.5",
  lg: "px-6 py-4 text-lg gap-3",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={[
        "inline-flex cursor-pointer items-center justify-center rounded-xl font-semibold transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd700]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0b]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClass[variant],
        sizeClass[size],
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? <Spinner className="h-5 w-5 shrink-0" /> : null}
      {children}
    </button>
  );
}