"use client";

import type { ReactNode } from "react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/app/components/ui/utils";

const BG_URL = "/images/bg-audit.png";

type Props = {
  children: ReactNode;
};

/**
 * Global responsive background (cover + theme overlay).
 * Desktop lg+: fixed attachment for immersion; tablet/mobile: scroll for performance.
 */
export function AppBackground({ children }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div
          className={cn(
            "absolute inset-0 bg-cover bg-center bg-no-repeat bg-scroll lg:bg-fixed motion-reduce:bg-scroll",
            "transition-[filter] duration-500",
          )}
          style={{ backgroundImage: `url(${BG_URL})` }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-secondary/[0.06] dark:from-primary/10 dark:to-secondary/10"
          aria-hidden
        />
        <div
          className={cn(
            "absolute inset-0 transition-colors duration-300",
            isDark
              ? "bg-black/[0.58] max-md:bg-black/50 motion-reduce:bg-black/55"
              : "bg-white/[0.72] max-md:bg-white/64 motion-reduce:bg-white/75",
          )}
          aria-hidden
        />
      </div>
      <div className="relative z-10 flex min-h-dvh min-h-screen flex-col">{children}</div>
    </>
  );
}
