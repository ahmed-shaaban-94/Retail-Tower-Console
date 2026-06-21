/* Retail Tower Console — PRICE CHANGES (approval & staged rollout).
 * A proposal batch → line-by-line diff (current → proposed, Δ, margin) → rollout plan
 * (stores, schedule, approval chain) → exactly one primary action. Money is mono;
 * Δ direction is shown by arrow + restrained tone, never a fill. Gold authority-only. */

const DSpr = window.RetailTowerConsoleDesignSystem_b7c448;
const prCard = { border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", boxShadow: "var(--shadow-card)", overflow: "hidden" };

function PriceChanges({ scope }) {
  const { Button, Badge, Icon, Banner } = DSpr;
  const PageHeader = window.PageHeader;

  const batches = [
    { id: "PC-1043", label: "Ramadan promo · Beverages", count: 18, status: "review", tone: "warning", by: "Mona Riad", items: [
      { sku: "BEV-1102", name: "Spiro Spathis 1L", from: 24.0, to: 19.5, margin: 31 },
      { sku: "BEV-1188", name: "V7 Juice Mango 1L", from: 32.0, to: 27.0, margin: 28 },
      { sku: "BEV-1205", name: "Schweppes Gold 250ml", from: 12.5, to: 9.75, margin: 24 },
      { sku: "BEV-1240", name: "Nescafé 3in1 (bundle)", from: 78.0, to: 65.0, margin: 22 },
      { sku: "BEV-1301", name: "Lipton Yellow 100s", from: 96.0, to: 84.0, margin: 35 },
    ] },
    { id: "PC-1041", label: "Cost pass-through · Dairy", count: 9, status: "review", tone: "warning", by: "Hossam Adel", items: [
      { sku: "DRY-2201", name: "Juhayna Full Cream 1L", from: 38.0, to: 41.5, margin: 18 },
      { sku: "DRY-2240", name: "Domty Feta 500g", from: 62.0, to: 67.0, margin: 21 },
      { sku: "DRY-2288", name: "Almarai Yoghurt 6pk", from: 54.0, to: 58.0, margin: 19 },
    ] },
    { id: "PC-1038", label: "Clearance · Seasonal", count: 24, status: "approved", tone: "success", by: "Mona Riad", items: [
      { sku: "SEA-7701", name: "Beach Towel L", from: 220.0, to: 149.0, margin: 12 },
      { sku: "SEA-7740", name: "Cooler Box 25L", from: 480.0, to: 360.0, margin: 15 },
    ] },
  ];
  const [sel, setSel] = React.useState("PC-1043");
  const batch = batches.find((b) => b.id === sel) || batches[0];

  function act(m, t) { window.rtcToast && window.rtcToast(m, t || "info"); }
  const isApproved = batch.status === "approved";

  const stores = ["All stores (5)", "Cairo Festival City", "Mall of Egypt", "City Stars", "Maadi Grand", "Smouha Center"];
  const [targets, setTargets] = React.useState(["All stores (5)"]);

  return (
    <div>
      <PageHeader
        title="Price changes"
        subtitle={`Proposals & rollout · ${scope.tenant} · ${scope.store}`}
        actions={<Button variant="secondary" iconStart={<Icon name="plus" size={16} />} onClick={() => act("New price-change batch")}>New batch</Button>} />

      <div className="rtc-pricing" style={{ display: "grid", gridTemplateColumns: "300px minmax(0,1fr) 312px", gap: "var(--space-5)", alignItems: "start" }}>
        {/* Proposal list */}
        <div style={prCard}>
          <div style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)", font: "var(--type-title)" }}>Proposals</div>
          {batches.map((b, i) => {
            const on = b.id === sel;
            return (
              <button key={b.id} type="button" onClick={() => setSel(b.id)} style={{ position: "relative", width: "100%", textAlign: "left", padding: "var(--space-4) var(--space-5)", borderTop: i ? "1px solid var(--color-border)" : "none", cursor: "pointer", background: on ? "var(--color-primary-subtle)" : "transparent" }}>
                {on ? <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "3px", height: "30px", borderRadius: "0 2px 2px 0", background: "var(--color-primary)" }} /> : null}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-2)" }}>
                  <span style={{ font: "600 var(--text-label)/1 var(--font-mono)", color: "var(--color-text)" }}>{b.id}</span>
                  <Badge tone={b.tone}>{b.status === "review" ? "In review" : "Approved"}</Badge>
                </div>
                <div style={{ font: "var(--type-body)", color: "var(--color-text)", marginTop: "5px" }}>{b.label}</div>
                <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "2px" }}>{b.count} items · proposed by {b.by}</div>
              </button>
            );
          })}
        </div>

        {/* Diff table */}
        <div style={{ display: "grid", gap: "var(--space-5)", minWidth: 0 }}>
          {!isApproved ? (
            <Banner tone="warning" icon={<Icon name="info" size={16} />}>This batch needs a Tenant Admin (or above) approval before it can be scheduled. Review the margin impact below.</Banner>
          ) : (
            <Banner tone="success" icon={<Icon name="check" size={16} />} requestId="c41d-77e0-19">Approved and scheduled — effective 16 Jun 2026, 00:00 across all stores.</Banner>
          )}

          <div style={prCard}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
              <span style={{ font: "var(--type-title)" }}>{batch.label}</span>
              <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{batch.items.length} of {batch.count} shown</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[["SKU", "left"], ["Item", "left"], ["Current", "right"], ["Proposed", "right"], ["Δ", "right"], ["Margin", "right"]].map(([h, a]) => (
                    <th key={h} style={{ font: "600 var(--text-caption)/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", textAlign: a, padding: "var(--space-3) var(--space-4)", background: "var(--color-surface-raised)", borderBottom: "1px solid var(--color-border)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {batch.items.map((it, i) => {
                  const dv = it.to - it.from; const pct = (dv / it.from) * 100; const up = dv > 0;
                  const tc = up ? "var(--color-warning-on)" : "var(--color-info-on)";
                  return (
                    <tr key={it.sku} style={{ borderTop: i ? "1px solid var(--color-border)" : "none" }}>
                      <td style={{ padding: "var(--space-3) var(--space-4)", font: "var(--type-mono)", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{it.sku}</td>
                      <td style={{ padding: "var(--space-3) var(--space-4)", font: "var(--type-body)" }}>{it.name}</td>
                      <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", font: "var(--type-mono)", color: "var(--color-text-disabled)", textDecoration: "line-through" }}>{it.from.toFixed(2)}</td>
                      <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", font: "600 var(--text-label)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{it.to.toFixed(2)}</td>
                      <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", font: "var(--type-mono)", fontVariantNumeric: "tabular-nums", color: tc, whiteSpace: "nowrap" }}>{up ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%</td>
                      <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", font: "var(--type-mono)", color: "var(--color-text-muted)" }}>{it.margin}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rollout plan */}
        <div style={{ display: "grid", gap: "var(--space-5)" }}>
          <div style={{ ...prCard, padding: "var(--space-5)" }}>
            <div style={{ font: "var(--type-title)", marginBottom: "var(--space-3)" }}>Rollout plan</div>
            <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginBottom: "var(--space-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Target stores</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
              {stores.map((s) => {
                const on = targets.includes(s);
                return (
                  <button key={s} type="button" onClick={() => setTargets((t) => s.startsWith("All") ? ["All stores (5)"] : on ? t.filter((x) => x !== s) : [...t.filter((x) => !x.startsWith("All")), s])} style={{ padding: "5px 12px", borderRadius: "var(--radius-pill)", border: `1px solid ${on ? "var(--color-primary)" : "var(--color-border)"}`, background: on ? "var(--color-primary-subtle)" : "var(--color-surface)", color: on ? "var(--color-accent)" : "var(--color-text-muted)", font: "var(--type-label)", cursor: "pointer" }}>{s}</button>
                );
              })}
            </div>
            <div style={{ height: "1px", background: "var(--color-border)", margin: "var(--space-4) 0" }} />
            <div style={{ display: "grid", gap: "var(--space-1)" }}>
              <PrKv k="Effective" v="16 Jun 2026 · 00:00" />
              <PrKv k="Rollout" v="Staged · 1 store / 15 min" />
              <PrKv k="Avg. price Δ" v="−14.2%" />
              <PrKv k="Margin floor" v="20% enforced" />
            </div>
          </div>

          <div style={{ ...prCard, padding: "var(--space-5)" }}>
            <div style={{ font: "var(--type-title)", marginBottom: "var(--space-3)" }}>Approval chain</div>
            {[["Proposed by", batch.by, "Merchandising", true], ["Reviewed by", "Tarek Sami", "Pricing Lead", !isApproved ? true : true], ["Approved by", isApproved ? "Amal Saleh" : "—", "Tenant Admin", isApproved]].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) 0", borderTop: i ? "1px solid var(--color-border)" : "none" }}>
                <span style={{ width: "26px", height: "26px", borderRadius: "9999px", display: "grid", placeItems: "center", flexShrink: 0, background: s[3] ? "var(--color-success-surface)" : "var(--color-surface-raised)", color: s[3] ? "var(--color-success-on)" : "var(--color-text-disabled)", border: `1.5px solid ${s[3] ? "var(--color-success-on)" : "var(--color-border-strong)"}` }}>{s[3] ? <Icon name="check" size={13} strokeWidth={2.5} /> : <Icon name="clock" size={13} />}</span>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{s[0]}</div><div style={{ font: "var(--type-label)" }}>{s[1]} <span style={{ color: "var(--color-text-disabled)", fontWeight: 400 }}>· {s[2]}</span></div></div>
              </div>
            ))}
            {!isApproved ? (
              <div style={{ display: "grid", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
                <Button variant="primary" iconStart={<Icon name="check" size={16} />} onClick={() => act("Batch approved & scheduled", "success")} style={{ width: "100%" }}>Approve & schedule</Button>
                <Button variant="secondary" onClick={() => act("Returned to merchandising")} style={{ width: "100%" }}>Request changes</Button>
              </div>
            ) : (
              <Button variant="secondary" iconStart={<Icon name="clock" size={16} />} onClick={() => act("Rollout paused")} style={{ width: "100%", marginTop: "var(--space-4)" }}>Pause rollout</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PrKv({ k, v }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-3)" }}>
      <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{k}</span>
      <span style={{ font: "var(--type-label)", color: "var(--color-text)", textAlign: "right" }}>{v}</span>
    </div>
  );
}

Object.assign(window, { PriceChanges });
