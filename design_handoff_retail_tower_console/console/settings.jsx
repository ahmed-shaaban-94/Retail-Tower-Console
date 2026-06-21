/* Retail Tower Console — UI kit: Settings & Integrations.
 * Configure system settings, manage integrations, control connectivity. */

const DSset = window.RetailTowerConsoleDesignSystem_b7c448;

function Switch({ on, onToggle }) {
  return (
    <button type="button" onClick={onToggle} aria-pressed={on} style={{ width: "38px", height: "22px", borderRadius: "9999px", border: "none", cursor: "pointer", padding: 0, background: on ? "var(--color-primary)" : "var(--color-border-strong)", position: "relative", transition: "background-color var(--duration-2) var(--ease-out)" }}>
      <span style={{ position: "absolute", top: "2px", left: on ? "18px" : "2px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", transition: "left var(--duration-2) var(--ease-out)" }} />
    </button>
  );
}

function FormSelect({ label, value, options }) {
  return (
    <label style={{ display: "grid", gap: "var(--space-2)" }}>
      <span style={{ font: "var(--type-label)", color: "var(--color-text-muted)" }}>{label}</span>
      <div style={{ position: "relative" }}>
        <select defaultValue={value} style={{ width: "100%", height: "var(--control-h)", padding: "0 32px 0 var(--space-3)", background: "var(--color-surface-sunken)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-control)", color: "var(--color-text)", font: "var(--type-body)", appearance: "none", cursor: "pointer" }}>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }}><DSset.Icon name="chevron" size={14} /></span>
      </div>
    </label>
  );
}

function Settings({ scope }) {
  const { Button, Badge, Icon, Input, Field } = DSset;
  const { KpiCard, Panel } = window;
  const PageHeader = window.PageHeader;
  const [sel, setSel] = React.useState("ERPNext");
  const [tab, setTab] = React.useState("Integrations");
  const [ssl, setSsl] = React.useState(true);
  const [delta, setDelta] = React.useState(true);
  const [softDelete, setSoftDelete] = React.useState(false);
  const [compress, setCompress] = React.useState(false);

  const kpis = [
    { icon: "link", tone: "primary", label: "Connected Integrations", value: "8", unit: "", delta: null, deltaDir: "up", sub: "+1 new this week", spark: [6, 6, 7, 7, 7, 8, 8], sparkColor: "var(--color-accent)" },
    { icon: "gauge", tone: "success", label: "Sync Success Rate", value: "99.71", unit: "%", delta: "0.32pp", deltaDir: "up", sub: "vs prev 7d", spark: [99.2, 99.4, 99.1, 99.6, 99.5, 99.71, 99.7], sparkColor: "var(--color-success-on)" },
    { icon: "check", tone: "success", label: "Environment", value: "Healthy", unit: "", delta: null, deltaDir: "up", sub: "all systems ok", spark: [1, 1, 1, 1, 1, 1, 1], sparkColor: "var(--color-success-on)" },
    { icon: "signal", tone: "info", label: "Active Webhooks", value: "12", unit: "", delta: null, deltaDir: "up", sub: "+2 vs last week", spark: [9, 10, 10, 11, 11, 12, 12], sparkColor: "var(--color-info-on)" },
    { icon: "operators", tone: "success", label: "SSO Status", value: "Enabled", unit: "", delta: null, deltaDir: "up", sub: "SAML SSO active", spark: [1, 1, 1, 1, 1, 1, 1], sparkColor: "var(--color-success-on)" },
    { icon: "alert", tone: "warning", label: "Alert Policies", value: "23", unit: "", delta: null, deltaDir: "up", sub: "2 critical, 5 warning", spark: [18, 19, 20, 21, 22, 23, 23], sparkColor: "var(--color-warning-on)" },
  ];

  const tabs = ["Integrations", "System Configuration", "Notifications", "Security & Access", "Data Management", "Localization", "Audit & Logs", "Advanced"];

  const catalog = [
    { name: "ERPNext", cat: "ERP / Back Office", icon: "audit", status: "Connected", sync: "2m ago" },
    { name: "POS-Pulse", cat: "Point of Sale", icon: "gauge", status: "Connected", sync: "3m ago" },
    { name: "Data-Pulse-2", cat: "Data Pipeline", icon: "signal", status: "Connected", sync: "1m ago" },
    { name: "Retail-Tower-Console", cat: "Core Platform", icon: "tower", status: "Connected", sync: "1m ago" },
    { name: "ERPNext Connector", cat: "EDI / Integration", icon: "link", status: "Connected", sync: "15m ago" },
    { name: "Frappe Orchestration", cat: "Workflow Engine", icon: "server", status: "Connected", sync: "8m ago" },
    { name: "Shopify (Sandbox)", cat: "E-Commerce", icon: "catalog", status: "Disconnected", sync: "—" },
    { name: "Google BigQuery", cat: "Analytics Warehouse", icon: "database", status: "Connected", sync: "1h ago" },
  ];

  const entities = ["Sales Orders", "Purchase Orders", "Items", "Customers", "Suppliers", "Stock Ledger", "GL Entries"];
  const manage = [
    { icon: "link", title: "Webhooks", desc: "Manage endpoints & event subscriptions", stat: "12 active", meta: "delivered 2m ago" },
    { icon: "operators", title: "API Clients", desc: "Manage API keys & client apps", stat: "7 active", meta: "used 5m ago" },
    { icon: "database", title: "Data Mapping", desc: "Field mappings & transformations", stat: "36 mappings", meta: "updated 1d ago" },
    { icon: "clock", title: "Sync History", desc: "Recent sync runs & results", stat: "2m ago", meta: "last run · success" },
  ];

  return (
    <div>
      <PageHeader
        title="Settings & Integrations"
        subtitle={`Configure system settings, manage integrations & control how the Console connects · ${scope.tenant}`}
        actions={<Button variant="secondary" iconStart={<Icon name="settings" size={16} />}>Add integration</Button>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <div style={{ display: "flex", gap: "var(--space-1)", borderBottom: "1px solid var(--color-border)", marginBottom: "var(--space-5)", overflowX: "auto" }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "var(--space-3)", borderBottom: `2px solid ${tab === t ? "var(--color-accent)" : "transparent"}`, color: tab === t ? "var(--color-text)" : "var(--color-text-muted)", font: "var(--type-label)", whiteSpace: "nowrap" }}>{t}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "var(--space-5)", marginBottom: "var(--space-6)", alignItems: "start" }}>
        {/* catalog */}
        <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", overflow: "hidden" }}>
          <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--color-border)" }}>
            <div style={{ font: "var(--type-title)" }}>Integration catalog</div>
            <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>Connect & manage external systems</div>
          </div>
          {catalog.map((c) => {
            const active = c.name === sel;
            const conn = c.status === "Connected";
            return (
              <button key={c.name} onClick={() => setSel(c.name)} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", width: "100%", textAlign: "left", padding: "var(--space-3) var(--space-4)", border: "none", borderBottom: "1px solid var(--color-border)", cursor: "pointer", background: active ? "var(--color-primary-subtle)" : "transparent" }}>
                <span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-md)", background: "var(--color-surface-raised)", color: "var(--color-text-muted)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name={c.icon} size={16} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "var(--type-label)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                  <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{c.cat}</div>
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", font: "var(--type-caption)", color: conn ? "var(--color-success-on)" : "var(--color-danger-on)", flexShrink: 0 }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "9999px", background: "currentColor" }} />{c.status}
                </span>
              </button>
            );
          })}
        </div>

        {/* config */}
        <Panel title={`${sel} configuration`} action={<Button variant="secondary" size="sm" iconStart={<Icon name="link" size={15} />}>Test connection</Button>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
            <Field label="Integration name"><Input defaultValue={sel} /></Field>
            <Field label="Category"><Input defaultValue="ERP / Back Office" /></Field>
            <FormSelect label="Connection status" value="Connected" options={["Connected", "Paused", "Disconnected"]} />
            <Field label="Base URL"><Input defaultValue="https://erp.northstar.eg" /></Field>
            <FormSelect label="API version" value="v15" options={["v15", "v14", "v13"]} />
            <FormSelect label="Region" value="Middle East (ME)" options={["Middle East (ME)", "Europe (EU)", "US East"]} />
            <FormSelect label="Auth type" value="API Key" options={["API Key", "OAuth 2.0", "Basic"]} />
            <Field label="API key"><Input type="password" defaultValue="REDACTED_PLACEHOLDER" /></Field>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <span style={{ font: "var(--type-label)", color: "var(--color-text-muted)" }}>Verify SSL</span>
              <div style={{ height: "var(--control-h)", display: "flex", alignItems: "center" }}><Switch on={ssl} onToggle={() => setSsl((v) => !v)} /></div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-4)", marginBottom: "var(--space-4)" }}>
            <div style={{ font: "var(--type-label)", marginBottom: "var(--space-3)" }}>Sync settings</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-4)" }}>
              <FormSelect label="Sync frequency" value="Every 5 minutes" options={["Every 5 minutes", "Every 15 minutes", "Hourly", "Daily"]} />
              <FormSelect label="Data scope" value="All stores" options={["All stores", "Active stores", "Selected"]} />
              <Field label="Batch size"><Input defaultValue="1000" /></Field>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-4)", marginBottom: "var(--space-4)" }}>
            <div style={{ font: "var(--type-label)", marginBottom: "var(--space-3)" }}>Data entities</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
              {entities.map((e) => (
                <span key={e} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "var(--radius-pill)", background: "var(--color-surface-raised)", font: "var(--type-label)", color: "var(--color-text)" }}>{e}<span style={{ color: "var(--color-text-muted)", cursor: "pointer" }}>×</span></span>
              ))}
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "var(--radius-pill)", border: "1px dashed var(--color-border-strong)", font: "var(--type-label)", color: "var(--color-text-muted)", cursor: "pointer" }}>+3 more</span>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-4)", marginBottom: "var(--space-5)" }}>
            <div style={{ font: "var(--type-label)", marginBottom: "var(--space-3)" }}>Advanced options</div>
            <div style={{ display: "flex", gap: "var(--space-6)", flexWrap: "wrap" }}>
              {[["Delta sync", delta, () => setDelta((v) => !v)], ["Soft delete sync", softDelete, () => setSoftDelete((v) => !v)], ["Compress payload", compress, () => setCompress((v) => !v)]].map(([l, v, fn]) => (
                <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", font: "var(--type-body)" }}><Switch on={v} onToggle={fn} />{l}</span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <Button variant="primary">Save changes</Button>
            <Button variant="secondary">Discard</Button>
            <div style={{ flex: 1 }} />
            <Button variant="ghost">View logs</Button>
            <Button variant="destructive">Disconnect</Button>
          </div>
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)" }}>
        {manage.map((m) => (
          <div key={m.title} style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", padding: "var(--space-4)" }}>
            <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-md)", background: "var(--color-surface-raised)", color: "var(--color-text-muted)", display: "grid", placeItems: "center", marginBottom: "var(--space-3)" }}><Icon name={m.icon} size={18} /></span>
            <div style={{ font: "var(--type-title)" }}>{m.title}</div>
            <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginBottom: "var(--space-3)" }}>{m.desc}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ font: "var(--type-label)" }}>{m.stat}</span>
              <span style={{ font: "var(--type-caption)", color: "var(--color-accent)", cursor: "pointer" }}>Manage →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Settings });
