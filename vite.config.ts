import { URL, fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// D-1: React 19 + Vite 6, SPA mode (no SSR adapter).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    // Plain SPA build; target evergreen browsers (C-1).
    target: "es2022",
    outDir: "dist",
  },
});
