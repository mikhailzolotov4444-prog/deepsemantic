import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // e2e files are named *.spec.ts and run by Playwright, not Vitest.
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // The plan requires 90% coverage on the inner layers (domain + application) and the kernel.
      include: [
        "src/modules/*/domain/**/*.ts",
        "src/modules/*/application/**/*.ts",
        "src/shared/kernel/**/*.ts",
      ],
      exclude: ["**/*.test.ts", "**/index.ts"],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 },
    },
  },
});
