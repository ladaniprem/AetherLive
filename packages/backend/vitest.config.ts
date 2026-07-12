import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    passWithNoTests: true,
    include: ["convex/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["convex/**/*.ts"],
      exclude: [
        "convex/_generated/**",
        "convex/**/*.{test,spec}.{ts,tsx}",
      ],
    },
  },
});
