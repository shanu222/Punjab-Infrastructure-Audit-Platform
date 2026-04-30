import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

function figmaAssetResolver() {
  return {
    name: "figma-asset-resolver",
    resolveId(id: string) {
      if (id.startsWith("figma:asset/")) {
        const filename = id.replace("figma:asset/", "");
        return path.resolve(__dirname, "src/assets", filename);
      }
      return undefined;
    },
  };
}

/** Baked into the client bundle at build time (Vercel `process.env` during `vite build`). */
function resolveApiBaseForDefine(): string {
  const raw =
    process.env.VITE_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";
  return String(raw).trim().replace(/\/$/, "");
}

export default defineConfig(() => {
  const apiBase = resolveApiBaseForDefine();
  if (process.env.VERCEL || process.env.CI) {
    console.info(
      "[PIAP build] API base URL in client bundle:",
      apiBase ? `yes (${apiBase.length} chars)` : "NO — set VITE_API_BASE_URL or NEXT_PUBLIC_API_URL in Vercel (not Sensitive), then redeploy",
    );
  }

  return {
    envPrefix: ["VITE_", "NEXT_PUBLIC_"],
    define: {
      __PIAP_API_BASE__: JSON.stringify(apiBase),
    },
    plugins: [figmaAssetResolver(), react(), tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    assetsInclude: ["**/*.svg", "**/*.csv"],
  };
});
