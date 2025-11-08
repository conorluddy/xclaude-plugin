import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["__tests__/**/*.test.ts", "__tests__/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      exclude: ["node_modules/", "dist/", "**/*.test.ts", "**/*.spec.ts"],
    },
  },
});
