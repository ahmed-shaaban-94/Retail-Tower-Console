/* Retail Tower Console — INVENTORY TRANSFERS.
 * Stock movement between stores: request → approval → in-transit tracking. Master list +
 * detail with a from→to route and line items. Quantities mono; status on badges; gold
 * authority-only (unused). */

const DStr = window.RetailTowerConsoleDesignSystem_b7c448;
const trCard = { border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", boxShadow: "var(--shadow-card)", overflow: "hidden" };

function InventoryTransfers({ scope }) {
  const { Button, Badge, Icon, Banner } = DStr;
  const PageHeader = window.PageHeader;

  const transfers = [
    { id: "TR-3082", from: "Mall of Egypt", to: "Cairo Festival City", units: 240, skus: 6, status: "transit", eta: "today 17:30", by: "Hossam Adel", lines: [["BEV-1188", "V7 Juice Mango 1L", 96], ["BEV-1102", "Spiro Spathis 1L", 72], ["DRY-2201", "Juhayna Full Cream 1L", 72]] },
    { id: "TR-3081", from: "Smouha Center", to: "Alexandria Corniche", units: 60, skus: 2, status: "review", eta: "—", by: "Karim Wael", lines: [["SEA-7740", "Cooler Box 25L", 24], ["SEA-7701", "Beach Towel L", 36]] },
    { id: "TR-3079", from: "City Stars", to: "Maadi Grand", units: 120, skus: 4, status: "approved", eta: "tomorrow 10:00", by: "Sara Helmy", lines: [["DRY-2240", "Domty Feta 500g", 60], ["DRY-2288", "Almarai Yoghurt 6pk", 60]] },
    { id: "TR-3074", from: "Cairo Festival City", to: "City Stars", units: 88, skus: 3, status: "received", eta: "delivered", by: "Mariam Adel", lines: [["BEV-1301", "Lipton Yellow 100s", 48], ["BEV-1240", "Nescafé 3in1", 40]] },
  ];
  const stMeta = { review: { tone: "warning", label: "Needs approval" }, approved: { tone: "info", label: "Approved" }, transit: { tone: "warning", label: "In transit" }, received: { tone: "success", label: "Received" } };
  const [sel, setSel] = React.useState("TR-3082");
  const t = transfers.find((x) => x.id === sel) || transfers[0];
  function act(m, tn) { window.rtcToast && window.rtcToast(m, tn || "info"); }

  const stages = ["Requested", "Approved", "In transit", "Received"];
  const stageIdx = { review: 0, approved: 1, transit: 2, received: 3 }[t.status];

  return (
    <div>
      <PageHeader title="Inventory Transfers" subtitle={`Stock movement · ${scope.tenant} · all stores`}
        actions={<Button variant="primary" iconStart={<Icon name="plus" size={16} />} onClick={() => act("New transfer request")}>New transfer</Button>} />

      <div className="rtc-tr" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 392px", gap: "var(--space-5)", alignItems: "start" }}>
        {/* List */}
        <div style={trCard}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[["Transfer", "left"], ["Route", "left"], ["Units", "right"], ["ETA", "left"], ["Status", "left"]].map(([h, a]) => (
                  <th key={h} style={{ font: "600 var(--text-caption)/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", textAlign: a, padding: "var(--space-3) var(--space-4)", background: "var(--color-surface-raised)", borderBottom: "1px solid var(--color-border)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transfers.map((x, i) => {
                const on = x.id === sel;
                return (
                  <tr key={x.id} onClick={() => setSel(x.id)} style={{ cursor: "pointer", borderTop: i ? "1px solid var(--color-border)" : "none", background: on ? "var(--color-primary-subtle)" : "transparent" }}>
                    <td style={{ padding: "var(--space-3) var(--space-4)", position: "relative", whiteSpace: "nowrap" }}>
                      {on ? <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "3px", height: "26px", borderRadius: "0 2px 2px 0", background: "var(--color-primary)" }} /> : null}
                      <div style={{ font: "600 var(--text-label)/1 var(--font-mono)" }}>{x.id}</div>
                      <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "2px" }}>{x.skus} SKUs · {x.by}</div>
                    </td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", font: "var(--type-body)", whiteSpace: "nowrap" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>{x.from}</span>
                      <span style={{ color: "var(--color-text-disabled)", padding: "0 6px" }}>→</span>
                      <span>{x.to}</span>
                    </td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", font: "600 var(--text-label)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{x.units}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", font: "var(--type-caption)", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{x.eta}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)" }}><Badge tone={stMeta[x.status].tone}>{stMeta[x.status].label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Detail */}
        <div style={{ display: "grid", gap: "var(--space-5)" }}>
          <div style={{ ...trCard, padding: "var(--space-5)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
              <span style={{ font: "600 var(--text-label)/1 var(--font-mono)", color: "var(--color-text-muted)" }}>{t.id}</span>
              <Badge tone={stMeta[t.status].tone}>{stMeta[t.status].label}</Badge>
            </div>
            {/* route */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
              <div style={{ flex: 1, padding: "var(--space-3)", borderRadius: "var(--radius-control)", background: "var(--color-surface-raised)", border: "1px solid var(--color-border)" }}>
                <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>From</div>
                <div style={{ font: "var(--type-label)", marginTop: "2px" }}>{t.from}</div>
              </div>
              <span style={{ color: "var(--color-text-disabled)", display: "inline-flex" }}><Icon name="chevron" size={18} style={{ transform: "rotate(-90deg)" }} /></span>
              <div style={{ flex: 1, padding: "var(--space-3)", borderRadius: "var(--radius-control)", background: "var(--color-surface-raised)", border: "1px solid var(--color-border)" }}>
                <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>To</div>
                <div style={{ font: "var(--type-label)", marginTop: "2px" }}>{t.to}</div>
              </div>
            </div>
            {/* progress */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--space-4)" }}>
              {stages.map((s, i) => {
                const done = i <= stageIdx;
                return (
                  <React.Fragment key={s}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                      <span style={{ width: "24px", height: "24px", borderRadius: "9999px", display: "grid", placeItems: "center", background: done ? "var(--color-success-surface)" : "var(--color-surface-raised)", color: done ? "var(--color-success-on)" : "var(--color-text-disabled)", border: `1.5px solid ${done ? "var(--color-success-on)" : "var(--color-border-strong)"}` }}>{done ? <Icon name="check" size={12} strokeWidth={2.5} /> : <span style={{ font: "700 10px/1 var(--font-mono)" }}>{i + 1}</span>}</span>
                      <span style={{ font: "10px/1.2 var(--font-sans)", color: done ? "var(--color-text)" : "var(--color-text-muted)", textAlign: "center", width: "56px" }}>{s}</span>
                    </div>
                    {i < stages.length - 1 ? <span style={{ flex: 1, height: "2px", background: i < stageIdx ? "var(--color-success-on)" : "var(--color-border)", marginTop: "-16px" }} /> : null}
                  </React.Fragment>
                );
              })}
            </div>
            {t.status === "review" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                <Button variant="primary" iconStart={<Icon name="check" size={16} />} onClick={() => act(`${t.id} approved`, "success")}>Approve</Button>
                <Button variant="secondary" onClick={() => act(`${t.id} declined`)}>Decline</Button>
              </div>
            ) : t.status === "transit" ? (
              <Button variant="primary" iconStart={<Icon name="check" size={16} />} onClick={() => act(`${t.id} marked received`, "success")} style={{ width: "100%" }}>Mark received</Button>
            ) : (
              <Button variant="secondary" iconStart={<Icon name="audit" size={16} />} onClick={() => act("Transfer manifest opened")} style={{ width: "100%" }}>View manifest</Button>
            )}
          </div>

          <div style={trCard}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
              <span style={{ font: "var(--type-title)" }}>Line items</span>
              <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{t.units} units</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {t.lines.map((l, i) => (
                  <tr key={i} style={{ borderTop: i ? "1px solid var(--color-border)" : "none" }}>
                    <td style={{ padding: "var(--space-3) var(--space-5)", font: "var(--type-mono)", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{l[0]}</td>
                    <td style={{ padding: "var(--space-3) var(--space-2)", font: "var(--type-body)" }}>{l[1]}</td>
                    <td style={{ padding: "var(--space-3) var(--space-5)", textAlign: "right", font: "600 var(--text-label)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{l[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { InventoryTransfers });
