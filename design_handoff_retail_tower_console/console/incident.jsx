/* Retail Tower Console — INCIDENT WAR-ROOM.
 * The focused command surface for one live incident. Continues the Command Desk's
 * Alexandria Corniche alert: ERP invoice posting is failing. Answers, in order:
 * WHAT happened, WHO it touches, WHERE it broke (the request_id trace), and HOW to
 * recover (the runbook) — with a chronological war-room log and the responders on it.
 * Data-viz, not decor. Severity is carried by danger tones; gold stays authority-only. */

const DSwr = window.RetailTowerConsoleDesignSystem_b7c448;

function IncidentWarRoom({ scope }) {
  const { Button, Badge, Icon, Banner } = DSwr;
  const PageHeader = window.PageHeader;
  const { useLive, jitter, LivePulse, Avatar } = window;
  const tick = useLive(2600);

  const tone = { success: "var(--color-success-on)", warning: "var(--color-warning-on)", danger: "var(--color-danger-on)", info: "var(--color-info-on)" };
  const surf = { success: "var(--color-success-surface)", warning: "var(--color-warning-surface)", danger: "var(--color-danger-surface)", info: "var(--color-info-surface)" };

  // ---- live impact figures (sales keep capturing locally; only the *posting* is broken) ----
  const failed = 142 + tick * 2;
  const revenue = (318420 + tick * 4120).toLocaleString();
  const queued = 96 + tick * 2;
  const elapsed = 24; // min since first failure

  // ---- request trace: one sales-invoice post, span by span, to the break ----
  const trace = [
    { svc: "POS-Pulse", icon: "gauge", op: "capture_sale", ms: 42, status: "ok" },
    { svc: "Data-Pulse-2", icon: "database", op: "enqueue → outbox", ms: 18, status: "ok" },
    { svc: "Data-Pulse-2", icon: "database", op: "transform payload", ms: 64, status: "ok" },
    { svc: "Frappe Orch.", icon: "link", op: "workflow dispatch", ms: 612, status: "warn" },
    { svc: "ERPNext", icon: "server", op: "POST /sales_invoice", ms: 30000, status: "fail", note: "Gateway timeout · upstream 504" },
    { svc: "Data-Pulse-2", icon: "database", op: "retry ×4 (backoff)", ms: 0, status: "fail", note: "Retry budget exhausted" },
  ];
  const statusMeta = {
    ok: { label: "OK", tone: "success" },
    warn: { label: "Slow", tone: "warning" },
    fail: { label: "Failed", tone: "danger" },
  };

  // ---- error-rate series (last 30 min, 1 bar/min). Baseline, then the spike at detection. ----
  const series = [0.2, 0.3, 0.2, 0.4, 0.3, 0.2, 0.5, 0.3, 0.4, 0.6, 1.1, 3.4, 6.2, 8.9, 11.4, 12.1, 11.6, 12.4, 11.9, 12.6, 12.2, 11.8, 12.5, 12.1, 11.7, 12.3, 11.9, 12.7, 12.2];
  const live = Math.max(8, jitter(12, 16, tick, 5));
  const chart = [...series, live];
  const cmax = Math.max(...chart);
  const W = 100, H = 40;
  const pts = chart.map((v, i) => `${(i / (chart.length - 1)) * W},${H - (v / cmax) * (H - 4)}`).join(" ");
  const threshIdx = 10;

  // ---- remediation runbook ----
  const steps = [
    { state: "done", label: "Auto-retry exhausted", detail: "4 of 4 attempts · exponential backoff" },
    { state: "done", label: "On-call paged", detail: "Platform SRE · acknowledged in 3m" },
    { state: "active", label: "Drain to durable outbox", detail: "Sales kept safe locally — no data loss", action: "Confirm drain", primary: true },
    { state: "pending", label: "Restart Frappe Orch. worker pool", detail: "Clears the dispatch backlog (612 ms p95)", action: "Restart workers" },
    { state: "pending", label: "Replay outbox to ERPNext", detail: `${queued} invoices queued for replay`, action: "Replay queue" },
    { state: "pending", label: "Verify reconciliation", detail: "Confirm gross matches posted total" },
  ];

  // ---- war-room activity log ----
  const events = [
    { t: "14:32", who: "Amal Saleh", role: "Commander", tone: "info", icon: "link", msg: "Draining register queue to durable outbox.", you: true },
    { t: "14:24", who: "Hassan Nabil", role: "Platform SRE", tone: "warning", icon: "server", msg: "ERP connector returning 504 — upstream ERPNext app server unresponsive." },
    { t: "14:18", who: "Layla Mansour", role: "ERP Connector", tone: "info", icon: "operators", msg: "Joining — checking Frappe Orch. worker saturation." },
    { t: "14:14", who: "PagerDuty", role: "Automation", tone: "warning", icon: "bell", msg: "Paged on-call rotation · Platform SRE." },
    { t: "14:11", who: "Data-Pulse-2", role: "System", tone: "danger", icon: "alert", msg: "Auto-retry exhausted after 4 attempts." },
    { t: "14:08", who: "Detector", role: "System", tone: "danger", icon: "activity", msg: "Error rate breached 5% threshold (now 12.4%)." },
  ];

  const responders = [
    { name: "Amal Saleh", role: "Incident commander", status: "Driving", tone: "info" },
    { name: "Hassan Nabil", role: "Platform SRE", status: "Investigating", tone: "warning" },
    { name: "Layla Mansour", role: "ERP connector", status: "Standby", tone: "success" },
  ];

  function act(msg) { window.rtcToast && window.rtcToast(msg, "info"); }

  return (
    <div>
      <PageHeader
        title="Incident War-Room"
        subtitle={`INC-2026-0614-03 · ERP invoice posting failure · ${scope.tenant} › Alexandria Corniche`}
        actions={<>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "36px", padding: "0 var(--space-3)", borderRadius: "var(--radius-control)", background: "var(--color-danger-surface)", color: "var(--color-danger-on)", font: "600 var(--text-caption)/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <span className="rtc-pulse" style={{ width: "7px", height: "7px", borderRadius: "9999px", background: "var(--color-danger-on)" }} />
            SEV-1 · Mitigating · T+{elapsed}m
          </span>
          <Button variant="secondary" iconStart={<Icon name="check" size={16} />} onClick={() => act("Incident acknowledged")}>Acknowledge</Button>
          <Button variant="primary" iconStart={<Icon name="check" size={16} />} onClick={() => act("Resolution requires all runbook steps complete")}>Declare resolved</Button>
        </>}
      />

      <Banner tone="danger" icon={<Icon name="alert" size={16} />} requestId="7e21-aa90-4c3f-9d12"
        style={{ marginBottom: "var(--space-5)" }}
        action={<a href="#" onClick={(e) => { e.preventDefault(); act("Failure trace shown below"); }} style={{ color: "inherit", fontWeight: 600, textDecoration: "underline", whiteSpace: "nowrap" }}>View trace</a>}>
        <b style={{ fontWeight: 600 }}>Sales invoices are not posting to ERPNext.</b> The ERP app server is returning gateway timeouts; sales are still captured locally and safe. A Platform SRE is on it — drain the register queue to the durable outbox, then replay once the connector recovers.
      </Banner>

      <div className="rtc-warroom" style={{ display: "grid", gridTemplateColumns: "248px minmax(0,1fr) 332px", gap: "var(--space-5)", alignItems: "start" }}>

        {/* ---- Blast radius / impact ---- */}
        <div style={{ display: "grid", gap: "var(--space-5)" }}>
          <Panel title="Blast radius">
            <ImpactStat label="Failed posts" value={failed.toLocaleString()} tone="danger" live trend="climbing" />
            <ImpactStat label="Revenue unposted" value={`EGP ${revenue}`} tone="danger" live />
            <ImpactStat label="Terminals affected" value="5 / 5" tone="warning" />
            <ImpactStat label="Customers impacted" value="0" tone="success" note="sales captured locally" />
            <div style={{ height: "1px", background: "var(--color-border)", margin: "var(--space-2) 0" }} />
            <KvLine k="First failure" v="14:08 · 24m ago" />
            <KvLine k="MTTR (p50)" v="18m" />
            <KvLine k="Scope" v="Single store" mono />
          </Panel>

          <Panel title="Containment">
            <div style={{ display: "grid", gap: "var(--space-2)" }}>
              <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>Sales capture vs. ERP posting over the incident window.</div>
              <Meter label="Local capture" pct={100} tone="success" />
              <Meter label="Posted to ERP" pct={11} tone="danger" />
              <Meter label="Held in outbox" pct={89} tone="warning" />
            </div>
          </Panel>
        </div>

        {/* ---- Center: trace + error rate + runbook ---- */}
        <div style={{ display: "grid", gap: "var(--space-5)", minWidth: 0 }}>
          {/* Failure trace */}
          <div id="rtc-trace" style={panel}>
            <PanelHead title="Failure trace" right={<span style={{ font: "var(--type-mono)", color: "var(--color-text-muted)" }}>req 7e21-aa90-4c3f-9d12</span>} />
            <div style={{ padding: "var(--space-2) 0" }}>
              {trace.map((s, i) => {
                const m = statusMeta[s.status];
                const broke = s.status === "fail";
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "26px 1fr auto", gap: "var(--space-3)", alignItems: "start", padding: "var(--space-2) var(--space-5)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "stretch" }}>
                      <span style={{ width: "26px", height: "26px", borderRadius: "var(--radius-md)", display: "grid", placeItems: "center", flexShrink: 0, background: surf[m.tone], color: tone[m.tone] }}><Icon name={s.icon} size={14} /></span>
                      {i < trace.length - 1 ? <span style={{ flex: 1, width: "2px", background: "var(--color-border)", marginTop: "4px", minHeight: "12px" }} /> : null}
                    </div>
                    <div style={{ minWidth: 0, paddingBottom: "var(--space-1)" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)", flexWrap: "wrap" }}>
                        <span style={{ font: "var(--type-label)" }}>{s.svc}</span>
                        <span style={{ font: "var(--type-mono)", color: "var(--color-text-muted)" }}>{s.op}</span>
                      </div>
                      {s.note ? <div style={{ font: "var(--type-caption)", color: broke ? "var(--color-danger-on)" : "var(--color-text-muted)", marginTop: "2px" }}>{s.note}</div> : null}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexShrink: 0 }}>
                      <span style={{ font: "600 var(--text-label)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", color: broke ? "var(--color-danger-on)" : "var(--color-text)" }}>{s.ms >= 1000 ? `${(s.ms / 1000).toFixed(0)} s` : s.ms > 0 ? `${s.ms} ms` : "—"}</span>
                      <Badge tone={m.tone}>{m.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error rate */}
          <div style={panel}>
            <PanelHead title="ERP post error rate" right={<LivePulse />} />
            <div style={{ padding: "0 var(--space-5) var(--space-5)" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                <span className="rtc-live-val" key={Math.round(live)} style={{ font: "700 28px/1 var(--font-sans)", fontVariantNumeric: "tabular-nums", color: "var(--color-danger-on)" }}>{live.toFixed(1)}%</span>
                <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>last 30 min · threshold 5%</span>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="96" preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
                <line x1="0" y1={H - (5 / cmax) * (H - 4)} x2={W} y2={H - (5 / cmax) * (H - 4)} stroke="var(--color-danger-on)" strokeWidth="0.4" strokeDasharray="1.5 1.5" opacity="0.7" vectorEffect="non-scaling-stroke" />
                <line x1={(threshIdx / (chart.length - 1)) * W} y1="0" x2={(threshIdx / (chart.length - 1)) * W} y2={H} stroke="var(--color-text-disabled)" strokeWidth="0.4" strokeDasharray="1 2" vectorEffect="non-scaling-stroke" />
                <polygon points={`0,${H} ${pts} ${W},${H}`} fill="var(--color-danger)" opacity="0.14" />
                <polyline points={pts} fill="none" stroke="var(--color-danger-on)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", font: "var(--type-caption)", color: "var(--color-text-disabled)", marginTop: "4px" }}>
                <span>−30m</span><span style={{ color: "var(--color-danger-on)" }}>↑ breach at 14:08</span><span>now</span>
              </div>
            </div>
          </div>

          {/* Runbook */}
          <div style={panel}>
            <PanelHead title="Remediation runbook" right={<span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>2 of 6 done</span>} />
            <div style={{ padding: "var(--space-2) 0 var(--space-3)" }}>
              {steps.map((s, i) => <RunbookStep key={i} step={s} index={i} last={i === steps.length - 1} act={act} />)}
            </div>
          </div>
        </div>

        {/* ---- Right: war-room log + responders ---- */}
        <div style={{ display: "grid", gap: "var(--space-5)" }}>
          <div style={{ ...panel, display: "flex", flexDirection: "column", maxHeight: "560px" }}>
            <PanelHead title="War-room log" right={<LivePulse label="Streaming" />} />
            <div style={{ overflow: "auto", flex: 1 }}>
              {events.map((e, i) => (
                <div key={i} style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-3) var(--space-5)", borderTop: i ? "1px solid var(--color-border)" : "none" }}>
                  <span style={{ width: "28px", height: "28px", borderRadius: "var(--radius-md)", flexShrink: 0, display: "grid", placeItems: "center", background: surf[e.tone], color: tone[e.tone] }}><Icon name={e.icon} size={15} /></span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ font: "var(--type-body)", color: "var(--color-text)" }}>{e.msg}</div>
                    <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "2px" }}>
                      <span style={{ fontFamily: "var(--font-mono)" }}>{e.t}</span> · {e.who}{e.you ? " (you)" : ""} · {e.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "var(--space-3) var(--space-4)", borderTop: "1px solid var(--color-border)", display: "flex", gap: "var(--space-2)" }}>
              <input placeholder="Post an update…" style={{ flex: 1, minWidth: 0, height: "36px", padding: "0 12px", background: "var(--color-surface-sunken)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-control)", color: "var(--color-text)", font: "var(--type-body)", outline: "none" }} />
              <Button variant="primary" onClick={() => act("Update posted to war-room")}>Post</Button>
            </div>
          </div>

          <Panel title="Responders">
            <div style={{ display: "grid", gap: "var(--space-1)" }}>
              {responders.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-2) 0", borderTop: i ? "1px solid var(--color-border)" : "none" }}>
                  <Avatar name={r.name} size={32} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ font: "var(--type-label)" }}>{r.name}</div>
                    <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{r.role}</div>
                  </div>
                  <Badge tone={r.tone}>{r.status}</Badge>
                </div>
              ))}
            </div>
            <Button variant="ghost" iconStart={<Icon name="operators" size={16} />} onClick={() => act("Paging additional responder…")} style={{ marginTop: "var(--space-3)", width: "100%" }}>Page responder</Button>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ---- local building blocks ---- */
const panel = { border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", boxShadow: "var(--shadow-card)", overflow: "hidden" };

function PanelHead({ title, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
      <span style={{ font: "var(--type-title)" }}>{title}</span>
      {right || null}
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={{ ...panel, padding: "var(--space-4) var(--space-5) var(--space-5)" }}>
      <div style={{ font: "var(--type-title)", marginBottom: "var(--space-3)" }}>{title}</div>
      {children}
    </div>
  );
}

function ImpactStat({ label, value, tone, live, note, trend }) {
  const c = { danger: "var(--color-danger-on)", warning: "var(--color-warning-on)", success: "var(--color-success-on)", info: "var(--color-info-on)" }[tone] || "var(--color-text)";
  return (
    <div style={{ padding: "var(--space-2) 0" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-2)" }}>
        <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
        {trend ? <span style={{ font: "var(--type-caption)", color: c }}>↑ {trend}</span> : null}
      </div>
      <div className={live ? "rtc-live-val" : ""} key={live ? value : undefined} style={{ font: "700 20px/1.1 var(--font-sans)", fontVariantNumeric: "tabular-nums", color: c, marginTop: "3px", letterSpacing: "-0.01em" }}>{value}</div>
      {note ? <div style={{ font: "var(--type-caption)", color: "var(--color-text-disabled)", marginTop: "2px" }}>{note}</div> : null}
    </div>
  );
}

function KvLine({ k, v, mono }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-3)", padding: "var(--space-1) 0" }}>
      <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{k}</span>
      <span style={{ font: mono ? "var(--type-mono)" : "var(--type-label)", color: "var(--color-text)" }}>{v}</span>
    </div>
  );
}

function Meter({ label, pct, tone }) {
  const c = { danger: "var(--color-danger-on)", warning: "var(--color-warning-on)", success: "var(--color-success-on)" }[tone] || "var(--color-primary)";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "4px", alignItems: "center" }}>
      <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{label}</span>
      <span style={{ font: "600 var(--text-caption)/1 var(--font-mono)", color: "var(--color-text)" }}>{pct}%</span>
      <div style={{ gridColumn: "1 / -1", height: "7px", borderRadius: "9999px", background: "var(--color-surface-raised)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: "9999px", background: c }} />
      </div>
    </div>
  );
}

function RunbookStep({ step, index, last, act }) {
  const { Button, Icon } = DSwr;
  const done = step.state === "done";
  const active = step.state === "active";
  const mark = done
    ? { bg: "var(--color-success-surface)", fg: "var(--color-success-on)", ring: "var(--color-success-on)" }
    : active
      ? { bg: "var(--color-primary-subtle)", fg: "var(--color-accent)", ring: "var(--color-primary)" }
      : { bg: "var(--color-surface-raised)", fg: "var(--color-text-disabled)", ring: "var(--color-border-strong)" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "28px 1fr auto", gap: "var(--space-3)", alignItems: "start", padding: "var(--space-2) var(--space-5)", background: active ? "var(--color-primary-subtle)" : "transparent" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "stretch" }}>
        <span style={{ width: "28px", height: "28px", borderRadius: "9999px", display: "grid", placeItems: "center", flexShrink: 0, background: mark.bg, color: mark.fg, border: `1.5px solid ${mark.ring}` }}>
          {done ? <Icon name="check" size={15} strokeWidth={2.5} /> : <span style={{ font: "700 13px/1 var(--font-mono)" }}>{index + 1}</span>}
        </span>
        {!last ? <span style={{ flex: 1, width: "2px", background: "var(--color-border)", marginTop: "4px", minHeight: "10px" }} /> : null}
      </div>
      <div style={{ minWidth: 0, paddingBottom: "var(--space-2)" }}>
        <div style={{ font: "var(--type-label)", color: done ? "var(--color-text-muted)" : "var(--color-text)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          {step.label}
          {active ? <span style={{ font: "600 10px/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-accent)", background: "var(--color-surface)", border: "1px solid var(--color-primary)", borderRadius: "var(--radius-pill)", padding: "2px 7px" }}>Active</span> : null}
        </div>
        <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "2px" }}>{step.detail}</div>
      </div>
      {step.action ? (
        <Button variant={step.primary ? "primary" : "secondary"} onClick={() => act(`${step.label} — started`)} style={{ flexShrink: 0 }}>{step.action}</Button>
      ) : <span />}
    </div>
  );
}

Object.assign(window, { IncidentWarRoom });
