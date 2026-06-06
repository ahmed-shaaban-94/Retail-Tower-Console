import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * VG-3 boundary + VG-4 no-scope-creep gates (Polish, FR-003-001/002/003).
 * Scoped to hand-written src/ (excludes src/generated/**, the only legit DP2
 * call surface) and strips comments so doc references don't false-positive.
 */
function handWrittenSources(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (full.includes("generated")) continue;
    if (statSync(full).isDirectory()) {
      handWrittenSources(full, acc);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

function stripComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

const files = handWrittenSources(join(process.cwd(), "src"));
const code = files.map((f) => stripComments(readFileSync(f, "utf8"))).join("\n");

describe("RF-1 boundary gates", () => {
  test("VG-3: no hand-written fetch/XHR/axios to a DP2 path (generated client only)", () => {
    expect(code).not.toMatch(/\bfetch\s*\(/);
    expect(code).not.toMatch(/XMLHttpRequest/);
    expect(code).not.toMatch(/\baxios\b/);
  });

  test("VG-3: console never sets an Authorization/Bearer header", () => {
    expect(code).not.toMatch(/[Aa]uthorization\s*:/);
    expect(code).not.toMatch(/[Bb]earer\s+/);
  });

  test("VG-4: none of the four out-of-scope auth operations is called", () => {
    for (const op of [
      "requestPasswordReset",
      "confirmPasswordReset",
      "requestEmailVerification",
      "confirmEmailVerification",
    ]) {
      expect(code).not.toContain(op);
    }
  });
});
