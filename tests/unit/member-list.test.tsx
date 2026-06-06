import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, test, vi } from "vitest";

const listMembers = vi.fn();
vi.mock("@/lib/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/client")>();
  return { ...actual, listMembers: (...a: unknown[]) => listMembers(...a) };
});
const activeContext = vi.fn();
vi.mock("@/context/ActiveContextProvider", () => ({
  useActiveContextValue: () => activeContext(),
}));

import { createQueryClient } from "@/lib/query";
import { MemberList } from "@/operators/MemberList";

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
      <MemberList />
    </Tree>,
  );
}

const withTenant = { context: { active_tenant: { id: "t1", name: "Northstar Retail" } } };

/**
 * Member list state matrix (T009, VG-1). Renders the membership graph as a
 * table; identity / role / store-access / state. No active tenant → pre-call
 * guard routes to the scope chooser (listMembers NOT called). listMembers
 * documents only 404 → uniform banner. Revoked members show a Revoked badge.
 */
describe("MemberList", () => {
  beforeEach(() => {
    listMembers.mockReset();
    activeContext.mockReset();
  });

  test("no active tenant -> scope prompt, listMembers NOT called (pre-call guard)", async () => {
    activeContext.mockReturnValue({ context: { active_tenant: null } });
    renderList();
    expect(await screen.findByText(/select a tenant/i)).toBeDefined();
    expect(listMembers).not.toHaveBeenCalled();
  });

  test("active tenant + members -> table with identity, role, store-access, state", async () => {
    activeContext.mockReturnValue(withTenant);
    listMembers.mockResolvedValue({
      status: 200,
      data: [
        {
          membership_id: "m1",
          user: { id: "u1", email: "amal@northstar.eg", display_name: "Amal Saleh" },
          role_code: "tenant_admin",
          store_access_kind: "all",
          accessible_store_ids: [],
          revoked_at: null,
        },
        {
          membership_id: "m2",
          user: { id: "u2", email: "omar@northstar.eg", display_name: null },
          role_code: "store_manager",
          store_access_kind: "specific",
          accessible_store_ids: ["s1", "s2"],
          revoked_at: "2026-06-01T00:00:00Z",
        },
      ],
    });
    renderList();
    expect(await screen.findByText("Amal Saleh")).toBeDefined();
    expect(screen.getByText("amal@northstar.eg")).toBeDefined();
    expect(screen.getByText("tenant_admin")).toBeDefined();
    expect(screen.getByText(/all stores/i)).toBeDefined();
    expect(screen.getByText(/2 stores/i)).toBeDefined();
    expect(screen.getByText(/revoked/i)).toBeDefined();
    // store access shown as ids/count, not resolved names (OQ-3)
    expect(screen.queryByText(/cairo/i)).toBeNull();
  });

  test("empty -> zero-other-members state with the Invite action", async () => {
    activeContext.mockReturnValue(withTenant);
    listMembers.mockResolvedValue({ status: 200, data: [] });
    renderList();
    expect(await screen.findByText(/no other members/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /invite member/i })).toBeDefined();
  });

  test("404 -> uniform not-available banner with request_id", async () => {
    activeContext.mockReturnValue(withTenant);
    listMembers.mockResolvedValue({ status: 404, error: { error: { request_id: "req-404" } } });
    renderList();
    await waitFor(() => expect(screen.getByRole("alert")).toBeDefined());
    expect(screen.getByText(/not available/i)).toBeDefined();
    expect(screen.getByText(/req-404/)).toBeDefined();
  });
});
