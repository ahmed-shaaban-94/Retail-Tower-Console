import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * RF-2 validation gates VG-3 / VG-4 / VG-5 (Polish phase, T031/T032/T033).
 * Mirrors tests/unit/boundary.test.ts: scoped to hand-written src/ (excludes
 * src/generated/**, the only legit DP2 call surface) with comments stripped so
 * doc references don't false-positive.
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

describe("RF-2 boundary gates", () => {
  test("VG-3: no hand-written fetch/XHR/axios to a DP2 path (generated client only)", () => {
    expect(code).not.toMatch(/\bfetch\s*\(/);
    expect(code).not.toMatch(/XMLHttpRequest/);
    expect(code).not.toMatch(/\baxios\b/);
  });

  test("VG-3: no Authorization/Bearer header set by the console (cookie transport)", () => {
    expect(code).not.toMatch(/[Aa]uthorization\s*:/);
    expect(code).not.toMatch(/[Bb]earer\s+/);
  });

  test("VG-4: RF-2 calls no membership operation (those are RF-5)", () => {
    for (const op of [
      "listMembers",
      "createInvitation",
      "updateMembership",
      "revokeMembership",
      "acceptInvitation",
    ]) {
      expect(code).not.toContain(op);
    }
  });

  test("VG-4: RF-2 calls no context operation (it reads scope via RF-1's provider, OQ-5)", () => {
    // The store/tenant data layer must not invoke a context mutator/getter.
    // RF-1 owns those; RF-2 reads the resolved result through ActiveContextProvider.
    const rf2Files = files.filter(
      (f) => /[\\/](tenants|stores)[\\/]/.test(f) || f.endsWith("rf2-queries.ts"),
    );
    const rf2Code = rf2Files.map((f) => stripComments(readFileSync(f, "utf8"))).join("\n");
    for (const op of [
      "getActiveContext",
      "switchActiveTenant",
      "switchActiveStore",
      "clearActiveStore",
    ]) {
      expect(rf2Code).not.toContain(op);
    }
  });

  test("VG-5: no frontend authorization — no role/is_platform_admin-conditioned hiding of RF-2 actions", () => {
    // RF-2 surfaces must not branch a list/action/route on a role or the
    // platform-admin flag (Principle 7, FR-004-004). Roles are display-only.
    const rf2Files = files.filter((f) => /[\\/](tenants|stores)[\\/]/.test(f));
    const rf2Code = rf2Files.map((f) => stripComments(readFileSync(f, "utf8"))).join("\n");
    expect(rf2Code).not.toMatch(/is_platform_admin/);
    expect(rf2Code).not.toMatch(/role_code\s*===/);
    expect(rf2Code).not.toMatch(/active_role_code/);
  });
});
