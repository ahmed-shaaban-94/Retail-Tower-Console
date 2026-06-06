import { apiClient } from "@/generated/client";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Default route mounts ProtectedArea, which calls getActiveContext. Stub the
// client so the smoke render is deterministic (C-5: no live backend).
vi.mock("@/lib/client", async (orig) => ({
  ...(await orig<typeof import("@/lib/client")>()),
  getActiveContext: vi.fn().mockResolvedValue({ status: 200, data: { memberships: [] } }),
}));

import { App } from "@/App";

/**
 * Toolchain + RF-1 root smoke test (A-12). Proves the harness RUNS and the
 * RF-1 app root mounts (router + providers + context). Not a DP2 integration
 * test (C-5: no live backend).
 */
describe("scaffold smoke", () => {
  beforeEach(() => vi.clearAllMocks());

  it("exposes the typed generated client surface", () => {
    expect(typeof apiClient.GET).toBe("function");
    expect(typeof apiClient.POST).toBe("function");
    expect(typeof apiClient.DELETE).toBe("function");
  });

  it("mounts the RF-1 app root without throwing", async () => {
    render(<App />);
    // Default route resolves a zero-membership context -> no-access (S7).
    await waitFor(() => expect(screen.getByText(/no assigned access/i)).toBeDefined());
  });
});
