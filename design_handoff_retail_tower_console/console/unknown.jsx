/* Retail Tower Console — UI kit: Unknown Items Review.
 * Resolve unidentified products using AI suggestions, rules & expert input. */

const DSun = window.RetailTowerConsoleDesignSystem_b7c448;

function Avatar({ name }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
      <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--color-primary)", color: "#fff", display: "grid", placeItems: "center", font: "700 10px/1 var(--font-sans)", flexShrink: 0 }}>{initials}</span>
      <span>{name}</span>
    </span>
  );
}

function Thumb({ size = 40 }) {
  return (
    <span style={{ width: `${size}px`, height: `${size}px`, borderRadius: "var(--radius-md)", background: "var(--color-surface-sunken)", border: "1px solid var(--color-border)", color: "var(--color-text-disabled)", display: "grid", placeItems: "center", flexShrink: 0 }}>
      <DSun.Icon name="unknown" size={size * 0.5} />
    </span>
  );
}

function UnknownItems({ scope }) {
  const { Button, Badge, Icon } = DSun;
  const { KpiCard, Panel } = window;
  const PageHeader = window.PageHeader;
  const [tab, setTab] = React.useState("All");

  const kpis = [
    { icon: "unknown", tone: "info", label: "Unresolved Items", value: "2,458", unit: "", delta: "18.6%", deltaDir: "up", sub: "vs prev 7d", spark: [1800, 1950, 2100, 2050, 2300, 2400, 2458], sparkColor: "var(--color-info-on)" },
    { icon: "check", tone: "success", label: "High-Confidence Matches", value: "1,245", unit: "", delta: "15.3%", deltaDir: "up", sub: "≥ 85% match", spark: [900, 980, 1040, 1100, 1180, 1220, 1245], sparkColor: "var(--color-success-on)" },
    { icon: "operators", tone: "primary", label: "Assigned Reviewers", value: "18", unit: "", delta: null, deltaDir: "up", sub: "across 6 stores", spark: [16, 17, 16, 18, 17, 18, 18], sparkColor: "var(--color-accent)" },
    { icon: "clock", tone: "warning", label: "Avg. Resolution Time", value: "2h 42m", unit: "", delta: "8.5%", deltaDir: "down", sub: "faster vs 7d", spark: [200, 195, 188, 182, 176, 170, 162], sparkColor: "var(--color-warning-on)" },
    { icon: "gauge", tone: "success", label: "Rules Coverage", value: "68.7", unit: "%", delta: "6.2pp", deltaDir: "up", sub: "auto-classified", spark: [58, 60, 62, 64, 66, 68, 68.7], sparkColor: "var(--color-success-on)" },
  ];

  const tabs = [["All", "2,458"], ["High Confidence", "1,245"], ["Needs Review", "876"], ["Low Confidence", "213"], ["Escalated", "124"]];

  const items = [
    { barcode: "632947562931", store: "Cairo Festival City", cat: "Beverages", catColor: "var(--color-accent)", conf: 92, band: ["success", "High"], who: "Sara Mahmoud", det: "Jun 7 · 10:42", age: "2h 15m" },
    { barcode: "187293648729", store: "Mall of Egypt", cat: "Snacks", catColor: "var(--color-success-on)", conf: 78, band: ["success", "High"], who: "Ahmed Adel", det: "Jun 7 · 09:18", age: "3h 39m" },
    { barcode: "590123847561", store: "City Stars", cat: "Household", catColor: "var(--color-warning-on)", conf: 42, band: ["warning", "Review"], who: "Emad Fawzy", det: "Jun 7 · 08:05", age: "4h 52m" },
    { barcode: "720495612387", store: "Maadi Grand", cat: "Personal Care", catColor: "var(--color-info-on)", conf: 25, band: ["danger", "Low"], who: "Mona Bakr", det: "Jun 7 · 07:21", age: "5h 36m" },
    { barcode: "389475612093", store: "Cairo Festival City", cat: "Dairy", catColor: "var(--color-accent)", conf: 89, band: ["success", "High"], who: "Sara Mahmoud", det: "Jun 7 · 06:44", age: "6h 13m" },
    { barcode: "104857362910", store: "Alexandria", cat: "Beverages", catColor: "var(--color-accent)", conf: 65, band: ["warning", "Review"], who: "Dina Wael", det: "Jun 7 · 06:02", age: "6h 55m" },
  ];

  const matches = [
    { name: "Almarai Fresh Milk 1L", meta: "Beverages · Milk · SKU 1002345", pct: 96 },
    { name: "Almarai Fresh Milk 500ml", meta: "Beverages · Milk · SKU 1002346", pct: 89 },
    { name: "Juhayna Full Cream 1L", meta: "Beverages · Milk · SKU 1003154", pct: 82 },
  ];

  const detail = ([k, v]) => (
    <div key={k} style={{ display: "grid", gridTemplateColumns: "84px 1fr", gap: "var(--space-2)", padding: "var(--space-1) 0", font: "var(--type-body)" }}>
      <span style={{ color: "var(--color-text-muted)" }}>{k}</span>
      <span>{v}</span>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Unknown Items Review"
        subtitle={`Resolve unidentified products using AI suggestions, rules & expert input · ${scope.tenant}`}
        actions={<>
          <Button variant="secondary" iconStart={<Icon name="catalog" size={16} />}>Filters</Button>
          <Button variant="primary" iconStart={<Icon name="plus" size={16} />}>Add rule</Button>
        </>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "var(--space-5)", alignItems: "start" }}>
        <div>
          {/* tabs */}
          <div style={{ display: "flex", gap: "var(--space-1)", borderBottom: "1px solid var(--color-border)", marginBottom: "var(--space-4)", overflowX: "auto" }}>
            {tabs.map(([name, count]) => (
              <button key={name} onClick={() => setTab(name)} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "transparent", border: "none", cursor: "pointer", padding: "var(--space-3) var(--space-3)", borderBottom: `2px solid ${tab === name ? "var(--color-accent)" : "transparent"}`, color: tab === name ? "var(--color-text)" : "var(--color-text-muted)", font: "var(--type-label)", whiteSpace: "nowrap" }}>
                {name} <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{count}</span>
              </button>
            ))}
          </div>
          <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", overflow: "hidden", background: "var(--color-surface)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Item", "Source", "Category", "Confidence", "Assignee", "Age"].map((h) => (
                    <th key={h} style={{ font: "600 var(--text-caption)/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", textAlign: "left", padding: "var(--space-3)", background: "var(--color-surface-raised)", borderBottom: "1px solid var(--color-border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} style={{ background: i === 0 ? "var(--color-primary-subtle)" : "transparent" }}>
                    <td style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-3)" }}>
                        <Thumb />
                        <span>
                          <div style={{ font: "var(--type-label)" }}>Unidentified Item</div>
                          <div style={{ font: "var(--type-mono)", color: "var(--color-text-muted)" }}>{it.barcode}</div>
                        </span>
                      </span>
                    </td>
                    <td style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)", font: "var(--type-body)", color: "var(--color-text-muted)" }}>{it.store}</td>
                    <td style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)", font: "var(--type-body)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "7px", height: "7px", borderRadius: "9999px", background: it.catColor }} />{it.cat}</span>
                    </td>
                    <td style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
                        <span style={{ font: "700 var(--text-label)/1 var(--font-sans)", fontVariantNumeric: "tabular-nums" }}>{it.conf}%</span>
                        <Badge tone={it.band[0]} dot={false}>{it.band[1]}</Badge>
                      </span>
                    </td>
                    <td style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)", font: "var(--type-body)" }}><Avatar name={it.who} /></td>
                    <td style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)", font: "var(--type-mono)", color: "var(--color-warning-on)" }}>{it.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* triage panel */}
        <Panel title="Selected item">
          <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", marginBottom: "var(--space-4)" }}>
            <Thumb size={56} />
            <div>
              <div style={{ font: "var(--type-title)" }}>Unidentified Item</div>
              <div style={{ font: "var(--type-mono)", color: "var(--color-text-muted)" }}>Barcode: 632947562931</div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)", padding: "var(--space-3) 0", marginBottom: "var(--space-4)" }}>
            {[["Source", "Cairo Festival City"], ["Detected", "Jun 7 · 10:42"], ["Category", "Beverages (AI)"], ["Confidence", "92% · High"], ["Age", "2h 15m"], ["Assignee", "Sara Mahmoud"]].map(detail)}
          </div>
          <div style={{ font: "var(--type-label)", marginBottom: "var(--space-3)" }}>Suggested matches</div>
          <div style={{ display: "grid", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
            {matches.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-2)", border: `1px solid ${i === 0 ? "var(--color-accent)" : "var(--color-border)"}`, borderRadius: "var(--radius-md)", background: i === 0 ? "var(--color-primary-subtle)" : "var(--color-surface)" }}>
                <Thumb size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "var(--type-label)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                  <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.meta}</div>
                </div>
                <span style={{ font: "700 var(--text-label)/1 var(--font-sans)", color: "var(--color-success-on)", fontVariantNumeric: "tabular-nums" }}>{m.pct}%</span>
                <Button variant="primary" size="sm">Link</Button>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
            <Button variant="primary" iconStart={<Icon name="link" size={15} />}>Link product</Button>
            <Button variant="secondary" iconStart={<Icon name="plus" size={15} />}>Create product</Button>
            <Button variant="ghost" iconStart={<Icon name="check" size={15} />}>Ignore</Button>
            <Button variant="ghost" iconStart={<Icon name="alert" size={15} />}>Escalate</Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

Object.assign(window, { UnknownItems });
