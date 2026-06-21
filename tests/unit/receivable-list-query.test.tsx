import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const consoleListReceivables = vi.fn();
vi.mock("@/lib/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/client")>();
  return { ...actual, consoleListReceivables: (...a: unknown[]) => consoleListReceivables(...a) };
});

import { createQueryClient } from "@/lib/query";
import { useReceivables } from "@/receivables/useReceivables";

function wrapper({ children }: { children: ReactNode }) {
  const qc = createQueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

function receivable(receivableRef: string) {
  return {
    receivableRef,
    saleRef: "s1",
    payerRef: "p1",
    outstandingBalance: "120.00",
    state: "open",
    version: 0,
  };
}

/**
 * 018 receivable-list query hook (useInfiniteQuery over consoleListReceivables,
 * scope-keyed by tenant + state filter). Mirrors 017's usePayerAccounts.
 */
describe("useReceivables", () => {
  beforeEach(() => consoleListReceivables.mockReset());

  test("no active tenant -> disabled, no call, no rows", async () => {
    const { result } = renderHook(() => useReceivables(null, {}), { wrapper });
    await new Promise((r) => setTimeout(r, 20));
    expect(consoleListReceivables).not.toHaveBeenCalled();
    expect(result.current.rows).toEqual([]);
  });

  test("first page rows; nextCursor present -> hasMore true", async () => {
    consoleListReceivables.mockResolvedValue({
      status: 200,
      data: { items: [receivable("a"), receivable("b")], nextCursor: "CUR1" },
    });
    const { result } = renderHook(() => useReceivables("t1", {}), { wrapper });
    await waitFor(() => expect(result.current.rows).toHaveLength(2));
    expect(result.current.hasMore).toBe(true);
  });

  test("403 -> forbidden error, no rows", async () => {
    consoleListReceivables.mockResolvedValue({ status: 403, error: { error: {} } });
    const { result } = renderHook(() => useReceivables("t1", {}), { wrapper });
    await waitFor(() => expect(result.current.error?.kind).toBe("forbidden"));
    expect(result.current.rows).toEqual([]);
  });

  test("zero-receivable tenant -> empty, not an error", async () => {
    consoleListReceivables.mockResolvedValue({
      status: 200,
      data: { items: [], nextCursor: null },
    });
    const { result } = renderHook(() => useReceivables("t1", {}), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.rows).toEqual([]);
    expect(result.current.error).toBeUndefined();
  });
});
