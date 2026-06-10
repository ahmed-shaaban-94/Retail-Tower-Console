import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, test, vi } from "vitest";

// Mock the RF-4a data layer at the wrapper boundary (no live DP2).
const listUnknownItems = vi.fn();
vi.mock("@/lib/unknown-items-queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/unknown-items-queries")>();
  return { ...actual, listUnknownItems: (...a: unknown[]) => listUnknownItems(...a) };
});

// Pin a stable active scope so the surface renders without the full provider.
vi.mock("@/unknown-items/useUnknownItemScope", () => ({
  useUnknownItemScope: () => ({
    activeTenantId: "t1",
    activeTenantName: "Northstar Retail",
    activeStoreId: null,
  }),
}));

import { createQueryClient } from "@/lib/query";
import { UnknownItemList } from "@/unknown-items/UnknownItemList";

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
      <UnknownItemList />
    </Tree>,
  );
}

const ITEM = {
  id: "u1",
  tenant_id: "t1",
  store_id: "s1",
  identifier_type: "barcode",
  identifier_value: "5012345678900",
  source_system: null,
  resolution_status: "pending",
  resolution_action: null,
  resolved_at: null,
  resolved_by: null,
  encountered_at: "2026-06-10T10:00:00Z",
};

/**
 * RF-4a list state matrix (T011, VG-1). Renders the backend-scoped page with no
 * client filter; zero rows is a successful empty state; 403 forbidden renders
 * via the persistent banner; changing a control re-keys + re-fetches the queue.
 */
describe("UnknownItemList state matrix", () => {
  beforeEach(() => {
    listUnknownItems.mockReset();
  });

  test("loading -> shows a loading affordance", async () => {
    listUnknownItems.mockReturnValue(new Promise(() => {}));
    renderList();
    expect(await screen.findByText(/loading unknown items/i)).toBeDefined();
  });

  test("success -> renders the backend-scoped rows as a table", async () => {
    listUnknownItems.mockResolvedValue({ status: 200, data: { items: [ITEM], next_cursor: null } });
    renderList();
    expect(await screen.findByText("5012345678900")).toBeDefined();
    expect(screen.getByText("barcode")).toBeDefined();
  });

  test("empty -> successful zero-row state", async () => {
    listUnknownItems.mockResolvedValue({ status: 200, data: { items: [], next_cursor: null } });
    renderList();
    expect(await screen.findByText(/no unknown items to review/i)).toBeDefined();
  });

  test("403 forbidden -> persistent banner with request_id (007 8th category)", async () => {
    listUnknownItems.mockResolvedValue({
      status: 403,
      error: { error: { code: "forbidden", request_id: "req-403" } },
    });
    renderList();
    await waitFor(() => expect(screen.getByRole("alert")).toBeDefined());
    expect(screen.getByText(/permission/i)).toBeDefined();
    expect(screen.getByText(/req-403/)).toBeDefined();
  });

  test("changing the sort control re-fetches the queue", async () => {
    listUnknownItems.mockResolvedValue({ status: 200, data: { items: [ITEM], next_cursor: null } });
    renderList();
    await screen.findByText("5012345678900");
    const calls = listUnknownItems.mock.calls.length;
    fireEvent.change(screen.getByLabelText(/sort/i), { target: { value: "age_asc" } });
    await waitFor(() => expect(listUnknownItems.mock.calls.length).toBeGreaterThan(calls));
    // the new call carries the changed sort param
    const last = listUnknownItems.mock.calls.at(-1)?.[0] as { sort?: string } | undefined;
    expect(last?.sort).toBe("age_asc");
  });
});
