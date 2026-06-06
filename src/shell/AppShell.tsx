import { TowerMark } from "@/components/TowerMark";
/**
 * SF-2 authenticated app shell (T027). top-bar + persistent gold scope header
 * + sidebar + content (DESIGN.md layout). The frame every RF-2..RF-7 family
 * attaches to. Sidebar entries beyond RF-1 are shown gated to mark scope, not
 * to claim they are built.
 */
import { useActiveContextValue } from "@/context/ActiveContextProvider";
import { ScopeHeader } from "./ScopeHeader";
import "./app-shell.css";

const GATED_NAV = [
  { label: "Stores", gate: "RF-2" },
  { label: "Catalog", gate: "RF-3" },
  { label: "Unknown items", gate: "RF-4" },
  { label: "Operators", gate: "RF-5" },
  { label: "Audit", gate: "RF-6" },
];

export interface AppShellProps {
  onSignOut: () => void | Promise<void>;
  children?: React.ReactNode;
}

export function AppShell({ onSignOut, children }: AppShellProps): React.JSX.Element {
  const { context } = useActiveContextValue();
  const user = context?.user;
  const initials = (user?.display_name ?? user?.email ?? "?")
    .split(/[\s@.]+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="shell">
      <header className="topbar">
        <span className="tower-lockup">
          <TowerMark className="tower-mark" />
          <span className="tower-lockup__word">Retail Tower OS</span>
        </span>
        <div className="topbar__spacer" />
        {user ? (
          <span className="topbar__user">
            <span className="topbar__avatar" aria-hidden="true">
              {initials}
            </span>
            <span className="topbar__name">
              {user.display_name ?? user.email}
              <small>{context?.active_role_code ?? ""}</small>
            </span>
          </span>
        ) : null}
      </header>

      <ScopeHeader />

      <nav className="sidebar" aria-label="Primary">
        <span className="nav-entry nav-entry--active" aria-current="page">
          Overview
        </span>
        <div className="nav-section">Management</div>
        {GATED_NAV.map((item) => (
          <span key={item.gate} className="nav-entry nav-entry--disabled" aria-disabled="true">
            {item.label}
            <span className="nav-gate">{item.gate}</span>
          </span>
        ))}
        <div className="topbar__spacer" />
        <button type="button" className="nav-entry nav-signout" onClick={() => void onSignOut()}>
          Sign out
        </button>
      </nav>

      <main className="content">
        {children ?? (
          <>
            <h1 className="content__title">Overview</h1>
            <p className="content__sub">
              {context?.active_tenant?.name}
              {context?.active_store ? ` · ${context.active_store.name}` : ""}
            </p>
          </>
        )}
      </main>
    </div>
  );
}
