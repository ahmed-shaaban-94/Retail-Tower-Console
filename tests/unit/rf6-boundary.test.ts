import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * RF-6 validation gates VG-3 / VG-4 (Polish, T028/T029) + gold-scope-only (T032).
 * Scoped to RF-6 files where a whole-src grep would false-fail (sibling slices
 * legitimately use membership/store ops) — the cross-slice boundary lesson.
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

// RF-6 files: src/audit/ + the RF-6 route seam.
const rf6Files = files.filter((f) => /[\\/]audit[\\/]/.test(f) || f.endsWith("rf6Routes.tsx"));
const rf6Code = rf6Files.map((f) => stripComments(readFileSync(f, "utf8"))).join("\n");
// RF-6 styles for the gold-scope-only check.
const rf6Styles = handWrittenSourcesCss(join(process.cwd(), "src", "audit"));

function handWrittenSourcesCss(dir: string): string {
  let css = "";
  for (const entry of readdirSync(dir)) {
    if (entry.endsWith(".css")) css += readFileSync(join(dir, entry), "utf8");
  }
  return css;
}

describe("RF-6 boundary gates", () => {
  test("VG-3: no hand-written fetch/XHR/axios to a DP2 path (generated client only)", () => {
    expect(allCode).not.toMatch(/\bfetch\s*\(/);
    expect(allCode).not.toMatch(/XMLHttpRequest/);
    expect(allCode).not.toMatch(/\baxios\b/);
  });

  test("VG-3: no Authorization/Bearer/device-token set by the console", () => {
    expect(allCode).not.toMatch(/[Aa]uthorization\s*:/);
    expect(allCode).not.toMatch(/[Bb]earer\s+/);
    expect(allCode).not.toContain("device_token_attestation");
  });

  test("VG-4: never references posAuditEventsSync, no invented single-event read op", () => {
    expect(allCode).not.toContain("posAuditEventsSync");
    expect(rf6Code).not.toContain("getAuditEvent");
    expect(rf6Code).not.toContain("readAuditEvent");
  });

  test("VG-4: RF-6 consumes only listAuditEvents — no mutation/export affordance", () => {
    // RF-6 is read-only: its files reference only the one audit op, never a
    // create/update/delete/export identifier on audit.
    expect(rf6Code).toContain("listAuditEvents");
    for (const op of [
      "createAudit",
      "updateAudit",
      "deleteAudit",
      "exportAudit",
      "annotateAudit",
    ]) {
      expect(rf6Code).not.toContain(op);
    }
  });

  test("T032 gold-scope-only: RF-6 styles use no gold token (gold is scope/nav only)", () => {
    expect(rf6Styles).not.toMatch(/--color-gold/);
  });
});
