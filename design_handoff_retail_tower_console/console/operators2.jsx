/* Retail Tower Console — Users & Roles (rich rebuild).
 * KPI strip · user table (avatar · role · scope · MFA · status) · profile drawer ·
 * access-breakdown / role-distribution / permission-matrix row. */

const DSops = window.RetailTowerConsoleDesignSystem_b7c448;

function Operators({ scope }) {
  const { Button, Badge, Icon } = DSops;
  const { KpiCard, Donut, Panel } = window;
  const { Avatar, DetailDrawer, KV, Toolbar, SearchInput, Pager, BarMeter, SectionTitle, Checkbox, SortHeader, BulkBar, useTableState } = window;

  const kpis = [
    { icon: "operators", tone: "primary", label: "Total Users", value: "256", delta: "12.5%", deltaDir: "up", sub: "in tenant", spark: [210, 220, 228, 236, 244, 250, 256], sparkColor: "var(--color-accent)" },
    { icon: "operators", tone: "success", label: "Active Users", value: "198", delta: "9.3%", deltaDir: "up", sub: "last 30d", spark: [170, 176, 182, 188, 192, 195, 198], sparkColor: "var(--color-success-on)" },
    { icon: "audit", tone: "info", label: "Admins", value: "18", delta: "5.9%", deltaDir: "up", sub: "elevated", spark: [15, 15, 16, 16, 17, 17, 18], sparkColor: "var(--color-info-on)" },
    { icon: "clock", tone: "warning", label: "Pending Invites", value: "14", delta: "7.1%", deltaDir: "down", sub: "awaiting", spark: [20, 19, 18, 17, 16, 15, 14], sparkColor: "var(--color-warning-on)" },
    { icon: "gauge", tone: "success", label: "MFA Enabled", value: "92.4", unit: "%", delta: "3.6pp", deltaDir: "up", sub: "of users", spark: [86, 87.5, 89, 90, 91, 92, 92.4], sparkColor: "var(--color-success-on)" },
    { icon: "alert", tone: "danger", label: "Locked Accounts", value: "3", delta: "25.0%", deltaDir: "down", sub: "this week", spark: [6, 5, 5, 4, 4, 3, 3], sparkColor: "var(--color-danger-on)" },
  ];

  const users = [
    { name: "Amal Saleh", email: "amal@northstar", role: "Tenant Admin", roleTone: "info", scope: "All stores", status: ["success", "Active"], mfa: true, last: "2m ago", joined: "Jan 10, 2024", reports: 12 },
    { name: "Karim Adel", email: "karim@northstar", role: "Store Manager", roleTone: "neutral", scope: "Mall of Egypt", status: ["success", "Active"], mfa: true, last: "18m ago", joined: "Feb 03, 2024", reports: 22 },
    { name: "Nour Hassan", email: "nour@northstar", role: "Store Manager", roleTone: "neutral", scope: "City Stars Heliopolis", status: ["success", "Active"], mfa: true, last: "1h ago", joined: "Mar 12, 2024", reports: 16 },
    { name: "Maged Gomaa", email: "maged@northstar", role: "Analyst", roleTone: "info", scope: "Greater Cairo", status: ["success", "Active"], mfa: false, last: "3h ago", joined: "Apr 05, 2024", reports: 0 },
    { name: "Yara Lotfy", email: "yara@northstar", role: "Viewer", roleTone: "neutral", scope: "Alexandria", status: ["success", "Active"], mfa: true, last: "1d ago", joined: "Apr 18, 2024", reports: 0 },
    { name: "Omar Fathy", email: "omar@northstar", role: "Store Manager", roleTone: "neutral", scope: "Maadi Grand", status: ["danger", "Locked"], mfa: true, last: "7d ago", joined: "Jan 28, 2024", reports: 14 },
    { name: "Hana Adel", email: "hana@northstar", role: "Store Staff", roleTone: "neutral", scope: "Smouha Center", status: ["warning", "Invited"], mfa: false, last: "invited", joined: "May 20, 2024", reports: 0 },
    { name: "Lina Shafik", email: "lina@northstar", role: "Analyst", roleTone: "info", scope: "Nile Delta", status: ["success", "Active"], mfa: true, last: "6h ago", joined: "May 25, 2024", reports: 0 },
  ];

  const [sel, setSel] = React.useState(users[0].email);
  const [tab, setTab] = React.useState("all");
  const u = users.find((x) => x.email === sel) || users[0];
  const ts = useTableState(users, {
    text: (x) => `${x.name} ${x.email} ${x.role} ${x.scope} ${x.status[1]}`,
    getId: (x) => x.email,
    sortAccessors: { user: (x) => x.name, role: (x) => x.role, scope: (x) => x.scope, status: (x) => x.status[1], mfa: (x) => (x.mfa ? 1 : 0), last: (x) => x.last },
  });

  const matrix = [
    { role: "Tenant Admin", full: 24, read: 0, custom: 0, none: 0 },
    { role: "Admin", full: 18, read: 12, custom: 4, none: 0 },
    { role: "Store Manager", full: 8, read: 20, custom: 10, none: 2 },
    { role: "Analyst", full: 2, read: 36, custom: 20, none: 10 },
    { role: "Viewer", full: 0, read: 28, custom: 6, none: 46 },
  ];

  return (
    <div>
      <PageHeader
        title="Users & Roles"
        subtitle={`Manage users, roles, permissions & access · ${scope.tenant}`}
        actions={<>
          <Button variant="secondary" iconStart={<Icon name="operators" size={16} />}>Bulk actions</Button>
          <Button variant="primary" iconStart={<Icon name="plus" size={16} />}>Invite user</Button>
        </>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 332px", gap: "var(--space-5)", marginBottom: "var(--space-6)", alignItems: "start" }}>
        <div style={{ minWidth: 0 }}>
          <Toolbar>
            <SearchInput placeholder="Search users by name, email or role…" value={ts.query} onChange={ts.setQuery} />
            <Button variant="secondary" iconStart={<Icon name="operators" size={15} />}>All roles</Button>
            <Button variant="secondary" iconStart={<Icon name="catalog" size={15} />}>More filters</Button>
          </Toolbar>
          <BulkBar count={ts.selected.size} actions={["Change role", "Reset password", "Deactivate", "Export"]} onClear={ts.clear} />
          <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", overflow: "hidden", background: "var(--color-surface)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: "var(--space-3)", background: "var(--color-surface-raised)", borderBottom: "1px solid var(--color-border)", width: "40px" }}><Checkbox checked={ts.allOn} indeterminate={ts.someOn} onChange={ts.toggleAll} /></th>
                  <SortHeader label="User" k="user" sort={ts.sort} onSort={ts.onSort} />
                  <SortHeader label="Role" k="role" sort={ts.sort} onSort={ts.onSort} />
                  <SortHeader label="Access scope" k="scope" sort={ts.sort} onSort={ts.onSort} />
                  <SortHeader label="Status" k="status" sort={ts.sort} onSort={ts.onSort} />
                  <SortHeader label="MFA" k="mfa" sort={ts.sort} onSort={ts.onSort} />
                  <SortHeader label="Last active" k="last" sort={ts.sort} onSort={ts.onSort} />
                </tr>
              </thead>
              <tbody>
                {ts.view.map((x, ri) => {
                  const on = x.email === sel;
                  const bd = ri < ts.view.length - 1 ? "1px solid var(--color-border)" : "none";
                  const checked = ts.selected.has(x.email);
                  return (
                    <tr key={x.email} onClick={() => setSel(x.email)} style={{ cursor: "pointer", background: on ? "var(--color-primary-subtle)" : checked ? "var(--color-surface-raised)" : "transparent" }}>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd }}><Checkbox checked={checked} onChange={() => ts.toggle(x.email)} /></td>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd, whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                          <Avatar name={x.name} />
                          <div>
                            <div style={{ font: "var(--type-label)" }}>{x.name}</div>
                            <div style={{ font: "var(--type-mono)", color: "var(--color-text-muted)" }}>{x.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd, whiteSpace: "nowrap" }}><Badge tone={x.roleTone} dot={false}>{x.role}</Badge></td>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd, color: "var(--color-text-muted)", font: "var(--type-body)", whiteSpace: "nowrap" }}>{x.scope}</td>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd, whiteSpace: "nowrap" }}><Badge tone={x.status[0]}>{x.status[1]}</Badge></td>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd, whiteSpace: "nowrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", font: "var(--type-caption)", color: x.mfa ? "var(--color-success-on)" : "var(--color-text-disabled)" }}>
                          <Icon name={x.mfa ? "check" : "alert"} size={14} strokeWidth={x.mfa ? 2.5 : 1.75} />{x.mfa ? "Enabled" : "Off"}
                        </span>
                      </td>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd, color: "var(--color-text-muted)", font: "var(--type-body)", whiteSpace: "nowrap" }}>{x.last}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pager page={1} pages={32} label={`Showing ${ts.view.length} of 256 users`} />
        </div>

        {/* Profile drawer */}
        <DetailDrawer title="User profile" onClose={null} footer={<div style={{ display: "grid", gap: "var(--space-2)" }}><Button variant="secondary" style={{ width: "100%" }}>Reset password</Button><Button variant="destructive" style={{ width: "100%" }}>{u.status[1] === "Locked" ? "Unlock account" : "Lock account"}</Button></div>}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
            <Avatar name={u.name} size={44} />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <span style={{ font: "var(--type-title)" }}>{u.name}</span>
                <Badge tone={u.status[0]}>{u.status[1]}</Badge>
              </div>
              <div style={{ font: "var(--type-mono)", color: "var(--color-text-muted)", marginTop: "2px" }}>{u.email}</div>
              <div style={{ marginTop: "6px" }}><Badge tone={u.roleTone} dot={false}>{u.role}</Badge></div>
            </div>
          </div>

          <KV k="Access scope" v={u.scope} />
          <KV k="MFA" v={u.mfa ? "Enabled" : "Not configured"} />
          <KV k="Direct reports" v={u.reports} mono />
          <KV k="Joined" v={u.joined} />
          <KV k="Last active" v={u.last} />

          <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "var(--space-4) 0 var(--space-2)" }}>Permissions summary</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
            {[["Full access", "24", "var(--color-success-on)"], ["Read only", "18", "var(--color-info-on)"], ["Custom", "7", "var(--color-warning-on)"], ["No access", "2", "var(--color-text-muted)"]].map(([k, v, c]) => (
              <div key={k} style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", background: "var(--color-surface-sunken)", padding: "var(--space-3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", font: "var(--type-caption)", color: "var(--color-text-muted)" }}><span style={{ width: "7px", height: "7px", borderRadius: "9999px", background: c }} />{k}</div>
                <div style={{ font: "700 18px/1.2 var(--font-sans)", fontVariantNumeric: "tabular-nums", marginTop: "2px" }}>{v}</div>
              </div>
            ))}
          </div>
        </DetailDrawer>
      </div>

      {/* Access / distribution / matrix row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1.2fr", gap: "var(--space-5)" }}>
        <Panel title="Access scope breakdown">
          <Donut segments={[
            { label: "All stores", value: 18, color: "var(--color-primary)" },
            { label: "Region", value: 72, color: "var(--color-accent)" },
            { label: "Store group", value: 96, color: "var(--color-info-on)" },
            { label: "Single store", value: 70, color: "var(--color-success-on)" },
          ]} />
        </Panel>
        <Panel title="Role distribution">
          <div>
            {[
              { label: "Tenant Admin", v: 18, c: "var(--color-primary)" },
              { label: "Admin", v: 34, c: "var(--color-accent)" },
              { label: "Store Manager", v: 56, c: "var(--color-info-on)" },
              { label: "Analyst", v: 68, c: "var(--color-success-on)" },
              { label: "Viewer", v: 80, c: "var(--color-text-muted)" },
            ].map((r) => <BarMeter key={r.label} label={r.label} value={r.v} max={80} count={r.v} pct={`${((r.v / 256) * 100).toFixed(1)}%`} color={r.c} />)}
          </div>
        </Panel>
        <Panel title="Role permission matrix" action={<a href="#" onClick={(e) => e.preventDefault()} style={{ font: "var(--type-caption)", color: "var(--color-accent)", textDecoration: "none", fontWeight: 600 }}>View full ›</a>}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Role", "Full", "Read", "Custom", "None"].map((h, i) => (
                  <th key={i} style={{ font: "600 var(--text-caption)/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", textAlign: i === 0 ? "left" : "right", padding: "var(--space-2) var(--space-2) var(--space-3)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((m, ri) => (
                <tr key={m.role}>
                  <td style={{ padding: "var(--space-2)", borderBottom: ri < matrix.length - 1 ? "1px solid var(--color-border)" : "none", font: "var(--type-label)", whiteSpace: "nowrap" }}>{m.role}</td>
                  {["full", "read", "custom", "none"].map((k) => (
                    <td key={k} style={{ padding: "var(--space-2)", borderBottom: ri < matrix.length - 1 ? "1px solid var(--color-border)" : "none", textAlign: "right", font: "var(--type-mono)", fontVariantNumeric: "tabular-nums", color: m[k] === 0 ? "var(--color-text-disabled)" : "var(--color-text)" }}>{m[k]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}

Object.assign(window, { Operators });
