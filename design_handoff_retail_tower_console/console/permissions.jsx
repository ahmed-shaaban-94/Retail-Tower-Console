/* Retail Tower Console — PERMISSIONS MATRIX.
 * The governance grid: capabilities (grouped by route family) × operator tiers.
 * Each cell is Full / Scoped / None — the dense, legible answer to "who can do what,
 * where." Scope language is first-class. Gold stays authority-only (unused). */

const DSpm = window.RetailTowerConsoleDesignSystem_b7c448;
const pmCard = { border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", boxShadow: "var(--shadow-card)", overflow: "hidden" };

function PermissionsMatrix({ scope }) {
  const { Button, Badge, Icon } = DSpm;
  const PageHeader = window.PageHeader;

  const roles = [
    { id: "padmin", label: "Platform Admin", tier: "Platform" },
    { id: "towner", label: "Tenant Owner", tier: "Tenant" },
    { id: "tadmin", label: "Tenant Admin", tier: "Tenant" },
    { id: "smgr", label: "Store Manager", tier: "Store" },
    { id: "staff", label: "Store Staff", tier: "Store" },
    { id: "auditor", label: "Auditor", tier: "Read-only" },
  ];

  // F = full, S = scoped (own tenant/store only), N = none
  const groups = [
    { name: "Stores & Tenants", caps: [
      { label: "View stores", v: ["F", "F", "F", "S", "S", "F"] },
      { label: "Create store", v: ["F", "F", "F", "N", "N", "N"] },
      { label: "Edit store details", v: ["F", "F", "F", "S", "N", "N"] },
      { label: "Archive store", v: ["F", "F", "N", "N", "N", "N"] },
      { label: "Switch tenant", v: ["F", "N", "N", "N", "N", "N"] },
    ]},
    { name: "Catalog & pricing", caps: [
      { label: "View catalog", v: ["F", "F", "F", "S", "S", "F"] },
      { label: "Edit prices", v: ["F", "F", "F", "S", "N", "N"] },
      { label: "Approve price change", v: ["F", "F", "F", "N", "N", "N"] },
      { label: "Manage inventory", v: ["F", "F", "F", "S", "S", "N"] },
    ]},
    { name: "Money & reconciliation", caps: [
      { label: "View reconciliation", v: ["F", "F", "F", "S", "N", "F"] },
      { label: "Post money close", v: ["F", "F", "F", "S", "N", "N"] },
      { label: "Force-close register", v: ["F", "F", "N", "S", "N", "N"] },
    ]},
    { name: "Unknown items", caps: [
      { label: "View review queue", v: ["F", "F", "F", "S", "S", "F"] },
      { label: "Resolve item", v: ["F", "F", "F", "S", "N", "N"] },
    ]},
    { name: "Operators", caps: [
      { label: "View operators", v: ["F", "F", "F", "S", "N", "F"] },
      { label: "Invite operator", v: ["F", "F", "F", "N", "N", "N"] },
      { label: "Assign roles", v: ["F", "F", "S", "N", "N", "N"] },
    ]},
    { name: "Audit", caps: [
      { label: "View audit · own scope", v: ["F", "F", "F", "S", "N", "F"] },
      { label: "View audit · all scopes", v: ["F", "F", "N", "N", "N", "F"] },
      { label: "Export audit", v: ["F", "F", "N", "N", "N", "F"] },
    ]},
  ];

  const [hoverCol, setHoverCol] = React.useState(null);
  const [hoverRow, setHoverRow] = React.useState(null);
  let rowIndex = 0;

  function Cell({ kind, col }) {
    const on = hoverCol === col;
    if (kind === "F") return <span title="Full access" style={{ display: "grid", placeItems: "center" }}><span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-md)", display: "grid", placeItems: "center", background: "var(--color-success-surface)", color: "var(--color-success-on)" }}><Icon name="check" size={14} strokeWidth={2.5} /></span></span>;
    if (kind === "S") return <span title="Scoped — own tenant / store only" style={{ display: "grid", placeItems: "center" }}><span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-md)", display: "grid", placeItems: "center", background: "var(--color-warning-surface)", color: "var(--color-warning-on)", font: "700 11px/1 var(--font-sans)" }}>S</span></span>;
    return <span title="No access" style={{ display: "grid", placeItems: "center", color: "var(--color-text-disabled)" }}>—</span>;
  }

  const th = (children, col) => (
    <th onMouseEnter={() => setHoverCol(col)} onMouseLeave={() => setHoverCol(null)} style={{ padding: "var(--space-3) var(--space-3)", borderBottom: "1px solid var(--color-border)", background: hoverCol === col ? "var(--color-surface-raised)" : "var(--color-surface-raised)", textAlign: "center", verticalAlign: "bottom", minWidth: "104px" }}>{children}</th>
  );

  return (
    <div>
      <PageHeader
        title="Permissions Matrix"
        subtitle={`Capability grid · ${scope.tenant} · who can do what, where`}
        actions={<>
          <Button variant="secondary" iconStart={<Icon name="audit" size={16} />} onClick={() => window.rtcToast && window.rtcToast("Matrix exported as CSV", "info")}>Export</Button>
          <Button variant="primary" iconStart={<Icon name="plus" size={16} />} onClick={() => window.rtcToast && window.rtcToast("New custom role draft created", "info")}>New role</Button>
        </>}
      />

      {/* legend */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-5)", marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
        {[["F", "Full access", "success"], ["S", "Scoped to own tenant / store", "warning"], ["—", "No access", "muted"]].map(([g, t, tone]) => (
          <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", font: "var(--type-caption)", color: "var(--color-text-muted)" }}>
            <span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-md)", display: "grid", placeItems: "center", background: tone === "muted" ? "transparent" : `var(--color-${tone}-surface)`, color: tone === "muted" ? "var(--color-text-disabled)" : `var(--color-${tone}-on)`, font: "700 10px/1 var(--font-sans)" }}>{g === "F" ? <Icon name="check" size={12} strokeWidth={2.5} /> : g}</span>
            {t}
          </span>
        ))}
      </div>

      <div style={{ ...pmCard, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "880px" }}>
          <thead>
            <tr>
              <th style={{ padding: "var(--space-3) var(--space-5)", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface-raised)", textAlign: "left", position: "sticky", left: 0, zIndex: 2, minWidth: "220px" }}>
                <span style={{ font: "600 var(--text-caption)/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)" }}>Capability</span>
              </th>
              {roles.map((r, ci) => th(
                <div onMouseEnter={() => setHoverCol(ci)} onMouseLeave={() => setHoverCol(null)}>
                  <div style={{ font: "var(--type-label)", color: "var(--color-text)" }}>{r.label}</div>
                  <div style={{ marginTop: "5px", display: "flex", justifyContent: "center" }}><Badge tone="info">{r.tier}</Badge></div>
                </div>, ci
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <React.Fragment key={g.name}>
                <tr>
                  <td colSpan={roles.length + 1} style={{ padding: "var(--space-3) var(--space-5)", background: "var(--color-surface-sunken)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
                    <span style={{ font: "600 var(--text-caption)/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)" }}>{g.name}</span>
                  </td>
                </tr>
                {g.caps.map((cap) => {
                  const ri = rowIndex++;
                  const rowOn = hoverRow === ri;
                  return (
                    <tr key={cap.label} onMouseEnter={() => setHoverRow(ri)} onMouseLeave={() => setHoverRow(null)} style={{ background: rowOn ? "var(--color-surface-raised)" : "transparent" }}>
                      <td style={{ padding: "var(--space-3) var(--space-5)", borderTop: "1px solid var(--color-border)", font: "var(--type-body)", color: "var(--color-text)", position: "sticky", left: 0, zIndex: 1, background: rowOn ? "var(--color-surface-raised)" : "var(--color-surface)" }}>{cap.label}</td>
                      {cap.v.map((kind, ci) => (
                        <td key={ci} onMouseEnter={() => setHoverCol(ci)} onMouseLeave={() => setHoverCol(null)} style={{ padding: "var(--space-2)", borderTop: "1px solid var(--color-border)", textAlign: "center", background: hoverCol === ci ? "color-mix(in oklab, var(--color-primary-subtle) 60%, transparent)" : "transparent" }}>
                          <Cell kind={kind} col={ci} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginTop: "var(--space-4)", font: "var(--type-caption)", color: "var(--color-text-muted)" }}>
        <Icon name="info" size={14} />
        Changes to a built-in tier apply tenant-wide and are written to the audit log. Create a custom role to scope exceptions.
      </div>
    </div>
  );
}

Object.assign(window, { PermissionsMatrix });
