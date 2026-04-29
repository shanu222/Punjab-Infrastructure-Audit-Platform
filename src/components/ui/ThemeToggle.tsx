"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { useTheme } from "@/context/ThemeContext";

type Mode = "toggle" | "menu";

export function ThemeToggle({ mode = "menu" }: { mode?: Mode }) {
  const { preference, resolvedTheme, setPreference, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-xl transition-colors duration-300" aria-label="Theme">
        <Sun className="size-5 opacity-40" />
      </Button>
    );
  }

  if (mode === "toggle") {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rounded-xl border-border bg-card/80 shadow-sm transition-colors duration-300"
        aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        onClick={() => toggleTheme()}
      >
        {resolvedTheme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-xl transition-colors duration-300"
          aria-label="Color theme"
        >
          {resolvedTheme === "dark" ? <Moon className="size-5" /> : <Sun className="size-5" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuItem onClick={() => setPreference("light")} className="gap-2">
          <Sun className="size-4" /> Light
          {preference === "light" ? <span className="ml-auto text-xs text-muted-foreground">✓</span> : null}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPreference("dark")} className="gap-2">
          <Moon className="size-4" /> Dark
          {preference === "dark" ? <span className="ml-auto text-xs text-muted-foreground">✓</span> : null}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPreference("system")} className="gap-2">
          <Monitor className="size-4" /> System
          {preference === "system" ? <span className="ml-auto text-xs text-muted-foreground">✓</span> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
