import {
  type ReceivableListPage,
  flattenReceivablePages,
  nextReceivableCursor,
} from "@/receivables/receivableListLogic";
import {
  type ClaimDraft,
  type RemittanceDraft,
  validateClaimDraft,
  validateRemittanceDraft,
} from "@/receivables/receivableForms";
import { describe, expect, test } from "vitest";

/**
 * 018 receivables/claims pure logic — no client, no generated types. Mirrors the
 * 017 payer pure-logic shape: keyset pagination + form validation as pure
 * functions, tested against synthetic data.
 */
function page(items: string[], nextCursor: string | null): ReceivableListPage {
  return { items: items.map((receivableRef) => ({ receivableRef })), nextCursor };
}

describe("nextReceivableCursor", () => {
  test("present cursor -> that cursor", () => {
    expect(nextReceivableCursor(page(["a"], "CUR1"))).toBe("CUR1");
  });
  test("null cursor -> undefined (last page)", () => {
    expect(nextReceivableCursor(page(["a"], null))).toBeUndefined();
  });
});

describe("flattenReceivablePages", () => {
  test("flattens pages in order", () => {
    expect(
      flattenReceivablePages([page(["a", "b"], "C"), page(["c"], null)]).map((r) => r.receivableRef),
    ).toEqual(["a", "b", "c"]);
  });
  test("empty -> []", () => {
    expect(flattenReceivablePages([page([], null)])).toEqual([]);
  });
});

function claim(over: Partial<ClaimDraft> = {}): ClaimDraft {
  return { payerRef: "11111111-1111-1111-1111-111111111111", receivableRefs: ["r1"], ...over };
}

describe("validateClaimDraft", () => {
  test("valid minimal claim -> no errors", () => {
    expect(validateClaimDraft(claim())).toEqual({});
  });
  test("missing payerRef -> error", () => {
    expect(validateClaimDraft(claim({ payerRef: "" })).payerRef).toBeDefined();
  });
  test("zero receivables -> error (contract minItems 1)", () => {
    expect(validateClaimDraft(claim({ receivableRefs: [] })).receivableRefs).toBeDefined();
  });
  test("over 500 receivables -> error (contract maxItems 500)", () => {
    const refs = Array.from({ length: 501 }, (_, i) => `r${i}`);
    expect(validateClaimDraft(claim({ receivableRefs: refs })).receivableRefs).toBeDefined();
  });
  test("exactly 500 -> ok", () => {
    const refs = Array.from({ length: 500 }, (_, i) => `r${i}`);
    expect(validateClaimDraft(claim({ receivableRefs: refs })).receivableRefs).toBeUndefined();
  });
});

function remit(over: Partial<RemittanceDraft> = {}): RemittanceDraft {
  return { remittedAmount: "100.00", ...over };
}

describe("validateRemittanceDraft", () => {
  test("valid amount -> no errors", () => {
    expect(validateRemittanceDraft(remit())).toEqual({});
  });
  test("zero remittance -> OK (a full-rejection remittance is valid, remittedAmount>=0)", () => {
    expect(validateRemittanceDraft(remit({ remittedAmount: "0" })).remittedAmount).toBeUndefined();
  });
  test("non-numeric amount -> error", () => {
    expect(validateRemittanceDraft(remit({ remittedAmount: "abc" })).remittedAmount).toBeDefined();
  });
  test("negative amount -> error (Money is non-negative exact-decimal)", () => {
    expect(validateRemittanceDraft(remit({ remittedAmount: "-5.00" })).remittedAmount).toBeDefined();
  });
  test("too many fractional digits -> error (scale 4)", () => {
    expect(validateRemittanceDraft(remit({ remittedAmount: "1.23456" })).remittedAmount).toBeDefined();
  });
});
