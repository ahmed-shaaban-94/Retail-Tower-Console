/* Retail Tower Console — TENANT BILLING & USAGE.
 * The platform's commercial layer: per-tenant usage metering, current invoice, and
 * invoice history. Money + counts in mono; status on badges; gold authority-only. */

const DSbl = window.RetailTowerConsoleDesignSystem_b7c448;
const blCard = { border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", boxShadow: "var(--shadow-card)", overflow: "hidden" };

function TenantBilling({ scope }) {
  const { Button, Badge, Icon, Banner } = DSbl;
  const PageHeader = window.PageHeader;
  const money = (n) => "EGP " + n.toLocaleString(undefined, { minimumFractionDigits: 2 });

  const meters = [
    { label: "Stores", used: 5, cap: 10, unit: "active", price: "EGP 1,200 / store" },
    { label: "Transactions", used: 184200, cap: 250000, unit: "this cycle", price: "EGP 0.04 / txn" },
    { label: "API calls", used: 8.4, cap: 12, unit: "M / month", price: "included" },
    { label: "Operators", used: 38, cap: 50, unit: "seats", price: "EGP 90 / seat" },
  ];
  const lines = [
    ["Platform base", "Tower OS · Growth plan", money(18000)],
    ["Stores", "5 active × EGP 1,200", money(6000)],
    ["Transactions", "184,200 × EGP 0.04", money(7368)],
    ["Operator seats", "38 × EGP 90", money(3420)],
    ["Support", "Priority · 24×7", money(2500)],
  ];
  const subtotal = 18000 + 6000 + 7368 + 3420 + 2500;
  const vat = subtotal * 0.14;
  const total = subtotal + vat;

  const history = [
    { id: "INV-2026-05", period: "May 2026", amt: 36420.0, status: "paid", on: "01 Jun 2026" },
    { id: "INV-2026-04", period: "Apr 2026", amt: 34980.5, status: "paid", on: "01 May 2026" },
    { id: "INV-2026-03", period: "Mar 2026", amt: 33110.0, status: "paid", on: "02 Apr 2026" },
    { id: "INV-2026-02", period: "Feb 2026", amt: 31840.0, status: "paid", on: "01 Mar 2026" },
  ];
  function act(m) { window.rtcToast && window.rtcToast(m, "info"); }

  return (
    <div>
      <PageHeader title="Billing & Usage" subtitle={`Commercial · ${scope.tenant} · Growth plan`}
        actions={<>
          <Button variant="secondary" iconStart={<Icon name="audit" size={16} />} onClick={() => act("Current invoice downloaded")}>Download invoice</Button>
          <Button variant="primary" iconStart={<Icon name="settings" size={16} />} onClick={() => act("Plan & limits editor")}>Manage plan</Button>
        </>} />

      <div className="rtc-bl" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 360px", gap: "var(--space-5)", alignItems: "start" }}>
        <div style={{ display: "grid", gap: "var(--space-5)", minWidth: 0 }}>
          {/* Usage meters */}
          <div style={{ ...blCard, padding: "var(--space-5)" }}>
            <div style={{ font: "var(--type-title)", marginBottom: "var(--space-4)" }}>Usage this cycle <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", fontWeight: 400 }}>· 1–14 Jun 2026</span></div>
            <div className="rtc-bl-meters" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
              {meters.map((m) => {
                const pct = Math.round((m.used / m.cap) * 100);
                const tone = pct >= 90 ? "danger" : pct >= 75 ? "warning" : "success";
                const fmt = (v) => v >= 1000 ? v.toLocaleString() : v;
                return (
                  <div key={m.label}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span style={{ font: "var(--type-label)" }}>{m.label}</span>
                      <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{m.price}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "6px" }}>
                      <span style={{ font: "700 18px/1 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{fmt(m.used)}</span>
                      <span style={{ font: "var(--type-caption)", color: "var(--color-text-disabled)" }}>/ {fmt(m.cap)} {m.unit}</span>
                    </div>
                    <div style={{ height: "7px", borderRadius: "9999px", background: "var(--color-surface-raised)", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: "9999px", background: `var(--color-${tone}-on)` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invoice history */}
          <div style={blCard}>
            <div style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)", font: "var(--type-title)" }}>Invoice history</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[["Invoice", "left"], ["Period", "left"], ["Amount (EGP)", "right"], ["Paid", "left"], ["Status", "left"]].map(([h, a]) => (
                    <th key={h} style={{ font: "600 var(--text-caption)/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", textAlign: a, padding: "var(--space-3) var(--space-4)", background: "var(--color-surface-raised)", borderBottom: "1px solid var(--color-border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((x, i) => (
                  <tr key={x.id} style={{ borderTop: i ? "1px solid var(--color-border)" : "none" }}>
                    <td style={{ padding: "var(--space-3) var(--space-4)", font: "var(--type-mono)", color: "var(--color-text-muted)" }}>{x.id}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", font: "var(--type-body)" }}>{x.period}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", font: "600 var(--text-label)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{x.amt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", font: "var(--type-caption)", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{x.on}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)" }}><Badge tone="success">Paid</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Current invoice */}
        <div style={{ ...blCard, padding: "var(--space-5)", position: "sticky", top: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-1)" }}>
            <span style={{ font: "var(--type-title)" }}>Current invoice</span>
            <Badge tone="info">Open</Badge>
          </div>
          <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginBottom: "var(--space-4)" }}>Jun 2026 · due 01 Jul 2026</div>
          <div style={{ display: "grid", gap: "var(--space-2)" }}>
            {lines.map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-3)" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ font: "var(--type-body)" }}>{l[0]}</div>
                  <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{l[1]}</div>
                </div>
                <span style={{ font: "var(--type-mono)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{l[2]}</span>
              </div>
            ))}
          </div>
          <div style={{ height: "1px", background: "var(--color-border)", margin: "var(--space-4) 0" }} />
          <div style={{ display: "grid", gap: "var(--space-1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", font: "var(--type-body)", color: "var(--color-text-muted)" }}><span>Subtotal</span><span style={{ fontFamily: "var(--font-mono)" }}>{money(subtotal)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", font: "var(--type-body)", color: "var(--color-text-muted)" }}><span>VAT 14%</span><span style={{ fontFamily: "var(--font-mono)" }}>{money(vat)}</span></div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "var(--space-3)", paddingTop: "var(--space-3)", borderTop: "2px solid var(--color-border-strong)" }}>
            <span style={{ font: "var(--type-label)" }}>Total due</span>
            <span style={{ font: "700 22px/1 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{money(total)}</span>
          </div>
          <Button variant="primary" iconStart={<Icon name="check" size={16} />} onClick={() => act("Invoice marked for payment")} style={{ width: "100%", marginTop: "var(--space-4)" }}>Pay now</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TenantBilling });
