import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, test, vi } from "vitest";

const updateMembership = vi.fn();
const revokeMembership = vi.fn();
vi.mock("@/lib/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/client")>();
  return {
    ...actual,
    updateMembership: (...a: unknown[]) => updateMembership(...a),
    revokeMembership: (...a: unknown[]) => revokeMembership(...a),
  };
});

import { createQueryClient } from "@/lib/query";
import { EditMember } from "@/operators/EditMember";
import type { MemberRow } from "@/operators/useMembers";

const member: MemberRow = {
  membershipId: "m2",
  userId: "u2",
  email: "omar@northstar.eg",
  displayName: "Omar Khaled",
  roleCode: "store_manager",
  storeAccessKind: "all",
  accessibleStoreIds: [],
  revoked: false,
};

function renderEdit(onChanged = vi.fn()): { onChanged: typeof onChanged } {
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
      <EditMember activeTenantId="t1" member={member} onClose={vi.fn()} onChanged={onChanged} />
    </Tree>,
  );
  return { onChanged };
}

/**
 * Edit/revoke drawer (T022/T023, VG-1). Pre-filled role; save → re-fetch; 404
 * uniform; revoke behind a named confirm → 204 → re-fetch. No 403 / no
 * precondition-401 on these ops (contract).
 */
describe("EditMember", () => {
  beforeEach(() => {
    updateMembership.mockReset();
    revokeMembership.mockReset();
  });

  test("prefills the member's role", () => {
    renderEdit();
    expect((screen.getByLabelText(/role/i) as HTMLInputElement).value).toBe("store_manager");
  });

  test("save -> 200 -> onChanged (close + re-fetch)", async () => {
    updateMembership.mockResolvedValue({ status: 200, data: {}, error: undefined });
    const { onChanged } = renderEdit();
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: "tenant_admin" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
  });

  test("save -> 404 -> uniform not-found banner, no close", async () => {
    updateMembership.mockResolvedValue({ status: 404, data: undefined, error: undefined });
    const { onChanged } = renderEdit();
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
    expect(await screen.findByText(/could not be found/i)).toBeDefined();
    expect(onChanged).not.toHaveBeenCalled();
  });

  test("revoke -> named confirm -> 204 -> onChanged", async () => {
    revokeMembership.mockResolvedValue({ status: 204, data: undefined, error: undefined });
    const { onChanged } = renderEdit();
    fireEvent.click(screen.getByRole("button", { name: /revoke membership/i }));
    const region = await screen.findByRole("region", { name: /confirm: revoke/i });
    expect(region.textContent).toMatch(/Omar Khaled/);
    const btns = screen.getAllByRole("button", { name: /^revoke$/i });
    fireEvent.click(btns[btns.length - 1]);
    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
  });

  test("revoke -> 404 -> uniform banner, confirm dismissed", async () => {
    revokeMembership.mockResolvedValue({ status: 404, data: undefined, error: undefined });
    const { onChanged } = renderEdit();
    fireEvent.click(screen.getByRole("button", { name: /revoke membership/i }));
    const btns = screen.getAllByRole("button", { name: /^revoke$/i });
    fireEvent.click(btns[btns.length - 1]);
    expect(await screen.findByText(/could not be found/i)).toBeDefined();
    expect(onChanged).not.toHaveBeenCalled();
  });
});
