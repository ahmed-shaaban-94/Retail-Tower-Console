/* Retail Tower Console — MONEY CLOSE.
 * The end-of-day cash ritual, per register. Count sheet → tender reconciliation →
 * variance → sign-off chain → post to ERP. Numbers are mono + tabular; variance is
 * carried on badges, never a fill. Gold stays authority-only (not used here). */

const DSmc = window.RetailTowerConsoleDesignSystem_b7c448;

function mcMoney(n) { return "EGP " + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
const mcCard = { border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", boxShadow: "var(--shadow-card)", overflow: "hidden" };

function MoneyClose({ scope }) {
  const { Button, Badge, Icon, Banner } = DSmc;
  const PageHeader = window.PageHeader;
  const { Avatar } = window;

  const denoms = [
    { label: "EGP 200", v: 200, n: 42 }, { label: "EGP 100", v: 100, n: 88 },
    { label: "EGP 50", v: 50, n: 60 }, { label: "EGP 20", v: 20, n: 75 },
    { label: "EGP 10", v: 10, n: 40 }, { label: "EGP 5", v: 5, n: 30 },
    { label: "EGP 1", v: 1, n: 120 }, { label: "50 pt", v: 0.5, n: 64 }, { label: "25 pt", v: 0.25, n: 40 },
  ];
  const cashCounted = denoms.reduce((a, d) => a + d.v * d.n, 0);

  const registers = [
    { id: "REG-01", op: "Mariam Adel", status: "closed", variance: 0 },
    { id: "REG-02", op: "Yousef Tarek", status: "closed", variance: 12 },
    { id: "REG-03", op: "Omar Fathy", status: "counting", variance: -148 },
    { id: "REG-04", op: "Sara Helmy", status: "closed", variance: 0 },
    { id: "REG-05", op: "Karim Wael", status: "open", variance: null },
  ];
  const [sel, setSel] = React.useState("REG-03");
  const reg = registers.find((r) => r.id === sel) || registers[2];

  const tenders = [
    { label: "Cash drawer", icon: "database", counted: cashCounted, expected: cashCounted - reg.variance },
    { label: "Card · Visa / Mastercard", icon: "link", counted: 41280, expected: 41280 },
    { label: "Digital · Meeza / InstaPay", icon: "signal", counted: 12640.5, expected: 12640.5 },
    { label: "Vouchers & gift", icon: "audit", counted: 1200, expected: 1200 },
  ];
  const totCounted = tenders.reduce((a, t) => a + t.counted, 0);
  const totExpected = tenders.reduce((a, t) => a + t.expected, 0);
  const variance = totCounted - totExpected;
  const vTone = variance === 0 ? "success" : Math.abs(variance) < 50 ? "warning" : "danger";
  const vLabel = variance === 0 ? "Balanced" : variance > 0 ? "Over" : "Short";

  const statusMeta = { closed: { tone: "success", label: "Closed" }, counting: { tone: "warning", label: "Counting" }, open: { tone: "info", label: "Open" } };

  const signoff = [
    { role: "Counted by", name: "Omar Fathy", tier: "Store Staff", at: "21:42", done: true },
    { role: "Verified by", name: "Nadia Kamel", tier: "Store Manager", at: "pending", done: false },
    { role: "Approved by", name: "—", tier: "Tenant Admin", at: "pending", done: false },
  ];

  function act(m) { window.rtcToast && window.rtcToast(m, "info"); }
  const toneC = { success: "var(--color-success-on)", warning: "var(--color-warning-on)", danger: "var(--color-danger-on)" };

  return (
    <div>
      <PageHeader
        title="Money Close"
        subtitle={`Business day 14 Jun 2026 · ${scope.tenant} › Maadi Grand`}
        actions={<>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "36px", padding: "0 var(--space-3)", borderRadius: "var(--radius-control)", border: "1px solid var(--color-border)", font: "var(--type-label)", color: "var(--color-text-muted)" }}>3 of 5 registers closed</span>
          <Button variant="secondary" iconStart={<Icon name="audit" size={16} />} onClick={() => act("Z-report exported")}>Z-report</Button>
          <Button variant="primary" iconStart={<Icon name="check" size={16} />} onClick={() => act("Day close requires all registers verified")}>Post day close</Button>
        </>}
      />

      <div className="rtc-mclose" style={{ display: "grid", gridTemplateColumns: "288px minmax(0,1fr) 312px", gap: "var(--space-5)", alignItems: "start" }}>

        {/* Registers */}
        <div style={{ ...mcCard }}>
          <div style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)", font: "var(--type-title)" }}>Registers</div>
          <div>
            {registers.map((r, i) => {
              const on = r.id === sel; const sm = statusMeta[r.status];
              return (
                <button key={r.id} type="button" onClick={() => setSel(r.id)} style={{ position: "relative", width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) var(--space-5)", borderTop: i ? "1px solid var(--color-border)" : "none", cursor: "pointer", background: on ? "var(--color-primary-subtle)" : "transparent" }}>
                  {on ? <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "3px", height: "26px", borderRadius: "0 2px 2px 0", background: "var(--color-primary)" }} /> : null}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ font: "600 var(--text-label)/1 var(--font-mono)", color: "var(--color-text)" }}>{r.id}</div>
                    <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "2px" }}>{r.op}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Badge tone={sm.tone}>{sm.label}</Badge>
                    {r.variance != null && r.variance !== 0 ? <div style={{ font: "var(--type-caption)", fontFamily: "var(--font-mono)", color: toneC[Math.abs(r.variance) < 50 ? "warning" : "danger"], marginTop: "4px" }}>{r.variance > 0 ? "+" : ""}{r.variance.toFixed(2)}</div> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Count sheet */}
        <div style={{ display: "grid", gap: "var(--space-5)", minWidth: 0 }}>
          <div style={mcCard}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
              <span style={{ font: "var(--type-title)" }}>Cash count · {reg.id}</span>
              <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>counted by {reg.op}</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Denomination", "Count", "Value", "Subtotal"].map((h, i) => (
                    <th key={h} style={{ font: "600 var(--text-caption)/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", textAlign: i ? "right" : "left", padding: "var(--space-3) var(--space-5)", background: "var(--color-surface-raised)", borderBottom: "1px solid var(--color-border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {denoms.map((d, i) => (
                  <tr key={d.label} style={{ borderTop: i ? "1px solid var(--color-border)" : "none" }}>
                    <td style={{ padding: "var(--space-2) var(--space-5)", font: "var(--type-body)" }}>{d.label}</td>
                    <td style={{ padding: "var(--space-2) var(--space-5)", textAlign: "right", font: "var(--type-mono)", color: "var(--color-text-muted)" }}>× {d.n}</td>
                    <td style={{ padding: "var(--space-2) var(--space-5)", textAlign: "right", font: "var(--type-mono)", color: "var(--color-text-disabled)" }}>{d.v.toFixed(2)}</td>
                    <td style={{ padding: "var(--space-2) var(--space-5)", textAlign: "right", font: "600 var(--text-label)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{(d.v * d.n).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid var(--color-border-strong)" }}>
                  <td colSpan={3} style={{ padding: "var(--space-3) var(--space-5)", font: "var(--type-label)" }}>Cash counted</td>
                  <td style={{ padding: "var(--space-3) var(--space-5)", textAlign: "right", font: "700 var(--text-title)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{cashCounted.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style={mcCard}>
            <div style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)", font: "var(--type-title)" }}>Tender reconciliation</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Tender", "Expected", "Counted", "Variance"].map((h, i) => (
                    <th key={h} style={{ font: "600 var(--text-caption)/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", textAlign: i ? "right" : "left", padding: "var(--space-3) var(--space-5)", background: "var(--color-surface-raised)", borderBottom: "1px solid var(--color-border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tenders.map((t, i) => {
                  const dv = t.counted - t.expected;
                  return (
                    <tr key={t.label} style={{ borderTop: i ? "1px solid var(--color-border)" : "none" }}>
                      <td style={{ padding: "var(--space-3) var(--space-5)" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}><span style={{ color: "var(--color-text-muted)" }}><Icon name={t.icon} size={15} /></span>{t.label}</span>
                      </td>
                      <td style={{ padding: "var(--space-3) var(--space-5)", textAlign: "right", font: "var(--type-mono)", color: "var(--color-text-muted)" }}>{t.expected.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: "var(--space-3) var(--space-5)", textAlign: "right", font: "600 var(--text-label)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{t.counted.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: "var(--space-3) var(--space-5)", textAlign: "right", font: "var(--type-mono)", fontVariantNumeric: "tabular-nums", color: dv === 0 ? "var(--color-text-disabled)" : toneC[Math.abs(dv) < 50 ? "warning" : "danger"] }}>{dv === 0 ? "0.00" : (dv > 0 ? "+" : "") + dv.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Variance + sign-off */}
        <div style={{ display: "grid", gap: "var(--space-5)" }}>
          <div style={{ ...mcCard, padding: "var(--space-5)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
              <span style={{ font: "var(--type-title)" }}>Variance</span>
              <Badge tone={vTone}>{vLabel}</Badge>
            </div>
            <div style={{ font: "700 30px/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em", color: toneC[vTone] || "var(--color-text)" }}>{variance > 0 ? "+" : ""}{mcMoney(variance)}</div>
            <div style={{ display: "grid", gap: "var(--space-1)", marginTop: "var(--space-4)" }}>
              <McKv k="Expected" v={mcMoney(totExpected)} />
              <McKv k="Counted" v={mcMoney(totCounted)} />
              <McKv k="Threshold" v="EGP 50.00" />
            </div>
            {Math.abs(variance) >= 50 ? <Banner tone="danger" icon={<Icon name="alert" size={16} />} style={{ marginTop: "var(--space-4)" }}>Short over threshold — a manager must record a reason before this register can close.</Banner> : null}
          </div>

          <div style={{ ...mcCard, padding: "var(--space-5)" }}>
            <div style={{ font: "var(--type-title)", marginBottom: "var(--space-3)" }}>Sign-off chain</div>
            {signoff.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) 0", borderTop: i ? "1px solid var(--color-border)" : "none" }}>
                <span style={{ width: "28px", height: "28px", borderRadius: "9999px", display: "grid", placeItems: "center", flexShrink: 0, background: s.done ? "var(--color-success-surface)" : "var(--color-surface-raised)", color: s.done ? "var(--color-success-on)" : "var(--color-text-disabled)", border: `1.5px solid ${s.done ? "var(--color-success-on)" : "var(--color-border-strong)"}` }}>{s.done ? <Icon name="check" size={14} strokeWidth={2.5} /> : <Icon name="clock" size={14} />}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{s.role}</div>
                  <div style={{ font: "var(--type-label)" }}>{s.name} <span style={{ color: "var(--color-text-disabled)", fontWeight: 400 }}>· {s.tier}</span></div>
                </div>
                <span style={{ font: "var(--type-caption)", fontFamily: "var(--font-mono)", color: s.done ? "var(--color-text-muted)" : "var(--color-text-disabled)" }}>{s.at}</span>
              </div>
            ))}
            <Button variant="primary" onClick={() => act("Sent to manager for verification")} style={{ marginTop: "var(--space-4)", width: "100%" }}>Send for verification</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function McKv({ k, v }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-3)" }}>
      <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{k}</span>
      <span style={{ font: "var(--type-mono)", color: "var(--color-text)" }}>{v}</span>
    </div>
  );
}

Object.assign(window, { MoneyClose });
