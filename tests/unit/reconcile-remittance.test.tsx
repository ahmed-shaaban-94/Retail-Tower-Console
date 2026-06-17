import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, test, vi } from "vitest";

const consoleReconcileRemittance = vi.fn();
vi.mock("@/lib/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/client")>();
  return { ...actual, consoleReconcileRemittance: (...a: unknown[]) => consoleReconcileRemittance(...a) };
});

import { createQueryClient } from "@/lib/query";
import { ReconcileRemittance } from "@/receivables/ReconcileRemittance";

function renderReconcile(onReconciled = vi.fn()): { onReconciled: typeof onReconciled } {
  const qc = createQueryClient();
  function Tree({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={qc}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }
  render(
    <Tree>
      <ReconcileRemittance claimRef="c1" onClose={vi.fn()} onReconciled={onReconciled} />
    </Tree>,
  );
  return { onReconciled };
}

function result(status: number, body?: Record<string, unknown>, code?: string) {
  return {
    status,
    data: status === 200 ? body : undefined,
    error: code ? { error: { code, request_id: "req-x" } } : undefined,
    headers: new Headers(),
  };
}

function fillAndReconcile(amount = "100.00"): void {
  fireEvent.change(screen.getByLabelText(/remitted amount/i), { target: { value: amount } });
  fireEvent.click(screen.getByRole("button", { name: /reconcile/i }));
}

/**
 * 018 ReconcileRemittance drawer (VG-1). Validates remittedAmount (Money ≥0,
 * scale ≤4 — 0 is valid = full rejection) → consoleReconcileRemittance with a
 * per-submit Idempotency-Key → on 200 renders the ReconciliationResult
 * (variance + outcome settled|partial|flagged); 400→inline, 403/409→banner.
 * Mirrors 017's PayerCreate / 018's SubmitClaim.
 */
describe("ReconcileRemittance", () => {
  beforeEach(() => consoleReconcileRemittance.mockReset());

  test("non-numeric amount -> client validation, wrapper NOT called", async () => {
    renderReconcile();
    fillAndReconcile("abc");
    expect(await screen.findByText(/valid amount/i)).toBeDefined();
    expect(consoleReconcileRemittance).not.toHaveBeenCalled();
  });

  test("zero remittance is valid (full rejection) -> wrapper called", async () => {
    consoleReconcileRemittance.mockResolvedValue(
      result(200, { claimRef: "c1", claimedAmount: "100.00", remittedAmount: "0.00", variance: "100.00", outcome: "flagged" }),
    );
    renderReconcile();
    fillAndReconcile("0");
    await waitFor(() => expect(consoleReconcileRemittance).toHaveBeenCalled());
  });

  test("200 -> renders variance + outcome; onReconciled called; sends Idempotency-Key", async () => {
    consoleReconcileRemittance.mockResolvedValue(
      result(200, { claimRef: "c1", claimedAmount: "100.00", remittedAmount: "80.00", variance: "20.00", outcome: "partial" }),
    );
    const { onReconciled } = renderReconcile();
    fillAndReconcile("80.00");
    expect(await screen.findByText(/partial/i)).toBeDefined();
    expect(screen.getByText(/20\.00/)).toBeDefined();
    await waitFor(() => expect(onReconciled).toHaveBeenCalled());
    const [claimRef, , key] = consoleReconcileRemittance.mock.calls[0];
    expect(claimRef).toBe("c1");
    expect(String(key)).toMatch(/^[\x21-\x7E]{16,128}$/);
  });

  test("403 -> permission banner", async () => {
    consoleReconcileRemittance.mockResolvedValue(result(403));
    renderReconcile();
    fillAndReconcile();
    await waitFor(() => expect(screen.getByText(/permission/i)).toBeDefined());
  });

  test("409 -> non-disclosing conflict banner", async () => {
    consoleReconcileRemittance.mockResolvedValue(result(409));
    renderReconcile();
    fillAndReconcile();
    await waitFor(() => expect(screen.getByRole("alert")).toBeDefined());
  });
});
