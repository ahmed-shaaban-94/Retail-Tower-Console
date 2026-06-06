import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";

// The client layer is the network boundary; stub it (C-5: no live DP2).
vi.mock("@/lib/client", () => ({
  getActiveContext: vi.fn(),
  switchActiveTenant: vi.fn(),
  switchActiveStore: vi.fn(),
  clearActiveStore: vi.fn(),
}));

import { useActiveContext } from "@/context/useActiveContext";
import * as client from "@/lib/client";
import { createQueryClient } from "@/lib/query";

function wrapper({ children }: { children: ReactNode }) {
  const qc = createQueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

const ctx = (over: Record<string, unknown> = {}) => ({
  status: 200,
  data: {
    user: { id: "u1", email: "a@b.co", is_platform_admin: false },
    active_tenant: { id: "t1", name: "Northstar Retail" },
    active_store: { id: "s1", name: "Cairo Festival City" },
    active_role_code: "tenant_admin",
    memberships: [{ tenant_id: "t1", tenant_name: "Northstar Retail" }],
    ...over,
  },
});

describe("useActiveContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("exposes the server-resolved context read-only after fetch", async () => {
    vi.mocked(client.getActiveContext).mockResolvedValue(ctx() as never);
    const { result } = renderHook(() => useActiveContext(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.context?.active_tenant?.name).toBe("Northstar Retail");
    expect(result.current.context?.active_store?.name).toBe("Cairo Festival City");
  });

  test("switchTenant calls the mutator then re-fetches getActiveContext", async () => {
    vi.mocked(client.getActiveContext)
      .mockResolvedValueOnce(ctx() as never)
      .mockResolvedValueOnce(
        ctx({ active_tenant: { id: "t2", name: "Helios Markets" }, active_store: null }) as never,
      );
    vi.mocked(client.switchActiveTenant).mockResolvedValue({ status: 200 } as never);

    const { result } = renderHook(() => useActiveContext(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.switchTenant("t2");

    expect(client.switchActiveTenant).toHaveBeenCalledWith("t2");
    await waitFor(() => expect(result.current.context?.active_tenant?.name).toBe("Helios Markets"));
    // tenant switch cleared the store backend-side; re-fetch reflects it
    expect(result.current.context?.active_store).toBeNull();
    // getActiveContext re-fetched (initial + after switch)
    expect(client.getActiveContext).toHaveBeenCalledTimes(2);
  });

  test("does not optimistically mutate; context reflects only re-fetched truth", async () => {
    vi.mocked(client.getActiveContext).mockResolvedValue(ctx() as never);
    vi.mocked(client.switchActiveStore).mockResolvedValue({ status: 200 } as never);

    const { result } = renderHook(() => useActiveContext(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Mutator resolves but re-fetch returns the SAME store → no local optimistic jump
    await result.current.switchStore("s9");
    expect(client.switchActiveStore).toHaveBeenCalledWith("s9");
    expect(result.current.context?.active_store?.id).toBe("s1");
  });
});
