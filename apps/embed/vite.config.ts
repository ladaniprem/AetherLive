import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "embed.ts"),
      name: "AetherLiveEmbed",
      fileName: "widget",
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        extend: true,
      }
    }
  },
  server: {
    port: 3002,
    open: "/demo.html"
  },
});
