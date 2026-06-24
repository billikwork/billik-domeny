"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type NavigationContextValue = {
  pendingHref: string | null;
  startNavigation: (href: string) => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const startNavigation = useCallback((href: string) => {
    setPendingHref(href);
  }, []);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const isNavigating = pendingHref !== null;

  return (
    <NavigationContext.Provider value={{ pendingHref, startNavigation }}>
      {isNavigating ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-white/5">
          <div className="nav-progress-bar h-full w-1/3 bg-[#ffd700] shadow-[0_0_12px_rgba(255,215,0,0.6)]" />
        </div>
      ) : null}
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}