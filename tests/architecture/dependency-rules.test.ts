import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { findViolations, importSpecifiers, type Layer } from "./rules";

const modulesDir = fileURLToPath(new URL("../../src/modules", import.meta.url));
const SOURCE_FILE = /\.(ts|tsx)$/;

function listFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const fullPath = path.join(directory, name);
    return statSync(fullPath).isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

describe("the rule checker itself", () => {
  it("finds named, default and side-effect imports", () => {
    const source = [
      'import { a } from "alpha";',
      'import b from "beta";',
      'import "gamma";',
      'export * from "delta";',
    ].join("\n");
    expect(importSpecifiers(source).sort()).toEqual(["alpha", "beta", "delta", "gamma"]);
  });

  it("flags frameworks and SDKs in the domain", () => {
    expect(findViolations("domain", 'import { x } from "drizzle-orm/pg-core";')).toHaveLength(1);
    expect(findViolations("domain", 'import { NextResponse } from "next/server";')).toHaveLength(1);
    expect(findViolations("domain", 'import Stripe from "stripe";')).toHaveLength(1);
  });

  it("flags imports of outer layers", () => {
    expect(
      findViolations("application", 'import { r } from "@/modules/documents/infrastructure/repo";'),
    ).toHaveLength(1);
    expect(findViolations("domain", 'import { c } from "../ui/card";')).toHaveLength(1);
    expect(
      findViolations("application", 'import { c } from "@/composition-root/container";'),
    ).toHaveLength(1);
  });

  it("lets the application layer use the domain, but not the other way round", () => {
    const toDomain = 'import { Document } from "../domain/document";';
    const toApplication = 'import { PublishDocument } from "../application/publish-document";';
    expect(findViolations("application", toDomain)).toEqual([]);
    expect(findViolations("domain", toApplication)).toHaveLength(1);
  });

  it("allows the shared kernel and plain relative imports", () => {
    const source = 'import { ok } from "@/shared/kernel";\nimport { x } from "./document";';
    expect(findViolations("domain", source)).toEqual([]);
    expect(findViolations("application", source)).toEqual([]);
  });

  it("does not confuse similarly named packages with frameworks", () => {
    expect(findViolations("domain", 'import { y } from "nextgen-lib";')).toEqual([]);
    expect(findViolations("domain", 'import { y } from "react-like";')).toEqual([]);
  });
});

describe("module dependency rules", () => {
  const layers: Layer[] = ["domain", "application"];

  for (const layer of layers) {
    it(`${layer} code imports no frameworks and no outer layers`, () => {
      const offenders: string[] = [];

      for (const moduleName of readdirSync(modulesDir)) {
        const layerDir = path.join(modulesDir, moduleName, layer);
        let files: string[];
        try {
          files = listFiles(layerDir).filter((file) => SOURCE_FILE.test(file));
        } catch {
          continue; // a module may not have this layer yet
        }
        for (const file of files) {
          for (const violation of findViolations(layer, readFileSync(file, "utf8"))) {
            offenders.push(`${path.relative(modulesDir, file)}: ${violation}`);
          }
        }
      }

      expect(offenders).toEqual([]);
    });
  }
});
