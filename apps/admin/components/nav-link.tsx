"use client";

import Link from "next/link";
import { useNavigation } from "@/components/navigation-provider";
import { Spinner } from "@/components/ui/spinner";

function hrefToString(href: React.ComponentProps<typeof Link>["href"]) {
  return typeof href === "string" ? href : (href.pathname ?? "/");
}

export function NavLink({
  href,
  children,
  className = "",
  showSpinner = false,
  ...props
}: React.ComponentProps<typeof Link> & { showSpinner?: boolean }) {
  const { pendingHref, startNavigation } = useNavigation();
  const hrefStr = hrefToString(href);
  const isPending = pendingHref === hrefStr;

  return (
    <Link
      href={href}
      onClick={() => startNavigation(hrefStr)}
      aria-busy={isPending}
      className={[
        className,
        isPending ? "pointer-events-none" : "",
      ].filter(Boolean).join(" ")}
      {...props}
    >
      {showSpinner && isPending ? (
        <span className="inline-flex items-center gap-2">
          <Spinner className="h-4 w-4 text-[#ffd700]" />
          {children}
        </span>
      ) : (
        children
      )}
    </Link>
  );
}

export function useIsNavigatingTo(href: string) {
  const { pendingHref } = useNavigation();
  return pendingHref === href;
}