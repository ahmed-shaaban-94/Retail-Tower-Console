/* Retail Tower Console — OUTBOX & SYNC MONITOR.
 * The durable queue the Incident War-Room drains into. A live pipeline (POS → outbox →
 * orchestrator → ERP) with per-hop lag, the pending/retrying/failed/replayed queue as a
 * dense table with bulk replay/hold, and a flush-rate chart. Numbers mono; status on
 * badges only; gold authority-only (unused). Continues the 14:08 ERP incident. */

const DSob2 = window.RetailTowerConsoleDesignSystem_b7c448;
const obxCard = { border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", boxShadow: "var(--shadow-card)", overflow: "hidden" };
const obxTone = { success: "var(--color-success-on)", warning: "var(--color-warning-on)", danger: "var(--color-danger-on)", info: "var(--color-info-on)" };
const obxSurf = { success: "var(--color-success-surface)", warning: "var(--color-warning-surface)", danger: "var(--color-danger-surface)", info: "var(--color-info-surface)" };

function OutboxMonitor({ scope }) {
  const { Button, Badge, Icon, Banner } = DSob2;
  const PageHeader = window.PageHeader;
  const { useLive, jitter, LivePulse } = window;
  const tick = useLive(2400);

  // ---- pipeline hops (mirrors the incident trace) ----
  const hops = [
    { svc: "POS-Pulse", icon: "gauge", lag: "live", status: "ok", sub: "5 terminals" },
    { svc: "Outbox", icon: "database", lag: `${94 + tick} held`, status: "warn", sub: "durable queue" },
    { svc: "Frappe Orch.", icon: "link", lag: "draining", status: "warn", sub: "worker pool" },
    { svc: "ERPNext", icon: "server", lag: "recovering", status: "warn", sub: "back-office" },
  ];
  const hopMeta = { ok: { tone: "success", label: "Healthy" }, warn: { tone: "warning", label: "Degraded" }, fail: { tone: "danger", label: "Down" } };

  // ---- queue ----
  const allRows = [
    { id: "9d12-7e21-aa90", type: "sales_invoice", store: "Alexandria Corniche", amt: "4,120.00", age: "24m", tries: 4, state: "failed", conn: "ERPNext" },
    { id: "8c04-1f55-bb31", type: "sales_invoice", store: "Alexandria Corniche", amt: "1,890.50", age: "23m", tries: 4, state: "failed", conn: "ERPNext" },
    { id: "7a91-0e2c-cd14", type: "stock_adjust", store: "Alexandria Corniche", amt: "—", age: "22m", tries: 3, state: "retrying", conn: "ERPNext" },
    { id: "6b88-9d44-ef27", type: "sales_invoice", store: "Maadi Grand", amt: "642.00", age: "9m", tries: 1, state: "retrying", conn: "Frappe Orch." },
    { id: "5f70-aa12-1a08", type: "price_update", store: "All stores", amt: "—", age: "6m", tries: 0, state: "pending", conn: "Frappe Orch." },
    { id: "4e63-bc90-2b19", type: "sales_invoice", store: "Mall of Egypt", amt: "318.75", age: "4m", tries: 0, state: "pending", conn: "ERPNext" },
    { id: "3d52-cd78-3c2a", type: "customer_sync", store: "City Stars", amt: "—", age: "2m", tries: 0, state: "pending", conn: "Data-Pulse-2" },
    { id: "2c41-de66-4d3b", type: "sales_invoice", store: "Smouha Center", amt: "1,204.00", age: "18m", tries: 2, state: "replayed", conn: "ERPNext" },
    { id: "1b30-ef54-5e4c", type: "sales_invoice", store: "Maadi Grand", amt: "88.00", age: "31m", tries: 1, state: "replayed", conn: "ERPNext" },
  ];
  const stateMeta = {
    failed: { tone: "danger", label: "Failed" },
    retrying: { tone: "warning", label: "Retrying" },
    pending: { tone: "info", label: "Pending" },
    replayed: { tone: "success", label: "Replayed" },
  };
  const counts = allRows.reduce((a, r) => (a[r.state] = (a[r.state] || 0) + 1, a), {});
  const tabs = [
    { id: "all", label: "All", n: allRows.length },
    { id: "failed", label: "Failed", n: counts.failed || 0 },
    { id: "retrying", label: "Retrying", n: counts.retrying || 0 },
    { id: "pending", label: "Pending", n: counts.pending || 0 },
    { id: "replayed", label: "Replayed", n: counts.replayed || 0 },
  ];
  const [tab, setTab] = React.useState("failed");
  const [sel, setSel] = React.useState(() => new Set());
  const rows = allRows.filter((r) => tab === "all" || r.state === tab);
  const selectable = rows.filter((r) => r.state === "failed" || r.state === "retrying" || r.state === "pending");

  function toggle(id) { setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleAll() { setSel((s) => s.size >= selectable.length && selectable.length ? new Set() : new Set(selectable.map((r) => r.id))); }
  React.useEffect(() => { setSel(new Set()); }, [tab]);
  function act(m, t) { window.rtcToast && window.rtcToast(m, t || "info"); }

  // ---- flush-rate chart (posts/min): stalled during incident, replay ramp now ----
  const base = [82, 88, 79, 91, 85, 90, 84, 12, 0, 0, 0, 0, 4, 22, 48, 71, 86, 94, 102, 96];
  const liveRate = Math.max(60, jitter(96, 110, tick, 9));
  const chart = [...base, liveRate];
  const cmax = Math.max(...chart);
  const W = 100, H = 38;
  const pts = chart.map((v, i) => `${(i / (chart.length - 1)) * W},${H - (v / cmax) * (H - 3)}`).join(" ");

  const queued = (counts.failed || 0) + (counts.retrying || 0) + (counts.pending || 0);

  return (
    <div>
      <PageHeader
        title="Outbox &amp; Sync"
        subtitle={`Durable queue & integration health · ${scope.tenant} · all stores`}
        actions={<>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "36px", padding: "0 var(--space-3)", borderRadius: "var(--radius-control)", border: "1px solid var(--color-border)", font: "var(--type-label)", color: "var(--color-text-muted)" }}>
            <span className="rtc-pulse" style={{ width: "7px", height: "7px", borderRadius: "9999px", background: "var(--color-warning-on)" }} />
            Draining · {queued} queued
          </span>
          <Button variant="secondary" iconStart={<Icon name="clock" size={16} />} onClick={() => act("All replays paused")}>Pause all</Button>
          <Button variant="primary" iconStart={<Icon name="link" size={16} />} onClick={() => act(`Replaying ${queued} held messages…`, "success")}>Replay all</Button>
        </>}
      />

      <Banner tone="warning" icon={<Icon name="info" size={16} />} requestId="7e21-aa90-4c3f-9d12" style={{ marginBottom: "var(--space-5)" }}>
        <b style={{ fontWeight: 600 }}>Recovering from INC-2026-0614-03.</b> The ERP connector is back; held messages are draining oldest-first. No sales were lost — everything below is queued safely in the durable outbox.
      </Banner>

      {/* Pipeline */}
      <div className="rtc-obx-pipe" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0", marginBottom: "var(--space-5)" }}>
        {hops.map((h, i) => {
          const m = hopMeta[h.status];
          return (
            <div key={h.svc} style={{ display: "flex", alignItems: "stretch" }}>
              <div style={{ ...obxCard, flex: 1, padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-md)", display: "grid", placeItems: "center", flexShrink: 0, background: obxSurf[m.tone], color: obxTone[m.tone] }}><Icon name={h.icon} size={16} /></span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ font: "var(--type-label)" }}>{h.svc}</div>
                    <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{h.sub}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-2)", marginTop: "auto" }}>
                  <Badge tone={m.tone}>{m.label}</Badge>
                  <span style={{ font: "var(--type-mono)", color: "var(--color-text-muted)" }}>{h.lag}</span>
                </div>
              </div>
              {i < hops.length - 1 ? (
                <div style={{ display: "grid", placeItems: "center", width: "32px", flexShrink: 0, color: "var(--color-text-disabled)" }}>
                  <Icon name="chevron" size={18} style={{ transform: "rotate(-90deg)" }} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="rtc-obx" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 312px", gap: "var(--space-5)", alignItems: "start" }}>
        {/* Queue */}
        <div style={obxCard}>
          {/* Tabs + bulk bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", padding: "var(--space-3) var(--space-3)", borderBottom: "1px solid var(--color-border)", flexWrap: "wrap" }}>
            {tabs.map((t) => {
              const on = t.id === tab;
              return (
                <button key={t.id} type="button" onClick={() => setTab(t.id)} style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "32px", padding: "0 12px", borderRadius: "var(--radius-control)", border: "1px solid transparent", cursor: "pointer", background: on ? "var(--color-primary-subtle)" : "transparent", color: on ? "var(--color-accent)" : "var(--color-text-muted)", font: "var(--type-label)" }}>
                  {t.label}
                  <span style={{ font: "600 11px/1 var(--font-mono)", padding: "2px 6px", borderRadius: "var(--radius-pill)", background: on ? "var(--color-surface)" : "var(--color-surface-raised)", color: on ? "var(--color-accent)" : "var(--color-text-disabled)" }}>{t.n}</span>
                </button>
              );
            })}
          </div>

          {sel.size > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) var(--space-5)", borderBottom: "1px solid var(--color-border)", background: "var(--color-primary-subtle)" }}>
              <span style={{ font: "var(--type-label)", color: "var(--color-accent)" }}>{sel.size} selected</span>
              <div style={{ flex: 1 }} />
              <Button variant="secondary" onClick={() => act(`${sel.size} messages held`)}>Hold</Button>
              <Button variant="primary" onClick={() => { act(`Replaying ${sel.size} messages…`, "success"); setSel(new Set()); }}>Replay selected</Button>
            </div>
          ) : null}

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ width: "44px", padding: "var(--space-3) 0 var(--space-3) var(--space-5)", background: "var(--color-surface-raised)", borderBottom: "1px solid var(--color-border)" }}>
                  <input type="checkbox" checked={selectable.length > 0 && sel.size >= selectable.length} onChange={toggleAll} aria-label="Select all" style={{ width: "16px", height: "16px", accentColor: "var(--color-primary)", cursor: "pointer" }} />
                </th>
                {[["Request ID", "left"], ["Type", "left"], ["Store", "left"], ["Amount (EGP)", "right"], ["Age", "right"], ["Attempts", "right"], ["Target", "left"], ["State", "left"]].map(([h, a]) => (
                  <th key={h} style={{ font: "600 var(--text-caption)/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", textAlign: a, padding: "var(--space-3) var(--space-4)", background: "var(--color-surface-raised)", borderBottom: "1px solid var(--color-border)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const sm = stateMeta[r.state];
                const canSel = r.state !== "replayed";
                const on = sel.has(r.id);
                return (
                  <tr key={r.id} style={{ borderTop: i ? "1px solid var(--color-border)" : "none", background: on ? "var(--color-primary-subtle)" : "transparent" }}>
                    <td style={{ padding: "var(--space-3) 0 var(--space-3) var(--space-5)" }}>
                      {canSel ? <input type="checkbox" checked={on} onChange={() => toggle(r.id)} aria-label={`Select ${r.id}`} style={{ width: "16px", height: "16px", accentColor: "var(--color-primary)", cursor: "pointer" }} /> : <span style={{ color: "var(--color-text-disabled)", display: "grid", placeItems: "center" }}><Icon name="check" size={14} /></span>}
                    </td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", font: "var(--type-mono)", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{r.id}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", font: "var(--type-body)", whiteSpace: "nowrap" }}>{r.type}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", font: "var(--type-body)", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{r.store}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", font: "600 var(--text-label)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", color: r.amt === "—" ? "var(--color-text-disabled)" : "var(--color-text)" }}>{r.amt}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", font: "var(--type-mono)", color: "var(--color-text-muted)" }}>{r.age}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", font: "var(--type-mono)", color: r.tries >= 4 ? "var(--color-danger-on)" : r.tries > 0 ? "var(--color-warning-on)" : "var(--color-text-disabled)" }}>{r.tries} / 4</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", font: "var(--type-caption)", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{r.conn}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)" }}><Badge tone={sm.tone}>{sm.label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right rail */}
        <div style={{ display: "grid", gap: "var(--space-5)" }}>
          <div style={obxCard}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
              <span style={{ font: "var(--type-title)" }}>Flush rate</span>
              <LivePulse />
            </div>
            <div style={{ padding: "var(--space-4) var(--space-5) var(--space-5)" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                <span className="rtc-live-val" key={Math.round(liveRate)} style={{ font: "700 28px/1 var(--font-sans)", fontVariantNumeric: "tabular-nums", color: "var(--color-success-on)" }}>{Math.round(liveRate)}</span>
                <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>posts / min · last 20 min</span>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="84" preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
                <polygon points={`0,${H} ${pts} ${W},${H}`} fill="var(--color-success-on)" opacity="0.12" />
                <polyline points={pts} fill="none" stroke="var(--color-success-on)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", font: "var(--type-caption)", color: "var(--color-text-disabled)", marginTop: "4px" }}>
                <span>−20m</span><span style={{ color: "var(--color-warning-on)" }}>stall 14:08–14:32</span><span>now</span>
              </div>
            </div>
          </div>

          <div style={{ ...obxCard, padding: "var(--space-5)" }}>
            <div style={{ font: "var(--type-title)", marginBottom: "var(--space-3)" }}>Queue depth</div>
            <ObxStat label="Failed" n={counts.failed || 0} tone="danger" />
            <ObxStat label="Retrying" n={counts.retrying || 0} tone="warning" />
            <ObxStat label="Pending" n={counts.pending || 0} tone="info" />
            <ObxStat label="Replayed today" n={counts.replayed || 0} tone="success" />
            <div style={{ height: "1px", background: "var(--color-border)", margin: "var(--space-3) 0" }} />
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>Est. clear time</span>
              <span style={{ font: "600 var(--text-label)/1 var(--font-mono)", color: "var(--color-text)" }}>~2m at current rate</span>
            </div>
          </div>

          <div style={{ ...obxCard, padding: "var(--space-5)" }}>
            <div style={{ font: "var(--type-title)", marginBottom: "var(--space-2)" }}>Replay policy</div>
            <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginBottom: "var(--space-3)" }}>Oldest-first · 4 attempts · exponential backoff · idempotency keyed on request_id.</div>
            <Button variant="secondary" iconStart={<Icon name="settings" size={16} />} onClick={() => act("Replay policy editor")} style={{ width: "100%" }}>Edit policy</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ObxStat({ label, n, tone }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-2) 0" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", font: "var(--type-body)", color: "var(--color-text-muted)" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: obxTone[tone] }} />
        {label}
      </span>
      <span style={{ font: "700 var(--text-headline)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--color-text)" }}>{n}</span>
    </div>
  );
}

Object.assign(window, { OutboxMonitor });
