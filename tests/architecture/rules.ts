/**
 * The dependency rules from CLAUDE.md, as code. ESLint enforces the same rules while you type;
 * this is a second safety net that also runs in CI, independent of any editor or lint config.
 */
export type Layer = "domain" | "application";

const FRAMEWORK_PACKAGES = [
  "next",
  "react",
  "react-dom",
  "drizzle-orm",
  "postgres",
  "stripe",
  "resend",
  "@aws-sdk",
];

/** Every `from "x"` and `import "x"` specifier in a source file. */
export function importSpecifiers(source: string): string[] {
  const specifiers: string[] = [];
  const patterns = [/\bfrom\s+["']([^"']+)["']/g, /^\s*import\s+["']([^"']+)["']/gm];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      specifiers.push(match[1] ?? "");
    }
  }
  return specifiers;
}

function isFrameworkPackage(specifier: string): boolean {
  return FRAMEWORK_PACKAGES.some((name) => specifier === name || specifier.startsWith(`${name}/`));
}

const OUTER_LAYER = /(^|\/)(infrastructure|ui)(\/|$)/;
const APPLICATION_LAYER = /(^|\/)application(\/|$)/;

/** Returns a human-readable message for every import that breaks the rules of `layer`. */
export function findViolations(layer: Layer, source: string): string[] {
  const violations: string[] = [];

  for (const specifier of importSpecifiers(source)) {
    if (isFrameworkPackage(specifier)) {
      violations.push(`${layer} must not import framework/SDK "${specifier}"`);
    } else if (OUTER_LAYER.test(specifier)) {
      violations.push(`${layer} must not import outer layer "${specifier}"`);
    } else if (specifier.includes("composition-root") || specifier.startsWith("@/app")) {
      violations.push(`${layer} must not import "${specifier}"`);
    } else if (layer === "domain" && APPLICATION_LAYER.test(specifier)) {
      violations.push(`domain must not import the application layer "${specifier}"`);
    }
  }

  return violations;
}
