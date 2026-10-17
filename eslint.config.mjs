import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Packages that the inner layers (domain, application) must never import.
// Business rules stay independent of frameworks and SDKs. See CLAUDE.md.
const frameworkPackages = [
  "next",
  "next/*",
  "react",
  "react-dom",
  "react/*",
  "drizzle-orm",
  "drizzle-orm/*",
  "postgres",
  "stripe",
  "resend",
  "@aws-sdk/*",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    // Domain: may import only the shared kernel and other domain files.
    files: ["src/modules/*/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                ...frameworkPackages,
                "@/modules/*/application/*",
                "@/modules/*/infrastructure/*",
                "@/modules/*/ui/*",
                "@/composition-root/*",
                "@/app/*",
              ],
              message:
                "Domain code must not import frameworks, SDKs or outer layers (see CLAUDE.md).",
            },
          ],
        },
      ],
    },
  },
  {
    // Application: may import domain + shared kernel only.
    files: ["src/modules/*/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                ...frameworkPackages,
                "@/modules/*/infrastructure/*",
                "@/modules/*/ui/*",
                "@/composition-root/*",
                "@/app/*",
              ],
              message:
                "Use cases must not import frameworks, SDKs or outer layers (see CLAUDE.md).",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
