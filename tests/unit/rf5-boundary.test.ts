import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * RF-5 validation gates VG-3 / VG-4 (Polish, T029/T030). Mirrors the other
 * boundary tests: hand-written src/ (excludes src/generated/**) with comments
 * stripped. The POS / listStores exclusions are scoped to RF-5 files — RF-2's
 * src/stores/ legitimately contains `listStores`, so a whole-src grep for it
 * would false-fail now that slice 004 is merged.
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
const allCode = files.map((f) => stripComments(readFileSync(f, "utf8"))).join("\n");

// RF-5 files: src/operators/, the RF-5 wrappers/auth that touch the membership graph.
const rf5Files = files.filter(
  (f) =>
    /[\\/]operators[\\/]/.test(f) ||
    f.endsWith("AcceptInvitation.tsx") ||
    f.endsWith("rf5Routes.tsx"),
);
const rf5Code = rf5Files.map((f) => stripComments(readFileSync(f, "utf8"))).join("\n");

describe("RF-5 boundary gates", () => {
  test("VG-3: no hand-written fetch/XHR/axios to a DP2 path (generated client only)", () => {
    expect(allCode).not.toMatch(/\bfetch\s*\(/);
    expect(allCode).not.toMatch(/XMLHttpRequest/);
    expect(allCode).not.toMatch(/\baxios\b/);
  });

  test("VG-3: no Authorization/Bearer header set by the console (Idempotency-Key is not a credential)", () => {
    expect(allCode).not.toMatch(/[Aa]uthorization\s*:/);
    expect(allCode).not.toMatch(/[Bb]earer\s+/);
  });

  test("VG-4: no POS-Pulse boundary crossing anywhere (no /api/pos/, no pos-operators op)", () => {
    expect(allCode).not.toContain("/api/pos/");
    for (const op of [
      "posOperatorSignIn",
      "posOperatorSignOut",
      "posOperatorRoster",
      "posOperatorTakeoverConfirm",
      "posOperatorActiveSession",
    ]) {
      expect(allCode).not.toContain(op);
    }
  });

  test("VG-4: RF-5 files do not consume RF-2's listStores (scoped — RF-2 owns it)", () => {
    expect(rf5Code).not.toContain("listStores");
  });

  test("VG-4: RF-5 calls no context operation directly (reads scope via RF-1's provider)", () => {
    for (const op of [
      "getActiveContext",
      "switchActiveTenant",
      "switchActiveStore",
      "clearActiveStore",
    ]) {
      expect(rf5Code).not.toContain(op);
    }
  });
});
