/* Retail Tower Console — RETURNS & REFUNDS review.
 * A money-sensitive approval queue: refund request → original transaction → reason →
 * who can authorize. Master list + detail pane. Refund amounts in mono; risk on badges;
 * gold authority-only (unused). */

const DSrf = window.RetailTowerConsoleDesignSystem_b7c448;
const rfCard = { border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", boxShadow: "var(--shadow-card)", overflow: "hidden" };

function ReturnsRefunds({ scope }) {
  const { Button, Badge, Icon, Banner } = DSrf;
  const PageHeader = window.PageHeader;
  const { Avatar } = window;

  const queue = [
    { id: "RF-5521", store: "Cairo Festival City", amt: 1840.0, txn: "TXN-90412", reason: "Damaged on arrival", item: "Cooler Box 25L", risk: "low", op: "Mariam Adel", age: "8m", method: "Card · refund to source" },
    { id: "RF-5520", store: "Mall of Egypt", amt: 6200.0, txn: "TXN-90388", reason: "Wrong item shipped", item: "Air Fryer XL ×2", risk: "high", op: "Yousef Tarek", age: "21m", method: "Card · refund to source" },
    { id: "RF-5518", store: "City Stars", amt: 320.0, txn: "TXN-90355", reason: "Customer changed mind", item: "Beach Towel L", risk: "low", op: "Sara Helmy", age: "34m", method: "Cash" },
    { id: "RF-5515", store: "Maadi Grand", amt: 2480.0, txn: "TXN-90301", reason: "Price-match adjustment", item: "Lipton Yellow 100s ×4", risk: "med", op: "Omar Fathy", age: "1h", method: "Store credit" },
    { id: "RF-5512", store: "Smouha Center", amt: 980.0, txn: "TXN-90288", reason: "Defective unit", item: "Kettle 1.7L", risk: "med", op: "Karim Wael", age: "2h", method: "Card · refund to source" },
  ];
  const riskMeta = { low: { tone: "success", label: "Low risk" }, med: { tone: "warning", label: "Review" }, high: { tone: "danger", label: "High risk" } };
  const [sel, setSel] = React.useState("RF-5520");
  const r = queue.find((x) => x.id === sel) || queue[0];
  function act(m, t) { window.rtcToast && window.rtcToast(m, t || "info"); }

  const total = queue.reduce((a, x) => a + x.amt, 0);
  const money = (n) => "EGP " + n.toLocaleString(undefined, { minimumFractionDigits: 2 });

  const timeline = [
    { t: "Original sale", at: "12 Jun · 16:22", who: r.op, done: true },
    { t: "Return requested", at: "today · 14:01", who: "Customer desk", done: true },
    { t: "Manager review", at: "pending", who: "Nadia Kamel", done: false, active: true },
    { t: "Refund issued", at: "—", who: "—", done: false },
  ];

  return (
    <div>
      <PageHeader title="Returns & Refunds" subtitle={`Approval queue · ${scope.tenant} · all stores`}
        actions={<>
          <span style={{ display: "inline-flex", alignItems: "center", height: "36px", padding: "0 var(--space-3)", borderRadius: "var(--radius-control)", border: "1px solid var(--color-border)", font: "var(--type-label)", color: "var(--color-text-muted)" }}>{queue.length} pending · {money(total)}</span>
          <Button variant="secondary" iconStart={<Icon name="audit" size={16} />} onClick={() => act("Refund report exported")}>Export</Button>
        </>} />

      <div className="rtc-rf" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: "var(--space-5)", alignItems: "start" }}>
        {/* Queue */}
        <div style={rfCard}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[["Request", "left"], ["Store", "left"], ["Reason", "left"], ["Refund (EGP)", "right"], ["Age", "right"], ["Risk", "left"]].map(([h, a]) => (
                  <th key={h} style={{ font: "600 var(--text-caption)/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", textAlign: a, padding: "var(--space-3) var(--space-4)", background: "var(--color-surface-raised)", borderBottom: "1px solid var(--color-border)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queue.map((x, i) => {
                const on = x.id === sel; const rm = riskMeta[x.risk];
                return (
                  <tr key={x.id} onClick={() => setSel(x.id)} style={{ cursor: "pointer", borderTop: i ? "1px solid var(--color-border)" : "none", background: on ? "var(--color-primary-subtle)" : "transparent" }}>
                    <td style={{ padding: "var(--space-3) var(--space-4)", position: "relative" }}>
                      {on ? <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "3px", height: "26px", borderRadius: "0 2px 2px 0", background: "var(--color-primary)" }} /> : null}
                      <div style={{ font: "600 var(--text-label)/1 var(--font-mono)" }}>{x.id}</div>
                      <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "2px" }}>{x.item}</div>
                    </td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", font: "var(--type-body)", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{x.store}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", font: "var(--type-body)" }}>{x.reason}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", font: "600 var(--text-label)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{x.amt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", font: "var(--type-mono)", color: "var(--color-text-muted)" }}>{x.age}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)" }}><Badge tone={rm.tone}>{rm.label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Detail */}
        <div style={{ display: "grid", gap: "var(--space-5)" }}>
          <div style={{ ...rfCard, padding: "var(--space-5)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
              <span style={{ font: "600 var(--text-label)/1 var(--font-mono)", color: "var(--color-text-muted)" }}>{r.id}</span>
              <Badge tone={riskMeta[r.risk].tone}>{riskMeta[r.risk].label}</Badge>
            </div>
            <div style={{ font: "700 30px/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>{money(r.amt)}</div>
            <div style={{ font: "var(--type-body)", color: "var(--color-text-muted)", marginTop: "4px" }}>{r.method}</div>
            <div style={{ display: "grid", gap: "var(--space-1)", marginTop: "var(--space-4)" }}>
              <RfKv k="Item" v={r.item} />
              <RfKv k="Reason" v={r.reason} />
              <RfKv k="Original txn" v={r.txn} mono />
              <RfKv k="Store" v={r.store} />
              <RfKv k="Requested by" v={r.op} />
            </div>
            {r.risk === "high" ? <Banner tone="danger" icon={<Icon name="alert" size={16} />} style={{ marginTop: "var(--space-4)" }}>Above EGP 5,000 — requires Tenant Admin authorization. A reason must be recorded in the audit log.</Banner> : null}
            <div style={{ display: "grid", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
              <Button variant="primary" iconStart={<Icon name="check" size={16} />} onClick={() => act(`Refund ${r.id} approved`, "success")} style={{ width: "100%" }}>Approve refund</Button>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                <Button variant="secondary" onClick={() => act("Returned to store desk")}>Request info</Button>
                <Button variant="secondary" onClick={() => act(`Refund ${r.id} declined`)}>Decline</Button>
              </div>
            </div>
          </div>

          <div style={{ ...rfCard, padding: "var(--space-5)" }}>
            <div style={{ font: "var(--type-title)", marginBottom: "var(--space-3)" }}>Timeline</div>
            {timeline.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "stretch" }}>
                  <span style={{ width: "22px", height: "22px", borderRadius: "9999px", display: "grid", placeItems: "center", flexShrink: 0, background: s.done ? "var(--color-success-surface)" : s.active ? "var(--color-primary-subtle)" : "var(--color-surface-raised)", color: s.done ? "var(--color-success-on)" : s.active ? "var(--color-accent)" : "var(--color-text-disabled)", border: `1.5px solid ${s.done ? "var(--color-success-on)" : s.active ? "var(--color-primary)" : "var(--color-border-strong)"}` }}>{s.done ? <Icon name="check" size={12} strokeWidth={2.5} /> : <Icon name="clock" size={12} />}</span>
                  {i < timeline.length - 1 ? <span style={{ flex: 1, width: "2px", minHeight: "14px", background: "var(--color-border)", marginTop: "3px" }} /> : null}
                </div>
                <div style={{ paddingBottom: "var(--space-3)", minWidth: 0 }}>
                  <div style={{ font: "var(--type-label)", color: s.done || s.active ? "var(--color-text)" : "var(--color-text-muted)" }}>{s.t}</div>
                  <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "1px" }}>{s.at} · {s.who}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RfKv({ k, v, mono }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-3)" }}>
      <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", flexShrink: 0 }}>{k}</span>
      <span style={{ font: mono ? "var(--type-mono)" : "var(--type-label)", color: "var(--color-text)", textAlign: "right" }}>{v}</span>
    </div>
  );
}

Object.assign(window, { ReturnsRefunds });
