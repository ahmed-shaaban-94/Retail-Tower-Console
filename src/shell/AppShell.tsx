import { TowerMark } from "@/components/TowerMark";
/**
 * SF-2 authenticated app shell (T027; RF-2 T009/T010). top-bar + persistent gold
 * scope header + sidebar + content (DESIGN.md layout). The frame every RF-2..RF-7
 * family attaches to. The content area renders `children` — the routed surface
 * (an <Outlet/> from the layout route). Sidebar entries beyond what is built are
 * shown gated to mark scope, not to claim they are built.
 */
import { useActiveContextValue } from "@/context/ActiveContextProvider";
import { NavLink } from "react-router";
import { ScopeHeader } from "./ScopeHeader";
import "./app-shell.css";

/** Live nav destinations. RF-2 un-gates Tenants + Stores; RF-5 un-gates Operators. */
const LIVE_NAV = [
  { label: "Tenants", to: "/tenants" },
  { label: "Stores", to: "/stores" },
  { label: "Operators", to: "/operators" },
];

/** Families not yet built — shown gated to mark scope, not to claim built. */
const GATED_NAV = [
  { label: "Catalog", gate: "RF-3" },
  { label: "Unknown items", gate: "RF-4" },
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
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "nav-entry nav-entry--active" : "nav-entry nav-entry--link"
          }
        >
          Overview
        </NavLink>
        <div className="nav-section">Management</div>
        {LIVE_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "nav-entry nav-entry--active" : "nav-entry nav-entry--link"
            }
          >
            {item.label}
          </NavLink>
        ))}
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

      <main className="content">{children}</main>
    </div>
  );
}
