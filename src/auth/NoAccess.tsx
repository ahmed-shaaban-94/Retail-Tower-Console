/**
 * No-access terminal state (SF-1/SF-2, S7, VD-2). Shown when a signed-in user
 * has zero memberships. Offers only sign-out.
 */
import "./no-access.css";

export interface NoAccessProps {
  onSignOut: () => void | Promise<void>;
}

export function NoAccess({ onSignOut }: NoAccessProps): React.JSX.Element {
  return (
    <div className="signin-stage">
      <div className="noaccess" role="status">
        <svg
          className="noaccess__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        <h1 className="noaccess__title">No assigned access</h1>
        <p className="noaccess__body">
          You're signed in, but your account has no tenant or store access yet. Contact your
          administrator to be granted a membership.
        </p>
        <button className="btn-secondary" type="button" onClick={() => void onSignOut()}>
          Sign out
        </button>
      </div>
    </div>
  );
}
