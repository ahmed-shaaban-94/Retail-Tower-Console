import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import * as client from "@/lib/client";
import { describe, expect, test } from "vitest";

/**
 * 018 receivable/claim boundary (VG-1..VG-4). The four consume-only wrappers
 * exist; and 018's OWN feature code (src/receivables/**) reaches EXACTLY the four
 * 018 ops — crucially NOT consoleApplyPayment (019 owns cash application), nor the
 * payer-CRUD / POS-intent ops. Mirrors rf2-boundary: scope the forbidden-op scan
 * to the slice's own files (client.ts holds every slice's wrappers, so it cannot
 * be the scope). Static source scan, comments stripped.
 */
function stripComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}
function filesUnder(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) filesUnder(full, acc);
    else if (/\.(ts|tsx)$/.test(entry)) acc.push(full);
  }
  return acc;
}

const clientSrc = stripComments(readFileSync(join(process.cwd(), "src/lib/client.ts"), "utf8"));
const receivableFiles = filesUnder(join(process.cwd(), "src/receivables"));
const receivableSrc = receivableFiles.map((f) => stripComments(readFileSync(f, "utf8"))).join("\n");

describe("receivable/claim wrappers — surface", () => {
  test("VG-1: the four 018 wrappers are exported", () => {
    expect(typeof client.consoleGetReceivable).toBe("function");
    expect(typeof client.consoleListReceivables).toBe("function");
    expect(typeof client.consoleSubmitClaim).toBe("function");
    expect(typeof client.consoleReconcileRemittance).toBe("function");
  });

  test("VG-1: the 018 wrappers call the generated receivable/claim paths (no hand-rolled fetch)", () => {
    expect(clientSrc).toContain('"/api/v1/settlement/receivables"');
    expect(clientSrc).toContain('"/api/v1/settlement/claims"');
    expect(receivableSrc).not.toMatch(/\bfetch\s*\(/);
  });

  test("VG-2: 018's own code consumes NONE of consoleApplyPayment / payer-CRUD / POS-intent", () => {
    for (const forbidden of [
      "consoleApplyPayment",
      "consoleCreatePayerAccount",
      "consoleListPayerAccounts",
      "posRecordSettlementIntent",
    ]) {
      expect(receivableSrc).not.toContain(forbidden);
    }
  });

  test("VG-3: 018's own code sets no Authorization/Bearer header (cookie transport)", () => {
    expect(receivableSrc).not.toMatch(/[Aa]uthorization\s*:/);
    expect(receivableSrc).not.toMatch(/[Bb]earer\s+/);
  });
});
