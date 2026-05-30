import { App } from "@/App";
import { apiClient } from "@/generated/client";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

/**
 * Toolchain smoke test (A-12). Proves the harness RUNS — not that
 * Data-Pulse-2 integration works (C-5: no live backend). It confirms:
 *   1. The generated client (D-2/D-7) imports and exposes the typed verbs.
 *   2. React 19 + Vitest + jsdom render the placeholder shell.
 */
describe("scaffold smoke", () => {
  it("exposes the typed generated client surface", () => {
    expect(typeof apiClient.GET).toBe("function");
    expect(typeof apiClient.POST).toBe("function");
    expect(typeof apiClient.DELETE).toBe("function");
  });

  it("renders the placeholder app shell", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /retail tower console/i })).toBeDefined();
  });
});
