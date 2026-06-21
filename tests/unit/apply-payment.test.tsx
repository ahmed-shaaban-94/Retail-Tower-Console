import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, test, vi } from "vitest";

const consoleApplyPayment = vi.fn();
vi.mock("@/lib/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/client")>();
  return { ...actual, consoleApplyPayment: (...a: unknown[]) => consoleApplyPayment(...a) };
});

import { createQueryClient } from "@/lib/query";
import { ApplyPayment } from "@/settlement-reconciliation/ApplyPayment";

function renderApply(onApplied = vi.fn()): { onApplied: typeof onApplied } {
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
      <ApplyPayment
        receivable={{ receivableRef: "r1", outstandingBalance: "120.00", version: 0 }}
        onClose={vi.fn()}
        onApplied={onApplied}
      />
    </Tree>,
  );
  return { onApplied };
}

function result(status: number, body?: Record<string, unknown>, code?: string) {
  return {
    status,
    data: status === 200 ? body : undefined,
    error: code ? { error: { code, request_id: "req-x" } } : undefined,
    headers: new Headers(),
  };
}

function fillAndApply(amount = "50.00"): void {
  fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: amount } });
  fireEvent.click(screen.getByRole("button", { name: /apply payment/i }));
}

/**
 * 019 ApplyPayment drawer (VG-1). Validates amount (>0; wrapper NOT called on
 * invalid) → consoleApplyPayment(receivableRef, {amount,version}, key) → on 200
 * renders the updated receivable (new outstandingBalance + state); 400→inline,
 * 403/409→banner (409 = stale version / non-disclosing). Mirrors the reconcile
 * drawer; sends version for optimistic concurrency.
 */
describe("ApplyPayment", () => {
  beforeEach(() => consoleApplyPayment.mockReset());

  test("zero amount -> client validation, wrapper NOT called (apply requires >0)", async () => {
    renderApply();
    fillAndApply("0");
    expect(await screen.findByText(/greater than zero/i)).toBeDefined();
    expect(consoleApplyPayment).not.toHaveBeenCalled();
  });

  test("200 -> renders updated balance + state; onApplied; sends version + Idempotency-Key", async () => {
    consoleApplyPayment.mockResolvedValue(
      result(200, {
        receivableRef: "r1",
        outstandingBalance: "70.00",
        state: "partially_applied",
        version: 1,
      }),
    );
    const { onApplied } = renderApply();
    fillAndApply("50.00");
    expect(await screen.findByText(/70\.00/)).toBeDefined();
    expect(screen.getByText(/partially_applied/i)).toBeDefined();
    await waitFor(() => expect(onApplied).toHaveBeenCalled());
    const [receivableRef, body, key] = consoleApplyPayment.mock.calls[0];
    expect(receivableRef).toBe("r1");
    expect((body as { version: number }).version).toBe(0);
    expect(String(key)).toMatch(/^[\x21-\x7E]{16,128}$/);
  });

  test("409 (stale version) -> non-disclosing conflict banner", async () => {
    consoleApplyPayment.mockResolvedValue(result(409));
    renderApply();
    fillAndApply();
    await waitFor(() => expect(screen.getByRole("alert")).toBeDefined());
  });

  test("403 -> permission banner", async () => {
    consoleApplyPayment.mockResolvedValue(result(403));
    renderApply();
    fillAndApply();
    await waitFor(() => expect(screen.getByText(/permission/i)).toBeDefined());
  });
});
