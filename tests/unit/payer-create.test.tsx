import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, test, vi } from "vitest";

const consoleCreatePayerAccount = vi.fn();
vi.mock("@/lib/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/client")>();
  return {
    ...actual,
    consoleCreatePayerAccount: (...a: unknown[]) => consoleCreatePayerAccount(...a),
  };
});

import { createQueryClient } from "@/lib/query";
import { PayerCreate } from "@/payers/PayerCreate";

function renderCreate(onCreated = vi.fn()): { onCreated: typeof onCreated } {
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
      <PayerCreate
        activeTenant={{ id: "t1", name: "Northstar Retail" }}
        onClose={vi.fn()}
        onCreated={onCreated}
      />
    </Tree>,
  );
  return { onCreated };
}

function result(status: number, code?: string, headers: Record<string, string> = {}) {
  return {
    status,
    data: status === 201 ? { payerRef: "p1" } : undefined,
    error: code ? { error: { code, request_id: "req-x" } } : undefined,
    headers: new Headers(headers),
  };
}

function fillAndCreate(displayName = "MedCover Insurance"): void {
  fireEvent.change(screen.getByLabelText(/display name/i), { target: { value: displayName } });
  fireEvent.click(screen.getByRole("button", { name: /create payer/i }));
}

/**
 * 017 PayerCreate drawer (VG-1). Wires validatePayerDraft (client guard) +
 * consoleCreatePayerAccount (idempotency-keyed) + classifyPayerCreateOutcome:
 *   201/replayed -> onCreated; 400 -> inline; 403 -> banner; 409 -> non-disclosing.
 * status/version are NOT in the form (OQ-CON-EDIT deferred; create-only v1).
 */
describe("PayerCreate", () => {
  beforeEach(() => consoleCreatePayerAccount.mockReset());

  test("empty displayName -> client validation, wrapper NOT called", async () => {
    renderCreate();
    fireEvent.click(screen.getByRole("button", { name: /create payer/i }));
    expect(await screen.findByText(/display name is required/i)).toBeDefined();
    expect(consoleCreatePayerAccount).not.toHaveBeenCalled();
  });

  test("201 -> onCreated called; create sends an Idempotency-Key", async () => {
    consoleCreatePayerAccount.mockResolvedValue(result(201));
    const { onCreated } = renderCreate();
    fillAndCreate();
    await waitFor(() => expect(onCreated).toHaveBeenCalled());
    // wrapper called as (body, idempotencyKey)
    const [, key] = consoleCreatePayerAccount.mock.calls[0];
    expect(String(key)).toMatch(/^[\x21-\x7E]{16,128}$/);
  });

  test("400 validation -> inline error, onCreated NOT called", async () => {
    consoleCreatePayerAccount.mockResolvedValue(result(400, "validation_failure"));
    const { onCreated } = renderCreate();
    fillAndCreate();
    await waitFor(() => expect(screen.getByRole("alert")).toBeDefined());
    expect(onCreated).not.toHaveBeenCalled();
  });

  test("403 -> permission banner", async () => {
    consoleCreatePayerAccount.mockResolvedValue(result(403));
    renderCreate();
    fillAndCreate();
    await waitFor(() => expect(screen.getByText(/permission/i)).toBeDefined());
  });

  test("409 -> non-disclosing conflict banner", async () => {
    consoleCreatePayerAccount.mockResolvedValue(result(409));
    renderCreate();
    fillAndCreate();
    await waitFor(() => expect(screen.getByRole("alert")).toBeDefined());
  });
});
