import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "copy-portfolio-script",
      closeBundle() {
        const source = resolve(__dirname, "script.js");
        const target = resolve(__dirname, "dist", "script.js");
        if (existsSync(source)) {
          copyFileSync(source, target);
        }
      }
    }
  ],
  base: "./",
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        realityEngine: resolve(__dirname, "reality-engine.html")
      }
    }
  }
});
