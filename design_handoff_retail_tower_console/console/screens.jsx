/* Retail Tower Console — UI kit: screens.
 * Data-first surfaces. Tables over cards. No hero metrics above a table. */

const DSx = window.RetailTowerConsoleDesignSystem_b7c448;
const { Button, Badge, Icon, Card, CardHeader, Input, Field, Banner } = DSx;

function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
      <div>
        <h1 style={{ margin: "0 0 var(--space-2)", font: "var(--type-display)", letterSpacing: "var(--tracking-display)" }}>{title}</h1>
        {subtitle ? <p style={{ margin: 0, color: "var(--color-text-muted)", font: "var(--type-body)" }}>{subtitle}</p> : null}
      </div>
      {actions ? <div style={{ display: "flex", gap: "var(--space-2)", flexShrink: 0 }}>{actions}</div> : null}
    </div>
  );
}

/* Dense table — the core Console surface. */
function Table({ columns, rows }) {
  return (
    <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", overflow: "hidden", background: "var(--color-surface)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} style={{ font: "600 var(--text-caption)/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", textAlign: c.align === "right" ? "right" : "left", padding: "var(--space-3)", background: "var(--color-surface-raised)", borderBottom: "1px solid var(--color-border)", whiteSpace: "nowrap" }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <Row key={ri} columns={columns} row={r} last={ri === rows.length - 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Row({ columns, row, last }) {
  const [hover, setHover] = React.useState(false);
  return (
    <tr onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ background: hover ? "var(--color-surface-raised)" : "transparent" }}>
      {columns.map((c, i) => (
        <td key={i} style={{ padding: "var(--space-3)", borderBottom: last ? "none" : "1px solid var(--color-border)", textAlign: c.align === "right" ? "right" : "left", fontVariantNumeric: c.align === "right" ? "tabular-nums" : "normal", font: c.mono ? "var(--type-mono)" : "var(--type-body)", color: c.muted ? "var(--color-text-muted)" : "var(--color-text)", whiteSpace: "nowrap" }}>{c.render ? c.render(row) : row[c.key]}</td>
      ))}
    </tr>
  );
}

/* ---------------- Executive Overview ---------------- */
function Overview({ scope }) {
  const { KpiCard, ComboChart, Panel, ExceptionList, ActivityFeed } = window;
  const kpis = [
    { icon: "activity", tone: "primary", label: "Gross Sales (EGP)", value: "2,458,250", unit: "", delta: "18.6%", deltaDir: "up", sub: "vs prev 7d", spark: [310, 340, 420, 390, 460, 520, 612], sparkColor: "var(--color-accent)" },
    { icon: "audit", tone: "success", label: "Posted Transactions", value: "12,842", unit: "", delta: "16.3%", deltaDir: "up", sub: "to ERPNext", spark: [1600, 1720, 1810, 1750, 1980, 2040, 2145], sparkColor: "var(--color-success-on)" },
    { icon: "clock", tone: "warning", label: "Pending ERP Actions", value: "142", unit: "", delta: "8.2%", deltaDir: "down", sub: "outbox queue", spark: [210, 198, 176, 165, 158, 149, 142], sparkColor: "var(--color-warning-on)" },
    { icon: "unknown", tone: "info", label: "Unknown Items", value: "68", unit: "", delta: "5.6%", deltaDir: "down", sub: "awaiting triage", spark: [92, 88, 81, 79, 74, 70, 68], sparkColor: "var(--color-info-on)" },
    { icon: "stores", tone: "success", label: "Active Stores", value: "36", unit: "/ 42", delta: null, deltaDir: "up", sub: "85.7% online", spark: [34, 35, 33, 36, 35, 36, 36], sparkColor: "var(--color-success-on)" },
    { icon: "gauge", tone: "success", label: "System Health", value: "99.71", unit: "%", delta: "0.32pp", deltaDir: "up", sub: "all systems ok", spark: [99.3, 99.5, 99.2, 99.6, 99.5, 99.71, 99.7], sparkColor: "var(--color-success-on)" },
  ];

  const exceptions = [
    { icon: "alert", tone: "danger", title: "Sales failed to post to ERP", time: "12 invoices · 2m ago", count: 12 },
    { icon: "catalog", tone: "warning", title: "Low stock alerts", time: "23 items below minimum · 1h ago", count: 23 },
    { icon: "unknown", tone: "info", title: "Unknown items detected", time: "review & classify · 15m ago", count: 8 },
    { icon: "link", tone: "warning", title: "Data sync delays", time: "3 integrations delayed · 45m ago", count: 3 },
  ];

  const topStores = [
    { name: "Cairo Festival City", loc: "New Cairo", gross: "412,250", tx: "2,145", chg: "+24.8%", up: true, status: ["success", "Online"] },
    { name: "Mall of Egypt", loc: "6th of October", gross: "358,920", tx: "1,874", chg: "+18.3%", up: true, status: ["success", "Online"] },
    { name: "City Stars Heliopolis", loc: "Heliopolis", gross: "298,410", tx: "1,512", chg: "+12.6%", up: true, status: ["success", "Online"] },
    { name: "Maadi Grand", loc: "Maadi", gross: "245,600", tx: "1,243", chg: "+9.2%", up: true, status: ["success", "Online"] },
    { name: "Alexandria Corniche", loc: "Alexandria", gross: "198,330", tx: "1,021", chg: "-2.1%", up: false, status: ["warning", "Degraded"] },
  ];

  const activity = [
    { icon: "audit", text: "Sales invoice #INV-2026-06-000142 posted to ERPNext", meta: "Cairo Festival City · 2m ago", tone: "success", label: "Success" },
    { icon: "link", text: "Payment #PAY-000189 synced", meta: "Mall of Egypt · 3m ago", tone: "success", label: "Success" },
    { icon: "unknown", text: "Unknown item classified: “X-2458 Cable”", meta: "by Sara M. · 10m ago", tone: "info", label: "Info" },
    { icon: "catalog", text: "Price updated for 12 items", meta: "by Ahmed M. · 25m ago", tone: "success", label: "Success" },
    { icon: "stores", text: "Stock reconciled for Maadi Grand", meta: "by System · 45m ago", tone: "success", label: "Success" },
  ];

  const integrations = [
    { name: "ERPNext / Frappe", desc: "ERP / back office", tone: "success", label: "Healthy" },
    { name: "Data-Pulse-2", desc: "Data pipeline", tone: "success", label: "Healthy" },
    { name: "POS-Pulse", desc: "Point of sale", tone: "success", label: "Healthy" },
    { name: "ERPNext Connector", desc: "EDI / integration", tone: "success", label: "Healthy" },
    { name: "Frappe Orchestration", desc: "Workflow engine", tone: "warning", label: "Degraded" },
  ];
  const intMetrics = [["Outbox pending", "142"], ["Sync success", "99.71%"], ["Last sync", "2m ago"], ["ERP response", "210ms"]];

  const copilot = [
    { icon: "signal", tone: "info", title: "Demand spike predicted", body: "Smart reorder suggests increasing stock for 15 high-demand SKUs.", impact: "+12% sales potential", cta: "View details" },
    { icon: "alert", tone: "warning", title: "Price anomaly detected", body: "5 items have price mismatches across stores.", impact: "Margin leakage risk", cta: "Review now" },
  ];

  const roadmap = [
    { icon: "signal", title: "Forecasting", desc: "AI-powered sales forecasting", when: "Q3 2026" },
    { icon: "link", title: "Workflow automation", desc: "Automate approval & exception flows", when: "Q3 2026" },
    { icon: "audit", title: "Report builder", desc: "Drag & drop custom reports", when: "Q4 2026" },
    { icon: "catalog", title: "Price intelligence", desc: "Dynamic pricing recommendations", when: "Q4 2026" },
  ];
  const services = ["API", "Database", "Queue", "Workers", "Storage", "Cache"];

  return (
    <div>
      <PageHeader
        title="Executive Overview"
        subtitle={`Unified visibility across sales, operations & integrations · ${scope.tenant} · ${scope.store}`}
        actions={<>
          <Button variant="secondary" iconStart={<Icon name="clock" size={16} />}>Jun 1 – Jun 7</Button>
          <Button variant="ghost" iconStart={<Icon name="audit" size={16} />}>Export</Button>
        </>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr 1fr", gap: "var(--space-5)", marginBottom: "var(--space-6)" }}>
        <Panel
          title="Sales trend"
          action={<div style={{ display: "flex", gap: "var(--space-4)", font: "var(--type-caption)", color: "var(--color-text-muted)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--color-primary)" }} />Gross (EGP k)</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "2px", background: "var(--color-accent)" }} />Transactions</span>
          </div>}
        >
          <ComboChart labels={["May 28", "May 29", "May 30", "May 31", "Jun 1", "Jun 2", "Jun 3"]} bars={[520, 480, 760, 690, 540, 612, 700]} line={[1810, 1620, 2210, 2040, 1740, 2145, 2260]} barMax={900} lineMax={2600} />
        </Panel>
        <Panel title="Operational exceptions" action={<a href="#" onClick={(e) => e.preventDefault()} style={{ font: "var(--type-caption)", color: "var(--color-accent)", textDecoration: "none", fontWeight: 600 }}>View all (24) ›</a>}>
          <ExceptionList items={exceptions} />
        </Panel>
        <Panel title="Integration health" action={<a href="#" onClick={(e) => e.preventDefault()} style={{ font: "var(--type-caption)", color: "var(--color-accent)", textDecoration: "none", fontWeight: 600 }}>View all ›</a>}>
          <div style={{ display: "grid" }}>
            {integrations.map((it, i) => (
              <div key={it.name} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-2) 0", borderBottom: i < integrations.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "var(--type-label)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</div>
                  <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{it.desc}</div>
                </div>
                <Badge tone={it.tone} dot={true}>{it.label}</Badge>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
            {intMetrics.map(([k, v]) => (
              <div key={k} style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", background: "var(--color-surface-sunken)", padding: "var(--space-2) var(--space-3)" }}>
                <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{k}</div>
                <div style={{ font: "700 14px/1.2 var(--font-sans)", fontVariantNumeric: "tabular-nums", marginTop: "2px" }}>{v}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr 1fr", gap: "var(--space-5)", marginBottom: "var(--space-6)" }}>
        <div>
          <h2 style={{ font: "var(--type-headline)", letterSpacing: "var(--tracking-headline)", margin: "0 0 var(--space-3)" }}>Top store performance</h2>
          <Table
            columns={[
              { label: "Store", render: (r) => r.name },
              { label: "Location", muted: true, render: (r) => r.loc },
              { label: "Gross (EGP)", align: "right", mono: true, render: (r) => r.gross },
              { label: "Tx", align: "right", mono: true, muted: true, render: (r) => r.tx },
              { label: "vs LW", align: "right", render: (r) => <span style={{ color: r.up ? "var(--color-success-on)" : "var(--color-danger-on)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{r.chg}</span> },
              { label: "Status", render: (r) => <Badge tone={r.status[0]}>{r.status[1]}</Badge> },
            ]}
            rows={topStores}
          />
        </div>
        <div>
          <h2 style={{ font: "var(--type-headline)", letterSpacing: "var(--tracking-headline)", margin: "0 0 var(--space-3)" }}>Recent activity</h2>
          <Panel title="" style={{ paddingTop: "var(--space-2)" }}>
            <ActivityFeed items={activity} />
          </Panel>
        </div>
        <div>
          <h2 style={{ font: "var(--type-headline)", letterSpacing: "var(--tracking-headline)", margin: "0 0 var(--space-3)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>AI Copilot insights <Badge tone="info" dot={false}>Beta</Badge></h2>
          <div style={{ display: "grid", gap: "var(--space-3)" }}>
            {copilot.map((c) => (
              <div key={c.title} style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", padding: "var(--space-4)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                  <span style={{ width: "26px", height: "26px", borderRadius: "var(--radius-md)", display: "grid", placeItems: "center", flexShrink: 0, background: c.tone === "warning" ? "var(--color-warning-surface)" : "var(--color-info-surface)", color: c.tone === "warning" ? "var(--color-warning-on)" : "var(--color-info-on)" }}><Icon name={c.icon} size={15} /></span>
                  <span style={{ font: "var(--type-label)" }}>{c.title}</span>
                </div>
                <div style={{ font: "var(--type-body)", color: "var(--color-text-muted)", marginBottom: "var(--space-2)" }}>{c.body}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ font: "var(--type-caption)", color: c.tone === "warning" ? "var(--color-warning-on)" : "var(--color-info-on)", fontWeight: 600 }}>{c.impact}</span>
                  <a href="#" onClick={(e) => e.preventDefault()} style={{ font: "var(--type-label)", color: "var(--color-accent)", textDecoration: "none", fontWeight: 600 }}>{c.cta} ›</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: "var(--space-5)" }}>
        <div>
          <h2 style={{ font: "var(--type-headline)", letterSpacing: "var(--tracking-headline)", margin: "0 0 var(--space-3)" }}>Roadmap & future capabilities</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            {roadmap.map((r) => (
              <div key={r.title} style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", padding: "var(--space-4)", display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
                <span style={{ width: "34px", height: "34px", borderRadius: "var(--radius-md)", display: "grid", placeItems: "center", flexShrink: 0, background: "var(--color-primary-subtle)", color: "var(--color-accent)" }}><Icon name={r.icon} size={18} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-2)" }}>
                    <span style={{ font: "var(--type-label)" }}>{r.title}</span>
                    <span style={{ font: "600 var(--text-caption)/1 var(--font-mono)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-pill)", padding: "2px 8px", flexShrink: 0 }}>{r.when}</span>
                  </div>
                  <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "4px" }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 style={{ font: "var(--type-headline)", letterSpacing: "var(--tracking-headline)", margin: "0 0 var(--space-3)" }}>System status overview</h2>
          <Panel title="" style={{ paddingTop: "var(--space-4)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
              {services.map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-2) var(--space-3)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", background: "var(--color-surface-sunken)" }}>
                  <span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-pill)", background: "var(--color-success-surface)", color: "var(--color-success-on)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="check" size={12} strokeWidth={2.5} /></span>
                  <span style={{ flex: 1, font: "var(--type-label)" }}>{s}</span>
                  <span style={{ font: "var(--type-caption)", color: "var(--color-success-on)", fontWeight: 600 }}>Healthy</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Stores ---------------- */
function Stores() {
  const rows = [
    { name: "Cairo Festival City", code: "CFC-01", mgr: "Amal Saleh", staff: 18, status: ["success", "Active"] },
    { name: "Mall of Egypt", code: "MOE-02", mgr: "Karim Adel", staff: 22, status: ["success", "Active"] },
    { name: "City Stars Heliopolis", code: "CSH-03", mgr: "Nour Hassan", staff: 16, status: ["warning", "Provisioning"] },
    { name: "Maadi Grand", code: "MAD-04", mgr: "Omar Fathy", staff: 14, status: ["success", "Active"] },
    { name: "Alexandria Corniche", code: "ALX-05", mgr: "—", staff: 0, status: ["danger", "Suspended"] },
  ];
  return (
    <div>
      <PageHeader
        title="Stores & Tenants"
        subtitle="Provision and manage stores within this tenant"
        actions={<Button variant="primary" iconStart={<Icon name="plus" size={16} />}>New store</Button>}
      />
      <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)", maxWidth: "360px" }}>
        <Input placeholder="Filter stores…" />
        <Button variant="secondary">Filter</Button>
      </div>
      <Table
        columns={[
          { label: "Store", key: "name" },
          { label: "Code", mono: true, muted: true, render: (r) => r.code },
          { label: "Manager", key: "mgr", muted: true },
          { label: "Staff", align: "right", render: (r) => r.staff },
          { label: "Status", render: (r) => <Badge tone={r.status[0]}>{r.status[1]}</Badge> },
          { label: "", render: () => <Button variant="ghost" size="sm">Manage</Button> },
        ]}
        rows={rows}
      />
    </div>
  );
}

/* ---------------- Catalog ---------------- */
function Catalog() {
  const rows = [
    { sku: "PRD-49210", name: "Nescafé Gold 200g", cat: "Beverages", price: "EGP 189.00", status: ["success", "Listed"] },
    { sku: "PRD-49211", name: "Juhayna Full Cream 1L", cat: "Dairy", price: "EGP 42.50", status: ["success", "Listed"] },
    { sku: "PRD-49255", name: "Molto Croissant 60g", cat: "Bakery", price: "EGP 12.00", status: ["warning", "Price review"] },
    { sku: "PRD-49301", name: "Lipton Yellow 100s", cat: "Beverages", price: "EGP 96.00", status: ["success", "Listed"] },
    { sku: "PRD-49402", name: "Domty Feta 500g", cat: "Dairy", price: "EGP 78.00", status: ["danger", "Delisted"] },
  ];
  return (
    <div>
      <PageHeader
        title="Catalog & Inventory"
        subtitle="Tenant catalog · 12,408 SKUs"
        actions={<Button variant="primary" iconStart={<Icon name="plus" size={16} />}>Add item</Button>}
      />
      <Table
        columns={[
          { label: "SKU", mono: true, muted: true, render: (r) => r.sku },
          { label: "Name", key: "name" },
          { label: "Category", key: "cat", muted: true },
          { label: "Price", align: "right", mono: true, render: (r) => r.price },
          { label: "Status", render: (r) => <Badge tone={r.status[0]}>{r.status[1]}</Badge> },
        ]}
        rows={rows}
      />
    </div>
  );
}

/* ---------------- Operators ---------------- */
function Operators() {
  const rows = [
    { name: "Amal Saleh", email: "amal@northstar", role: "Tenant Admin", roleTone: "info", last: "2m ago" },
    { name: "Karim Adel", email: "karim@northstar", role: "Store Manager", roleTone: "neutral", last: "18m ago" },
    { name: "Nour Hassan", email: "nour@northstar", role: "Store Manager", roleTone: "neutral", last: "1h ago" },
    { name: "Omar Fathy", email: "omar@northstar", role: "Store Staff", roleTone: "neutral", last: "yesterday" },
    { name: "Yasmin Tarek", email: "yasmin@northstar", role: "Store Staff", roleTone: "warning", last: "invited" },
  ];
  return (
    <div>
      <PageHeader
        title="Users & Roles"
        subtitle="Staff and roles within this tenant"
        actions={<Button variant="primary" iconStart={<Icon name="plus" size={16} />}>Invite operator</Button>}
      />
      <Table
        columns={[
          { label: "Name", key: "name" },
          { label: "Email", mono: true, muted: true, render: (r) => r.email },
          { label: "Role", render: (r) => <Badge tone={r.roleTone} dot={false}>{r.role}</Badge> },
          { label: "Last active", muted: true, render: (r) => r.last },
          { label: "", render: () => <Button variant="ghost" size="sm">Edit</Button> },
        ]}
        rows={rows}
      />
    </div>
  );
}

/* ---------------- Audit ---------------- */
function Audit({ scope }) {
  const rows = [
    { t: "21:04:12", a: "auth.signin", who: "ops@qanater", target: "session", store: "Branch 04", req: "a91f…3d", tag: null },
    { t: "20:58:39", a: "shift.forced_close", who: "mgr@qanater", target: "shift · 7b21", store: "Branch 04", req: "c2e0…11", tag: ["danger", "forced"] },
    { t: "20:55:02", a: "operator.session.takeover", who: "mgr@qanater", target: "session · 4a9c", store: "Branch 04", req: "d7b1…90", tag: ["info", "POS"] },
    { t: "20:41:55", a: "cashier.pin.reset", who: "sup@qanater", target: "cashier · 22f0", store: "Branch 04", req: "f019…ab", tag: ["info", "POS"] },
    { t: "19:30:18", a: "shift.open", who: "ops@qanater", target: "shift · 7b21", store: "Branch 04", req: "8c34…07", tag: null },
  ];
  return (
    <div>
      <PageHeader title="Audit Logs" subtitle={`Activity for ${scope.tenant} · ${scope.store}`} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)", alignItems: "flex-end", padding: "var(--space-3)", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", marginBottom: "var(--space-4)" }}>
        <Field label="Action" style={{ width: "150px" }}><Input placeholder="shift." /></Field>
        <Field label="Actor" style={{ width: "160px" }}><Input placeholder="user id" /></Field>
        <Field label="From" style={{ width: "180px" }}><Input type="datetime-local" /></Field>
        <Field label="To" style={{ width: "180px" }}><Input type="datetime-local" /></Field>
        <Button variant="primary">Apply</Button>
        <Button variant="ghost">Clear</Button>
      </div>
      <Table
        columns={[
          { label: "Time", align: "right", mono: true, render: (r) => r.t },
          { label: "Action", mono: true, render: (r) => (<span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>{r.a}{r.tag ? <Badge tone={r.tag[0]} dot={false}>{r.tag[1]}</Badge> : null}</span>) },
          { label: "Actor", muted: true, render: (r) => r.who },
          { label: "Target", muted: true, render: (r) => r.target },
          { label: "Store", muted: true, render: (r) => r.store },
          { label: "Req", mono: true, muted: true, render: (r) => r.req },
          { label: "", render: () => <Button variant="ghost" size="sm">Inspect</Button> },
        ]}
        rows={rows}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) 0", color: "var(--color-text-muted)", font: "var(--type-label)" }}>
        <Button variant="secondary" size="sm">Load more</Button>
        <span>showing 5</span>
      </div>
    </div>
  );
}

Object.assign(window, { PageHeader, Table, Overview, Stores, Catalog, Operators, Audit });
