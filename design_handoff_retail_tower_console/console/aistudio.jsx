/* Retail Tower Console — UI kit: AI Studio.
 * Forecasting, scenario planning, copilot insights & workflow automation. */

const DSai = window.RetailTowerConsoleDesignSystem_b7c448;

function AiStudio({ scope }) {
  const { Button, Badge, Icon, Input } = DSai;
  const { KpiCard, LineChart, Panel } = window;
  const Table = window.Table, PageHeader = window.PageHeader;
  const chip = (tone) => ({
    info: ["var(--color-info-surface)", "var(--color-info-on)"],
    success: ["var(--color-success-surface)", "var(--color-success-on)"],
    warning: ["var(--color-warning-surface)", "var(--color-warning-on)"],
    danger: ["var(--color-danger-surface)", "var(--color-danger-on)"],
    primary: ["var(--color-primary-subtle)", "var(--color-accent)"],
  }[tone] || ["var(--color-surface-raised)", "var(--color-text-muted)"]);

  const kpis = [
    { icon: "gauge", tone: "primary", label: "Forecast Accuracy", value: "94.2", unit: "%", delta: "3.6%", deltaDir: "up", sub: "vs prev 7d", spark: [88, 89, 90, 91, 92, 93, 94], sparkColor: "var(--color-accent)" },
    { icon: "signal", tone: "success", label: "Automated Workflows", value: "128", unit: "", delta: "18.4%", deltaDir: "up", sub: "vs prev 7d", spark: [98, 104, 110, 116, 120, 124, 128], sparkColor: "var(--color-success-on)" },
    { icon: "check", tone: "info", label: "AI Recs Accepted", value: "82.3", unit: "%", delta: "5.7%", deltaDir: "up", sub: "acceptance rate", spark: [72, 74, 76, 78, 80, 81, 82], sparkColor: "var(--color-info-on)" },
    { icon: "alert", tone: "warning", label: "Demand Risk Alerts", value: "18", unit: "", delta: "12.5%", deltaDir: "down", sub: "fewer vs 7d", spark: [28, 26, 24, 22, 20, 19, 18], sparkColor: "var(--color-warning-on)" },
    { icon: "audit", tone: "success", label: "Scheduled Reports", value: "46", unit: "", delta: "9.1%", deltaDir: "up", sub: "vs prev 7d", spark: [38, 40, 41, 43, 44, 45, 46], sparkColor: "var(--color-success-on)" },
    { icon: "activity", tone: "primary", label: "Automation Health", value: "99.2", unit: "%", delta: "1.8pp", deltaDir: "up", sub: "all flows ok", spark: [97, 98, 98.5, 99, 99.1, 99.2, 99.2], sparkColor: "var(--color-accent)" },
  ];

  const labels = ["May 29", "May 30", "May 31", "Jun 1", "Jun 2", "Jun 3", "Jun 4", "Jun 5", "Jun 6", "Jun 7", "Jun 8", "Jun 9"];
  const actual = [250, 360, 470, 500, 505, null, null, null, null, null, null, null];
  const forecast = [null, null, null, null, 505, 520, 560, 600, 640, 660, 690, 700];
  const upper = [255, 365, 475, 505, 515, 560, 615, 670, 715, 745, 780, 795];
  const lower = [245, 355, 465, 495, 495, 490, 515, 540, 575, 590, 615, 625];

  const scenarios = [
    { icon: "audit", tone: "info", name: "Base Case", sub: "Current forecast", val: "EGP 2.48M", delta: "—", up: null },
    { icon: "activity", tone: "success", name: "Marketing Boost", sub: "+20% campaign spend", val: "EGP 2.91M", delta: "+17.3%", up: true },
    { icon: "gauge", tone: "primary", name: "Price Increase", sub: "+5% average price", val: "EGP 2.63M", delta: "+6.0%", up: true },
    { icon: "alert", tone: "danger", name: "Supply Constraint", sub: "-15% supply availability", val: "EGP 2.12M", delta: "-14.5%", up: false },
  ];

  const insights = [
    "Demand is expected to increase 8.7% driven by seasonal trends.",
    "High risk of stockouts in 23 SKUs across 7 stores.",
    "Price elasticity suggests a 3–5% price increase is optimal.",
    "Consider reallocating inventory from Cairo Festival City to Maadi.",
  ];

  const replenish = [
    { sku: "SKU-10293", store: "Cairo Festival City", action: "Increase Order", qty: "+1,240", impact: ["danger", "High"] },
    { sku: "SKU-88321", store: "Maadi Grand", action: "Transfer In", qty: "+850", impact: ["warning", "Medium"] },
    { sku: "SKU-55120", store: "City Stars", action: "Expedite Order", qty: "+620", impact: ["danger", "High"] },
    { sku: "SKU-77211", store: "Alexandria", action: "No Action", qty: "—", impact: ["success", "Low"] },
  ];

  const flow = [
    { icon: "alert", tone: "warning", k: "Trigger", v: "Low Stock Alert" },
    { icon: "gauge", tone: "info", k: "Condition", v: "Stock < Reorder Pt" },
    { icon: "catalog", tone: "primary", k: "Action", v: "Create PO" },
    { icon: "bell", tone: "success", k: "Notify", v: "Category Buyer" },
  ];

  return (
    <div>
      <PageHeader
        title="AI Studio"
        subtitle={`Harness AI to optimize retail operations, predict outcomes & drive growth · ${scope.tenant}`}
        actions={<>
          <Badge tone="info" dot={false}>Beta</Badge>
          <Button variant="secondary" iconStart={<Icon name="clock" size={16} />}>Jun 1 – Jun 7</Button>
        </>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "var(--space-5)", marginBottom: "var(--space-6)", alignItems: "start" }}>
        <Panel
          title="AI forecasting"
          action={<div style={{ display: "flex", gap: "var(--space-4)", font: "var(--type-caption)", color: "var(--color-text-muted)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "2px", background: "var(--color-accent)" }} />Actual</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "2px", background: "var(--color-info-on)", borderTop: "2px dashed" }} />Forecast</span>
          </div>}
        >
          <LineChart labels={labels} series={[{ values: actual, color: "var(--color-accent)" }, { values: forecast, color: "var(--color-info-on)", dashed: true }]} band={{ upper, lower, color: "var(--color-accent)" }} yMax={850} />
          <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "var(--space-2)" }}>Demand forecast (EGP k) with 90% confidence interval.</div>
        </Panel>

        <Panel title="Scenario planning">
          <div style={{ display: "grid", gap: "var(--space-1)" }}>
            {scenarios.map((s) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) 0", borderBottom: "1px solid var(--color-border)" }}>
                <span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-md)", background: chip(s.tone)[0], color: chip(s.tone)[1], display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name={s.icon} size={16} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "var(--type-label)" }}>{s.name}</div>
                  <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{s.sub}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ font: "600 var(--text-body)/1 var(--font-sans)", fontVariantNumeric: "tabular-nums" }}>{s.val}</div>
                  <div style={{ font: "var(--type-caption)", color: s.up == null ? "var(--color-text-muted)" : s.up ? "var(--color-success-on)" : "var(--color-danger-on)", fontWeight: 600 }}>{s.delta}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="AI Copilot">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "var(--space-3)" }}>
            <span style={{ maxWidth: "85%", background: "var(--color-primary)", color: "#fff", padding: "var(--space-2) var(--space-3)", borderRadius: "12px 12px 2px 12px", font: "var(--type-body)" }}>What insights can you provide about this week's demand trends and risks?</span>
          </div>
          <div style={{ background: "var(--color-surface-raised)", borderRadius: "12px 12px 12px 2px", padding: "var(--space-3)", marginBottom: "var(--space-3)" }}>
            <div style={{ font: "var(--type-label)", marginBottom: "var(--space-2)" }}>Key insights for Jun 1 – Jun 7:</div>
            <ul style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "6px" }}>
              {insights.map((t, i) => <li key={i} style={{ font: "var(--type-body)", color: "var(--color-text)" }}>{t}</li>)}
            </ul>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
            {["Show at-risk SKUs", "Optimize inventory", "Run scenario"].map((c) => (
              <span key={c} style={{ padding: "4px 10px", borderRadius: "var(--radius-pill)", border: "1px solid var(--color-border-strong)", font: "var(--type-label)", color: "var(--color-text-muted)", cursor: "pointer" }}>{c}</span>
            ))}
          </div>
          <div style={{ position: "relative" }}>
            <Input placeholder="Ask anything…" style={{ paddingRight: "44px" }} />
            <span style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", width: "28px", height: "28px", borderRadius: "var(--radius-md)", background: "var(--color-primary)", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="signal" size={15} /></span>
          </div>
          <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "var(--space-2)" }}>AI responses may include predictions and should be reviewed.</div>
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "var(--space-5)" }}>
        <div>
          <h2 style={{ font: "var(--type-headline)", letterSpacing: "var(--tracking-headline)", margin: "0 0 var(--space-3)" }}>Replenishment recommendations</h2>
          <Table
            columns={[
              { label: "SKU", mono: true, render: (r) => r.sku },
              { label: "Store", muted: true, render: (r) => r.store },
              { label: "Recommended action", render: (r) => r.action },
              { label: "Qty", align: "right", mono: true, render: (r) => r.qty },
              { label: "Impact", render: (r) => <Badge tone={r.impact[0]} dot={false}>{r.impact[1]}</Badge> },
            ]}
            rows={replenish}
          />
        </div>
        <div>
          <h2 style={{ font: "var(--type-headline)", letterSpacing: "var(--tracking-headline)", margin: "0 0 var(--space-3)" }}>Workflow automation builder</h2>
          <Panel title="">
            <div style={{ display: "flex", alignItems: "stretch", gap: "var(--space-2)", marginBottom: "var(--space-5)" }}>
              {flow.map((f, i) => (
                <React.Fragment key={f.k}>
                  <div style={{ flex: 1, border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", background: "var(--color-surface-raised)", padding: "var(--space-3)", textAlign: "center" }}>
                    <span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-md)", background: chip(f.tone)[0], color: chip(f.tone)[1], display: "grid", placeItems: "center", margin: "0 auto var(--space-2)" }}><Icon name={f.icon} size={16} /></span>
                    <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{f.k}</div>
                    <div style={{ font: "var(--type-label)", marginTop: "2px" }}>{f.v}</div>
                  </div>
                  {i < flow.length - 1 ? <span style={{ display: "flex", alignItems: "center", color: "var(--color-text-disabled)" }}>→</span> : null}
                </React.Fragment>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-3)", borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-4)" }}>
              {[["Active Workflows", "128"], ["Success Rate", "98.7%"], ["Runs (7d)", "1,842"], ["Avg. Time Saved", "24.6 hrs"]].map(([k, v]) => (
                <div key={k}>
                  <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{k}</div>
                  <div style={{ font: "700 18px/1.2 var(--font-sans)", fontVariantNumeric: "tabular-nums", marginTop: "2px" }}>{v}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AiStudio });
