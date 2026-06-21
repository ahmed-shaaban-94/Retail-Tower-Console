import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, test, vi } from "vitest";

const consoleListReceivables = vi.fn();
vi.mock("@/lib/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/client")>();
  return { ...actual, consoleListReceivables: (...a: unknown[]) => consoleListReceivables(...a) };
});
const activeContext = vi.fn();
vi.mock("@/context/ActiveContextProvider", () => ({
  useActiveContextValue: () => activeContext(),
}));

import { createQueryClient } from "@/lib/query";
import { ReceivableList } from "@/receivables/ReceivableList";

function renderList(): void {
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
      <ReceivableList />
    </Tree>,
  );
}

const withTenant = { context: { active_tenant: { id: "t1", name: "Northstar Retail" } } };

function receivable(over: Record<string, unknown> = {}) {
  return {
    receivableRef: "r1",
    saleRef: "s1",
    payerRef: "p1",
    outstandingBalance: "120.00",
    state: "open",
    erpnextPaymentEntryRef: null,
    version: 0,
    ...over,
  };
}

/**
 * 018 ReceivableList state matrix (VG-1). Table of receivables (outstanding
 * balance rendered verbatim — exact-decimal Money, no float; state badge; ERP
 * Payment-Entry "not posted" when null). No active tenant → scope prompt (wrapper
 * never called). 403 → banner. Empty → zero-state.
 */
describe("ReceivableList", () => {
  beforeEach(() => {
    consoleListReceivables.mockReset();
    activeContext.mockReset();
  });

  test("no active tenant -> scope prompt, wrapper NOT called", async () => {
    activeContext.mockReturnValue({ context: { active_tenant: null } });
    renderList();
    expect(await screen.findByText(/select a tenant/i)).toBeDefined();
    expect(consoleListReceivables).not.toHaveBeenCalled();
  });

  test("active tenant + receivables -> table with balance verbatim + state", async () => {
    activeContext.mockReturnValue(withTenant);
    consoleListReceivables.mockResolvedValue({
      status: 200,
      data: {
        items: [
          receivable(),
          receivable({ receivableRef: "r2", outstandingBalance: "0.00", state: "settled" }),
        ],
        nextCursor: null,
      },
    });
    renderList();
    expect(await screen.findByText("120.00")).toBeDefined();
    const badges = screen.getAllByText((_, el) => el?.classList.contains("badge") ?? false);
    const badgeText = badges.map((b) => b.textContent);
    expect(badgeText).toContain("open");
    expect(badgeText).toContain("settled");
  });

  test("erpnextPaymentEntryRef null -> 'not posted' shown", async () => {
    activeContext.mockReturnValue(withTenant);
    consoleListReceivables.mockResolvedValue({
      status: 200,
      data: { items: [receivable({ erpnextPaymentEntryRef: null })], nextCursor: null },
    });
    renderList();
    expect(await screen.findByText(/not posted/i)).toBeDefined();
  });

  test("empty -> zero-receivables state", async () => {
    activeContext.mockReturnValue(withTenant);
    consoleListReceivables.mockResolvedValue({
      status: 200,
      data: { items: [], nextCursor: null },
    });
    renderList();
    expect(await screen.findByText(/no receivables/i)).toBeDefined();
  });

  test("403 -> forbidden banner", async () => {
    activeContext.mockReturnValue(withTenant);
    consoleListReceivables.mockResolvedValue({
      status: 403,
      error: { error: { request_id: "req-403" } },
    });
    renderList();
    await waitFor(() => expect(screen.getByRole("alert")).toBeDefined());
    expect(screen.getByText(/req-403/)).toBeDefined();
  });
});
