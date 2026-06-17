import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import * as client from "@/lib/client";

/**
 * 017 payer boundary (CON-G1 / SC-001, VG-1..VG-4). The payer wrappers must
 * consume EXACTLY the two settlement payer ops via the generated client, send
 * the create idempotency header, and reach NO other settlement op (no
 * receivable/claim/reconcile/apply-payment/POS-intent). Mirrors rf2-boundary's
 * static-source-scan approach for the surface guard.
 */
function stripComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

const clientSrc = stripComments(
  readFileSync(join(process.cwd(), "src/lib/client.ts"), "utf8"),
);

describe("payer wrappers — surface", () => {
  test("VG-1: both payer wrappers are exported", () => {
    expect(typeof client.consoleCreatePayerAccount).toBe("function");
    expect(typeof client.consoleListPayerAccounts).toBe("function");
  });

  test("VG-1: wrappers call the generated payer-accounts path (no hand-rolled fetch)", () => {
    expect(clientSrc).toContain('"/api/v1/settlement/payer-accounts"');
    expect(clientSrc).not.toMatch(/\bfetch\s*\(/);
  });

  test("create sends the Idempotency-Key header (FR-005)", () => {
    expect(clientSrc).toMatch(/"Idempotency-Key"\s*:/);
  });

  test("VG-2: 017 reaches NO other settlement op (only the two payer ops)", () => {
    for (const forbidden of [
      "consoleGetReceivable",
      "consoleListReceivables",
      "consoleSubmitClaim",
      "consoleReconcileRemittance",
      "consoleApplyPayment",
      "posRecordSettlementIntent",
    ]) {
      expect(clientSrc).not.toContain(forbidden);
    }
  });

  test("VG-3: no Authorization/Bearer header (cookie transport only)", () => {
    expect(clientSrc).not.toMatch(/[Aa]uthorization\s*:/);
    expect(clientSrc).not.toMatch(/[Bb]earer\s+/);
  });
});
