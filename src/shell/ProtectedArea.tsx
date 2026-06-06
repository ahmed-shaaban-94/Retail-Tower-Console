import { NoAccess } from "@/auth/NoAccess";
/**
 * Protected area (SF-2/SF-3, T031). Renders the right surface based on the
 * server-resolved context — never a frontend authorization decision
 * (FR-003-004), only rendering of backend truth:
 *
 *  - loading        → nothing yet (context resolving)
 *  - no memberships → NoAccess (S7)
 *  - no active tenant + multi-membership → ScopeGate (S2)
 *  - active tenant resolved → AppShell
 *
 * A 401 on any consumed call is handled upstream by the auth interceptor, which
 * clears the cache and (via the session-lost callback) redirects to SF-1 (S5).
 */
import { useActiveContextValue } from "@/context/ActiveContextProvider";
import { AppShell } from "./AppShell";
import { ScopeGate } from "./ScopeGate";
import { useSignOut } from "./useSignOut";

export function ProtectedArea(): React.JSX.Element | null {
  const { context, isLoading, membershipCount } = useActiveContextValue();
  const signOut = useSignOut();

  if (isLoading) {
    return null;
  }
  if (membershipCount === 0) {
    return <NoAccess onSignOut={signOut} />;
  }
  if (!context?.active_tenant) {
    return <ScopeGate />;
  }
  return <AppShell onSignOut={signOut} />;
}
