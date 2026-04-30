import type { CSSProperties } from "react";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { AppBackground } from "@/components/layout/AppBackground";
import { router } from "./routes";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      richColors
      position="top-center"
      closeButton
      expand
      className="font-sans transition-colors duration-300"
      theme={resolvedTheme}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as CSSProperties
      }
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppBackground>
        <RouterProvider router={router} />
        <ThemedToaster />
      </AppBackground>
    </ThemeProvider>
  );
}
