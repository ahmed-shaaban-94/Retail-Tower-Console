/* Retail Tower Console — app shell (enriched).
 * TopBar (56px) + persistent gold ScopeHeader (40px) + Sidebar (240px / 60px collapsed) + content.
 * Composes design-system primitives; the kit owns only layout + fake data wiring. */

const DS = window.RetailTowerConsoleDesignSystem_b7c448;
const { Icon, NavEntry, ScopeHeader, Badge } = DS;

/* Bilingual chrome strings (screen bodies stay in English — a common bilingual-admin pattern). */
const STR = {
  en: { search: "Search stores, orders, SKUs, users\u2026", production: "Production", shortcuts: "SHORTCUTS", sysStatus: "System status", allOk: "All systems operational", updated: "Updated 2m ago", viewDetails: "View details \u203a", signOut: "Sign out", collapse: "Collapse", scopeHint: "switching re-fetches context \u00b7 tenant switch clears store" },
  ar: { search: "\u0627\u0628\u062d\u062b \u0641\u064a \u0627\u0644\u0645\u062a\u0627\u062c\u0631 \u0648\u0627\u0644\u0637\u0644\u0628\u0627\u062a \u0648\u0627\u0644\u0623\u0635\u0646\u0627\u0641\u2026", production: "\u0627\u0644\u0625\u0646\u062a\u0627\u062c", shortcuts: "\u0627\u062e\u062a\u0635\u0627\u0631\u0627\u062a", sysStatus: "\u062d\u0627\u0644\u0629 \u0627\u0644\u0646\u0638\u0627\u0645", allOk: "\u062c\u0645\u064a\u0639 \u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u062a\u0639\u0645\u0644", updated: "\u062d\u064f\u062f\u0651\u0650\u062b \u0642\u0628\u0644 \u062f\u0642\u064a\u0642\u062a\u064a\u0646", viewDetails: "\u0639\u0631\u0636 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644 \u2039", signOut: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c", collapse: "\u0637\u064a\u0651 \u0627\u0644\u0634\u0631\u064a\u0637", scopeHint: "\u0627\u0644\u062a\u0628\u062f\u064a\u0644 \u064a\u0639\u064a\u062f \u062c\u0644\u0628 \u0627\u0644\u0633\u064a\u0627\u0642 \u00b7 \u062a\u0628\u062f\u064a\u0644 \u0627\u0644\u0645\u0633\u062a\u0623\u062c\u0631 \u064a\u0645\u0633\u062d \u0627\u0644\u0645\u062a\u062c\u0631" },
};
const NAV_AR = { command: "\u0645\u0643\u062a\u0628 \u0627\u0644\u0642\u064a\u0627\u062f\u0629", incident: "\u063a\u0631\u0641\u0629 \u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u062d\u0648\u0627\u062f\u062b", overview: "\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629", sales: "\u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a", reconciliation: "\u0627\u0644\u062a\u0633\u0648\u064a\u0629", moneyclose: "\u0625\u0642\u0641\u0627\u0644 \u0627\u0644\u0646\u0642\u062f\u064a\u0629", outbox: "\u0627\u0644\u0635\u0627\u062f\u0631 \u0648\u0627\u0644\u0645\u0632\u0627\u0645\u0646\u0629", catalog: "\u0627\u0644\u0643\u062a\u0627\u0644\u0648\u062c \u0648\u0627\u0644\u0645\u062e\u0632\u0648\u0646", transfers: "\u062a\u062d\u0648\u064a\u0644\u0627\u062a \u0627\u0644\u0645\u062e\u0632\u0648\u0646", pricing: "\u062a\u063a\u064a\u064a\u0631\u0627\u062a \u0627\u0644\u0623\u0633\u0639\u0627\u0631", returns: "\u0627\u0644\u0645\u0631\u062a\u062c\u0639\u0627\u062a \u0648\u0627\u0644\u0627\u0633\u062a\u0631\u062f\u0627\u062f", unknown: "\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0623\u0635\u0646\u0627\u0641 \u063a\u064a\u0631 \u0627\u0644\u0645\u0639\u0631\u0648\u0641\u0629", stores: "\u0627\u0644\u0645\u062a\u0627\u062c\u0631 \u0648\u0627\u0644\u0645\u0633\u062a\u0623\u062c\u0631\u0648\u0646", onboarding: "\u062a\u0647\u064a\u0626\u0629 \u0645\u062a\u062c\u0631", operators: "\u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u0648\u0646 \u0648\u0627\u0644\u0623\u062f\u0648\u0627\u0631", permissions: "\u0627\u0644\u0635\u0644\u0627\u062d\u064a\u0627\u062a", audit: "\u0633\u062c\u0644\u0651\u0627\u062a \u0627\u0644\u062a\u062f\u0642\u064a\u0642", observability: "\u0627\u0644\u0642\u0627\u0628\u0644\u064a\u0629 \u0644\u0644\u0631\u0635\u062f", oncall: "\u0627\u0644\u062a\u0646\u0628\u064a\u0647 \u0648\u0627\u0644\u0627\u0633\u062a\u062f\u0639\u0627\u0621", settings: "\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0648\u0627\u0644\u062a\u0643\u0627\u0645\u0644\u0627\u062a", billing: "\u0627\u0644\u0641\u0648\u062a\u0631\u0629 \u0648\u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645", aistudio: "\u0627\u0633\u062a\u0648\u062f\u064a\u0648 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a", edgestates: "\u0627\u0644\u062d\u0627\u0644\u0627\u062a \u0627\u0644\u062d\u062f\u064a\u0629" };
const SHORT_AR = { "Create Report": "\u0625\u0646\u0634\u0627\u0621 \u062a\u0642\u0631\u064a\u0631", "Add Store": "\u0625\u0636\u0627\u0641\u0629 \u0645\u062a\u062c\u0631", "New Alert Rule": "\u0642\u0627\u0639\u062f\u0629 \u062a\u0646\u0628\u064a\u0647 \u062c\u062f\u064a\u062f\u0629", "Data Sync Now": "\u0645\u0632\u0627\u0645\u0646\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0622\u0646" };

function NotifBell() {
  const [open, setOpen] = React.useState(false);
  const [unread, setUnread] = React.useState(12);
  const items = [
    { tone: "danger", icon: "alert", title: "Invoice post retry failed", meta: "Alexandria Corniche \u00b7 2m ago" },
    { tone: "warning", icon: "link", title: "Sync lag detected (38s)", meta: "Frappe Orch. \u00b7 12m ago" },
    { tone: "info", icon: "unknown", title: "8 unknown items to review", meta: "City Stars \u00b7 20m ago" },
    { tone: "success", icon: "audit", title: "Daily reconciliation complete", meta: "All stores \u00b7 1h ago" },
  ];
  const ct = { danger: ["var(--color-danger-surface)", "var(--color-danger-on)"], warning: ["var(--color-warning-surface)", "var(--color-warning-on)"], info: ["var(--color-info-surface)", "var(--color-info-on)"], success: ["var(--color-success-surface)", "var(--color-success-on)"] };
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button type="button" title="Notifications" onClick={() => setOpen((o) => !o)} style={{ ...iconBtn, position: "relative" }}>
        <Icon name="bell" size={18} />
        {unread > 0 ? <span style={{ position: "absolute", top: "3px", insetInlineEnd: "2px", minWidth: "16px", height: "16px", padding: "0 4px", borderRadius: "9999px", background: "var(--color-danger)", color: "#fff", font: "700 10px/16px var(--font-sans)", textAlign: "center", border: "2px solid var(--color-surface)", boxSizing: "content-box" }}>{unread}</span> : null}
      </button>
      {open ? (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 30 }} />
          <div style={{ position: "absolute", top: "44px", insetInlineEnd: 0, zIndex: 40, width: "320px", background: "var(--color-surface-overlay)", border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-dialog)", boxShadow: "var(--shadow-pane)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--color-border)" }}>
              <span style={{ font: "var(--type-label)" }}>Notifications</span>
              <button type="button" onClick={() => setUnread(0)} style={{ font: "var(--type-caption)", color: "var(--color-accent)", fontWeight: 600, cursor: "pointer" }}>Mark all read</button>
            </div>
            <div style={{ maxHeight: "300px", overflow: "auto" }}>
              {items.map((it, i) => {
                const [bg, fg] = ct[it.tone];
                return (
                  <div key={i} style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)", borderBottom: i < items.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                    <span style={{ width: "28px", height: "28px", borderRadius: "var(--radius-md)", flexShrink: 0, display: "grid", placeItems: "center", background: bg, color: fg }}><Icon name={it.icon} size={15} /></span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ font: "var(--type-label)" }}>{it.title}</div>
                      <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{it.meta}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: "var(--space-3) var(--space-4)", borderTop: "1px solid var(--color-border)", textAlign: "center" }}>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ font: "var(--type-label)", color: "var(--color-accent)", textDecoration: "none", fontWeight: 600 }}>View all activity</a>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function TopBar({ user, theme, onToggleTheme, onCommand, onToggleCollapse, lang }) {
  const S = STR[lang] || STR.en;
  return (
    <header
      style={{
        gridArea: "topbar",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-4)",
        padding: "0 var(--space-5)",
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", flexShrink: 0 }}>
        <span style={{ color: "var(--color-gold-marker)" }}><Icon name="tower" size={26} strokeWidth={1.75} /></span>
        <span className="rtc-hide-sm" style={{ font: "700 var(--text-title)/1 var(--font-sans)", letterSpacing: "-0.01em" }}>Retail Tower OS</span>
        <span className="rtc-hide-md" style={{ font: "600 var(--text-caption)/1 var(--font-sans)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-muted)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-pill)", padding: "3px 8px", marginLeft: "2px" }}>Console</span>
      </div>

      <button type="button" onClick={onCommand} title="Search & commands (⌘K)" style={{ flex: 1, maxWidth: "480px", position: "relative", textAlign: "left", cursor: "pointer" }}>
        <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none", display: "inline-flex" }}>
          <Icon name="search" size={16} />
        </span>
        <span style={{ display: "flex", alignItems: "center", width: "100%", height: "36px", paddingInlineStart: "32px", paddingInlineEnd: "44px", background: "var(--color-surface-sunken)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-control)", color: "var(--color-text-muted)", font: "var(--type-body)" }}>{S.search}</span>
        <span className="rtc-hide-sm" style={{ position: "absolute", insetInlineEnd: "10px", top: "50%", transform: "translateY(-50%)", font: "var(--type-caption)", color: "var(--color-text-disabled)", fontFamily: "var(--font-mono)", pointerEvents: "none", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "1px 5px" }}>⌘K</span>
      </button>

      <div style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", flexShrink: 0, marginInlineStart: "auto" }}>
        <span className="rtc-hide-md" style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "36px", padding: "0 var(--space-3)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-control)", font: "var(--type-label)", color: "var(--color-text-muted)" }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "9999px", background: "var(--color-success)" }} />
          {S.production}
        </span>
        <button type="button" title="Help" className="rtc-hide-sm" style={iconBtn}><Icon name="help" size={18} /></button>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Switch theme"
          title="Switch theme (dark / light)"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", background: "transparent", border: "1px solid var(--color-border)", borderRadius: "var(--radius-control)", color: "var(--color-text-muted)", cursor: "pointer", flexShrink: 0 }}
        >
          <Icon name={theme === "dark" ? "moon" : "sun"} size={18} />
        </button>
        <NotifBell />
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-1) var(--space-2)", borderRadius: "var(--radius-control)", cursor: "pointer", flexShrink: 0 }}>
          <span style={{ position: "relative" }}>
            <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--color-primary)", display: "grid", placeItems: "center", font: "700 var(--text-caption)/1 var(--font-sans)", color: "#fff" }}>{user.initials}</span>
            <span style={{ position: "absolute", bottom: 0, right: 0, width: "9px", height: "9px", borderRadius: "9999px", background: "var(--color-success)", border: "2px solid var(--color-surface)" }} />
          </span>
        <div className="rtc-hide-sm" style={{ font: "var(--type-label)" }}>{user.name}<small style={{ display: "block", fontWeight: 400, color: "var(--color-text-muted)" }}>{user.role}</small></div>
        </div>
      </div>
    </header>
  );
}

const iconBtn = {
  width: "36px", height: "36px", borderRadius: "var(--radius-md)", display: "grid",
  placeItems: "center", color: "var(--color-text-muted)", cursor: "pointer",
  background: "transparent", border: "none",
};

function ScopeSwitcher({ scope, scopes, onPick, lang }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ gridArea: "scope", position: "relative" }}>
      <ScopeHeader
        tenant={scope.tenant}
        store={scope.store}
        hint={(STR[lang] || STR.en).scopeHint}
        open={open}
        onSwitch={() => setOpen((o) => !o)}
      />
      {open ? (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 18 }} />
          <div style={menuStyle}>
            <div style={menuGroup}>TENANT</div>
            {scopes.tenants.map((t) => (
              <MenuItem key={t} active={t === scope.tenant} onClick={() => { onPick({ tenant: t, store: "All stores" }); setOpen(false); }}>{t}</MenuItem>
            ))}
            <div style={{ height: "1px", background: "var(--color-border)", margin: "var(--space-2) 0" }} />
            <div style={menuGroup}>STORE · {scope.tenant}</div>
            {scopes.stores.map((s) => (
              <MenuItem key={s} active={s === scope.store} onClick={() => { onPick({ tenant: scope.tenant, store: s }); setOpen(false); }}>{s}</MenuItem>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

const menuStyle = {
  position: "absolute", top: "44px", left: "var(--space-6)", zIndex: 20, width: "320px",
  background: "var(--color-surface-overlay)", border: "1px solid var(--color-border-strong)",
  borderRadius: "var(--radius-dialog)", boxShadow: "var(--shadow-pane)", padding: "var(--space-3)",
};
const menuGroup = { font: "600 var(--text-caption)/1 var(--font-sans)", color: "var(--color-text-muted)", padding: "var(--space-2) var(--space-2) var(--space-1)" };

function MenuItem({ active, onClick, children }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-2) var(--space-3)",
        borderRadius: "var(--radius-md)", cursor: "pointer", font: "var(--type-body)",
        background: active ? "var(--color-gold-soft)" : hover ? "var(--color-surface-raised)" : "transparent",
        color: active ? "var(--color-gold-strong)" : "var(--color-text)",
      }}
    >
      <span style={{ flex: 1 }}>{children}</span>
      {active ? <Icon name="check" size={14} strokeWidth={2.5} /> : null}
    </div>
  );
}

/* The 10 route families, in screenshot order. */
const NAV = [
  { id: "command", icon: "tower", label: "Command Desk" },
  { id: "incident", icon: "alert", label: "Incident War-Room", gate: "1" },
  { id: "overview", icon: "overview", label: "Overview" },
  { id: "sales", icon: "gauge", label: "Sales Monitor" },
  { id: "reconciliation", icon: "link", label: "Reconciliation" },
  { id: "moneyclose", icon: "clock", label: "Money Close" },
  { id: "outbox", icon: "link", label: "Outbox & Sync", gate: "94" },
  { id: "catalog", icon: "catalog", label: "Catalog & Inventory" },
  { id: "transfers", icon: "link", label: "Inventory Transfers" },
  { id: "pricing", icon: "catalog", label: "Price Changes", gate: "2" },
  { id: "returns", icon: "unknown", label: "Returns & Refunds", gate: "5" },
  { id: "unknown", icon: "unknown", label: "Unknown Items Review", gate: "24" },
  { id: "stores", icon: "stores", label: "Stores & Tenants" },
  { id: "onboarding", icon: "plus", label: "Onboard Store" },
  { id: "operators", icon: "operators", label: "Users & Roles" },
  { id: "permissions", icon: "operators", label: "Permissions" },
  { id: "audit", icon: "audit", label: "Audit Logs" },
  { id: "observability", icon: "activity", label: "Observability" },
  { id: "oncall", icon: "bell", label: "Alert & On-Call" },
  { id: "settings", icon: "settings", label: "Settings & Integrations" },
  { id: "billing", icon: "audit", label: "Billing & Usage" },
  { id: "aistudio", icon: "signal", label: "AI Studio" },
  { id: "edgestates", icon: "info", label: "Edge States" },
];

const SHORTCUTS = [
  { icon: "audit", label: "Create Report", toast: "Report queued for export", tone: "success" },
  { icon: "stores", label: "Add Store", toast: "New store wizard opened", tone: "info" },
  { icon: "bell", label: "New Alert Rule", toast: "Alert rule draft created", tone: "info" },
  { icon: "link", label: "Data Sync Now", toast: "Data sync started", tone: "info" },
];

function CollapsedItem({ item, active, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      title={item.label}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative", display: "grid", placeItems: "center", width: "40px", height: "40px",
        margin: "0 auto", borderRadius: "8px", cursor: "pointer", border: "1px solid transparent",
        color: active || hover ? "var(--color-text)" : "var(--color-text-muted)",
        background: active ? "var(--color-primary-subtle)" : hover ? "var(--color-surface-raised)" : "transparent",
        transition: "background-color var(--duration-2) var(--ease-out), color var(--duration-2) var(--ease-out)",
      }}
    >
      {active ? <span style={{ position: "absolute", top: "50%", left: "-12px", transform: "translateY(-50%)", width: "3px", height: "20px", borderRadius: "0 2px 2px 0", background: "var(--color-gold-marker)" }} /> : null}
      <Icon name={item.icon} size={18} />
    </button>
  );
}

function Sidebar({ route, onNavigate, collapsed, onToggleCollapse, lang }) {
  const S = STR[lang] || STR.en;
  const navLabel = (it) => (lang === "ar" ? (NAV_AR[it.id] || it.label) : it.label);
  if (collapsed) {
    return (
      <nav style={{ gridArea: "sidebar", background: "var(--color-surface-sunken)", borderRight: "1px solid var(--color-border)", padding: "var(--space-4) 0", display: "flex", flexDirection: "column", gap: "4px", overflow: "auto" }}>
        {NAV.map((it) => <CollapsedItem key={it.id} item={{ ...it, label: navLabel(it) }} active={route === it.id} onClick={() => onNavigate(it.id)} />)}
        <div style={{ flex: 1, minHeight: "var(--space-4)" }} />
        <CollapsedItem item={{ icon: "chevron", label: S.collapse }} onClick={onToggleCollapse} />
      </nav>
    );
  }
  return (
    <nav style={{ gridArea: "sidebar", background: "var(--color-surface-sunken)", borderRight: "1px solid var(--color-border)", padding: "var(--space-4) var(--space-3)", display: "flex", flexDirection: "column", gap: "2px", overflow: "auto" }}>
      {NAV.map((it) => (
        <NavEntry key={it.id} as="button" icon={<Icon name={it.icon} />} active={route === it.id} onClick={() => onNavigate(it.id)} gate={it.gate}>{navLabel(it)}</NavEntry>
      ))}

      <div style={{ height: "1px", background: "var(--color-border)", margin: "var(--space-4) var(--space-2)" }} />

      {/* System status block */}
      <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", padding: "var(--space-3)", display: "grid", gap: "var(--space-2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-pill)", background: "var(--color-success-surface)", color: "var(--color-success-on)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Icon name="check" size={13} strokeWidth={2.5} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ font: "var(--type-label)" }}>{S.sysStatus}</div>
            <div style={{ font: "var(--type-caption)", color: "var(--color-success-on)" }}>{S.allOk}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", font: "var(--type-caption)", color: "var(--color-text-muted)" }}>
          <span>{S.updated}</span>
          <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--color-accent)", textDecoration: "none", fontWeight: 600 }}>{S.viewDetails}</a>
        </div>
      </div>

      <div style={navSection}>{S.shortcuts}</div>
      {SHORTCUTS.map((s) => (
        <NavEntry key={s.label} as="button" icon={<Icon name={s.icon} />} onClick={() => window.rtcToast && window.rtcToast(s.toast, s.tone)}>{lang === "ar" ? (SHORT_AR[s.label] || s.label) : s.label}</NavEntry>
      ))}

      <div style={{ flex: 1, minHeight: "var(--space-4)" }} />
      <NavEntry as="button" icon={<Icon name="sign-out" />}>{S.signOut}</NavEntry>
      <NavEntry as="button" icon={<Icon name="chevron" style={{ transform: "rotate(90deg)" }} />} onClick={onToggleCollapse}>{S.collapse}</NavEntry>
    </nav>
  );
}
const navSection = { font: "600 var(--text-caption)/1 var(--font-sans)", color: "var(--color-text-disabled)", padding: "var(--space-4) var(--space-3) var(--space-2)", letterSpacing: "0.06em" };

function AppShell({ user, theme, onToggleTheme, scope, scopes, onPickScope, route, onNavigate, onCommand, lang, children }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener ? mq.addEventListener("change", apply) : mq.addListener(apply);
    return () => { mq.removeEventListener ? mq.removeEventListener("change", apply) : mq.removeListener(apply); };
  }, []);
  const isCollapsed = collapsed || narrow;
  const toggle = () => { if (narrow) return; setCollapsed((c) => !c); };
  return (
    <div
      style={{
        height: "100%",
        display: "grid",
        gridTemplateRows: "var(--shell-topbar-h) var(--shell-scope-h) 1fr",
        gridTemplateColumns: `${isCollapsed ? "var(--shell-sidebar-collapsed-w)" : "var(--shell-sidebar-w)"} 1fr`,
        gridTemplateAreas: `"topbar topbar" "scope scope" "sidebar content"`,
        background: "var(--color-bg)",
        transition: "grid-template-columns var(--duration-3) var(--ease-out)",
      }}
    >
      <TopBar user={user} theme={theme} onToggleTheme={onToggleTheme} onCommand={onCommand} onToggleCollapse={() => setCollapsed((c) => !c)} lang={lang} />
      <ScopeSwitcher scope={scope} scopes={scopes} onPick={onPickScope} lang={lang} />
      <Sidebar route={route} onNavigate={onNavigate} collapsed={isCollapsed} onToggleCollapse={toggle} lang={lang} />
      <main key={route} className="rtc-screen" style={{ gridArea: "content", padding: "var(--space-7) var(--space-6)", overflow: "auto" }}>{children}</main>
    </div>
  );
}

Object.assign(window, { AppShell, TopBar, Sidebar, ScopeSwitcher });
