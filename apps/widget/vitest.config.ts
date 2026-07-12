import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["**/*.{test,spec}.{ts,tsx}"],
    setupFiles: [],
    css: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@workspace/backend": path.resolve(
        __dirname,
        "../../packages/backend/src",
      ),
    },
  },
});
