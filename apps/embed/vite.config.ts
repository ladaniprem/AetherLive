import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "embed.ts"),
      name: "AetherLiveEmbed",
      fileName: () => "widget.js",
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        extend: true,
      }
    },
    // Ship the loader as a static asset of the widget app so it is served at
    // <widget-origin>/embed/widget.js (prod: https://widget.aetherlive.live/embed/widget.js)
    outDir: resolve(__dirname, "../widget/public/embed"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 3004,
    open: "/demo.html"
  },
});
