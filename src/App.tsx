import type { ApiClient } from "./generated/client";
import { apiClient } from "./generated/client";

/**
 * Placeholder app shell.
 *
 * Slice 002 (tooling-and-scaffold) is NOT authorized to build any RF-1..RF-7
 * UI — that belongs to slices 003..009. This component only proves the
 * toolchain renders and that the generated client (D-2/D-7) is importable
 * and typed. The auth shell, route guards, and context provider arrive in
 * slice 003-rf1-auth-shell.
 */
export function App(): React.JSX.Element {
  // Reference the typed client so the build proves it is consumable.
  // No call is made here — calls live in per-family slices.
  const client: ApiClient = apiClient;
  void client;

  return (
    <main>
      <h1>Retail Tower Console</h1>
      <p>Scaffold ready. Auth shell arrives in slice 003.</p>
    </main>
  );
}
