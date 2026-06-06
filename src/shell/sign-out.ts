/**
 * Sign-out resolution (SF-2, T030, Scenario S6). A 204 (session cleared) and a
 * 401 (already expired) are both a successful sign-out from the user's view.
 * Any other status: we still drop local state and route to SF-1 — the console
 * never holds an authoritative session, so client-side sign-out always wins.
 */
export interface SignOutResolution {
  signedOut: true;
}

export function resolveSignOut(_status: number): SignOutResolution {
  return { signedOut: true };
}
