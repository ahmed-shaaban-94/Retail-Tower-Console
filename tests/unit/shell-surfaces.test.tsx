import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { describe, expect, test, vi } from "vitest";

// Stub the network boundary so the shell surfaces render from fixed context.
const getActiveContext = vi.fn();
vi.mock("@/lib/client", () => ({
  getActiveContext: (...a: unknown[]) => getActiveContext(...a),
  switchActiveTenant: vi.fn(),
  switchActiveStore: vi.fn(),
  clearActiveStore: vi.fn(),
  signOut: vi.fn(),
  refreshSession: vi.fn(),
}));

import { ActiveContextProvider } from "@/context/ActiveContextProvider";
import { createQueryClient } from "@/lib/query";
import { ProtectedArea } from "@/shell/ProtectedArea";

function renderProtected(ctx: unknown): void {
  getActiveContext.mockResolvedValue({ status: 200, data: ctx });
  const qc = createQueryClient();
  function Tree({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <ActiveContextProvider>{children}</ActiveContextProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }
  render(
    <Tree>
      <ProtectedArea />
    </Tree>,
  );
}

describe("ProtectedArea surface selection (rendering backend truth)", () => {
  test("multi-membership with no active tenant -> scope gate", async () => {
    renderProtected({
      active_tenant: null,
      memberships: [
        { tenant_id: "t1", tenant_name: "Northstar Retail" },
        { tenant_id: "t2", tenant_name: "Helios Markets" },
      ],
    });
    expect(await screen.findByRole("heading", { name: /select your context/i })).toBeDefined();
    expect(screen.getByText("Helios Markets")).toBeDefined();
  });

  test("resolved tenant -> app shell with gold scope header", async () => {
    renderProtected({
      user: { display_name: "Amal Saleh" },
      active_tenant: { id: "t1", name: "Northstar Retail" },
      active_store: { id: "s1", name: "Cairo Festival City" },
      active_role_code: "tenant_admin",
      memberships: [{ tenant_id: "t1", tenant_name: "Northstar Retail" }],
    });
    expect(await screen.findByRole("heading", { name: "Overview" })).toBeDefined();
    expect(screen.getByText("Northstar Retail")).toBeDefined();
    expect(screen.getByText("Cairo Festival City")).toBeDefined();
  });

  test("zero memberships -> no access", async () => {
    renderProtected({ active_tenant: null, memberships: [] });
    expect(await screen.findByRole("heading", { name: /no assigned access/i })).toBeDefined();
  });
});
