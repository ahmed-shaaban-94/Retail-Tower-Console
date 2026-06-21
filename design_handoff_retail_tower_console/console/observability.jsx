/* Retail Tower Console — UI kit: Observability tab.
 * Role-aware platform health + statistically-grounded business correlations.
 *
 * The "role lens" models the real operator hierarchy. The SYSTEM OWNER
 * (Platform Admin — you) sees everything, un-redacted. Each role below sees a
 * tailored KPI set, a subset of tabs, a narrower scope, and — for the business
 * correlations — appropriate visibility of revenue figures.
 *
 * Correlations are shown as scatter + least-squares regression with a real
 * Pearson r computed from the sample, a residual confidence band, n / window /
 * lag / p methodology, and a ranked business-impact view. Uses charts.jsx +
 * widgets.jsx primitives; gold stays authority-only, navy/teal drive the data. */

const DSo = window.RetailTowerConsoleDesignSystem_b7c448;

/* ============================ ROLE MODEL ============================ */
const OBS_ROLES = {
  platform: {
    label: "Platform Admin", short: "Platform", icon: "tower", you: true,
    desc: "That's you — the system owner. Full visibility across every tenant, service and money flow. Nothing is redacted.",
    scopeLabel: "all tenants · platform-wide",
    tabs: ["overview", "services", "correlations", "incidents"],
    revenue: true, infra: true, crossScope: true, storeOnly: false,
    kpis: ["uptime", "p95", "err", "events", "revPlatform", "activeStores"],
  },
  support: {
    label: "Support Engineer", short: "Support", icon: "settings",
    desc: "Service & infrastructure health across all tenants. Business and revenue figures are restricted to operators with a commercial role.",
    scopeLabel: "all tenants · infrastructure",
    tabs: ["overview", "services", "correlations", "incidents"],
    revenue: false, infra: true, crossScope: true, storeOnly: false,
    kpis: ["uptime", "p95", "err", "events", "sync", "stores"],
  },
  tenantOwner: {
    label: "Tenant Owner", short: "Owner", icon: "stores",
    desc: "Owner view for {tenant} — revenue, sync and store health for your business. Platform internals are hidden.",
    scopeLabel: "{tenant}",
    tabs: ["overview", "correlations", "incidents"],
    revenue: true, infra: false, crossScope: false, storeOnly: false,
    kpis: ["revAtRisk", "onTime", "salesVel", "sync", "unknown", "stores"],
  },
  tenantAdmin: {
    label: "Tenant Admin", short: "Admin", icon: "operators",
    desc: "Operational health for {tenant} — sync, catalog and store status. Financial detail is summarised, not itemised.",
    scopeLabel: "{tenant}",
    tabs: ["overview", "correlations", "incidents"],
    revenue: true, infra: false, crossScope: false, storeOnly: false,
    kpis: ["sync", "stores", "unknown", "unposted", "onTime", "openInc"],
  },
  store: {
    label: "Store Manager", short: "Store", icon: "stores",
    desc: "Single-store view — {store}. Today's sales, sync, returns and stock for your floor only.",
    scopeLabel: "{tenant} › {store}",
    tabs: ["overview", "correlations", "incidents"],
    revenue: true, infra: false, crossScope: false, storeOnly: true,
    kpis: ["salesToday", "sync", "unknown", "returns", "basket", "stockouts"],
  },
};

/* ===================== STATISTICS (real, not faked) ===================== */
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function genPairs(seed, n, noise) {
  const rnd = mulberry32(seed);
  const xs = [], ys = [];
  for (let i = 0; i < n; i++) {
    const x = rnd();
    let y = x + (rnd() - 0.5) * noise;
    y = Math.max(0, Math.min(1, y));
    xs.push(x); ys.push(y);
  }
  return { xs, ys };
}
function pearson(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  return sxy / Math.sqrt(sxx * syy || 1);
}
function linreg(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) { const dx = xs[i] - mx; sxy += dx * (ys[i] - my); sxx += dx * dx; }
  const b = sxy / (sxx || 1), a = my - b * mx;
  let sse = 0; for (let i = 0; i < n; i++) { const e = ys[i] - (a + b * xs[i]); sse += e * e; }
  const sd = Math.sqrt(sse / (n - 2));
  return { a, b, sd };
}

/* Build the correlation dataset once (stable across renders). */
const CORR_DEFS = [
  { key: "erp", signalLabel: "ERP sync lag", outcomeLabel: "Delayed invoices", seed: 7, noise: 0.34, lag: "~18 min",
    insight: "When connector lag passes ~30s, invoice posting backs up within the same hour.",
    impactLabel: "Revenue unposted · 24h", impact: "EGP 1.24M", impactVal: 1240000, sub: "412 invoices queued",
    xUnit: "0–60s", yUnit: "0–40 inv", storeRelevant: false },
  { key: "lat", signalLabel: "API p95 latency", outcomeLabel: "Checkout drop-off", seed: 13, noise: 0.62, lag: "~4 min",
    insight: "Counter latency over 250ms tracks abandoned baskets at the POS.",
    impactLabel: "Lost baskets · 24h", impact: "EGP 184K", impactVal: 184000, sub: "312 baskets dropped",
    xUnit: "120–320ms", yUnit: "0–30", storeRelevant: true },
  { key: "unk", signalLabel: "Unknown-item rate", outcomeLabel: "Lost basket value", seed: 29, noise: 0.86, lag: "~1 hr",
    insight: "Unscanned items force manual overrides, leaking margin on each ticket.",
    impactLabel: "Margin leak · daily", impact: "EGP 47K", impactVal: 47000, sub: "1.8% of tickets",
    xUnit: "0–28%", yUnit: "EGP", storeRelevant: true },
  { key: "pos", signalLabel: "POS sync gap", outcomeLabel: "Phantom stockouts", seed: 53, noise: 0.7, lag: "~35 min",
    insight: "Sync gaps leave on-hand counts stale, hiding items that are physically present.",
    impactLabel: "Recovered value · 24h", impact: "EGP 92K", impactVal: 92000, sub: "28 SKUs affected",
    xUnit: "0–90s", yUnit: "SKUs", storeRelevant: true },
].map((c) => {
  const { xs, ys } = genPairs(c.seed, 96, c.noise);
  const r = Math.abs(pearson(xs, ys));
  const reg = linreg(xs, ys);
  return { ...c, xs, ys, r, reg, n: xs.length };
});

/* ============================ SMALL UI ============================ */
function RoleLens({ role, onChange }) {
  const { Icon } = DSo;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "4px", background: "var(--color-surface-sunken)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-control)", flexWrap: "wrap" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "0 var(--space-2) 0 var(--space-3)", font: "600 var(--text-caption)/1 var(--font-sans)", letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
        <Icon name="operators" size={14} /> Viewing as
      </span>
      {Object.entries(OBS_ROLES).map(([id, r]) => {
        const on = id === role;
        return (
          <button key={id} type="button" onClick={() => onChange(id)}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "30px", padding: "0 var(--space-3)", borderRadius: "var(--radius-md)", cursor: "pointer", whiteSpace: "nowrap", font: "var(--type-label)", color: on ? "#fff" : "var(--color-text-muted)", background: on ? "var(--color-primary)" : "transparent", border: on ? "1px solid var(--color-primary)" : "1px solid transparent" }}>
            <Icon name={r.icon} size={14} />{r.label}
            {r.you ? <span style={{ font: "700 9px/1 var(--font-sans)", letterSpacing: "0.08em", color: on ? "var(--color-gold-marker)" : "var(--color-gold-strong)", border: `1px solid ${on ? "var(--color-gold-marker)" : "var(--color-gold-strong)"}`, borderRadius: "var(--radius-pill)", padding: "2px 5px", textTransform: "uppercase" }}>You</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function StrengthChip({ r }) {
  const { Badge } = DSo;
  const tone = r >= 0.75 ? "danger" : r >= 0.5 ? "warning" : "info";
  const label = r >= 0.75 ? "Strong" : r >= 0.5 ? "Moderate" : "Weak";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
      <Badge tone={tone}>{label}</Badge>
      <span style={{ font: "600 var(--text-label)/1 var(--font-mono)", color: "var(--color-text-muted)", fontVariantNumeric: "tabular-nums" }}>r {r.toFixed(2)}</span>
    </span>
  );
}

/* Scatter + least-squares regression with a residual confidence band. */
function Scatter({ c, accent }) {
  const W = 360, H = 208, padL = 30, padR = 14, padT = 14, padB = 26;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const px = (x) => padL + x * plotW;
  const py = (y) => padT + (1 - y) * plotH;
  const { a, b, sd } = c.reg;
  const lineY = (x) => Math.max(0, Math.min(1, a + b * x));
  const bandPts = [
    `${px(0)},${py(Math.min(1, a + sd))}`, `${px(1)},${py(Math.min(1, a + b + sd))}`,
    `${px(1)},${py(Math.max(0, a + b - sd))}`, `${px(0)},${py(Math.max(0, a - sd))}`,
  ].join(" ");
  const grid = [0, 0.25, 0.5, 0.75, 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {grid.map((g, i) => (
        <g key={i}>
          <line x1={px(g)} y1={padT} x2={px(g)} y2={padT + plotH} stroke="var(--color-border)" strokeWidth="1" opacity="0.45" />
          <line x1={padL} y1={py(g)} x2={padL + plotW} y2={py(g)} stroke="var(--color-border)" strokeWidth="1" opacity="0.45" />
        </g>
      ))}
      {/* residual band */}
      <polygon points={bandPts} fill={accent} opacity="0.1" />
      {/* points, faded by recency (older = fainter) */}
      {c.xs.map((x, i) => (
        <circle key={i} cx={px(x)} cy={py(c.ys[i])} r="2.4" fill={accent} opacity={0.22 + 0.6 * (i / c.n)} />
      ))}
      {/* regression line */}
      <line x1={px(0)} y1={py(lineY(0))} x2={px(1)} y2={py(lineY(1))} stroke="var(--color-warning-on)" strokeWidth="2.5" strokeLinecap="round" />
      {/* r² badge */}
      <g>
        <rect x={padL + 6} y={padT + 6} width="62" height="20" rx="5" fill="var(--color-surface-overlay)" stroke="var(--color-border)" />
        <text x={padL + 37} y={padT + 20} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--color-text)">r² {(c.r * c.r).toFixed(2)}</text>
      </g>
      {/* axis labels */}
      <text x={padL + plotW} y={H - 6} textAnchor="end" fontSize="10" fontFamily="var(--font-sans)" fill="var(--color-text-disabled)">{c.signalLabel} →</text>
      <text x={padL - 4} y={padT + 4} transform={`rotate(-90 ${padL - 4} ${padT + 4})`} textAnchor="end" fontSize="10" fontFamily="var(--font-sans)" fill="var(--color-text-disabled)">{c.outcomeLabel} ↑</text>
    </svg>
  );
}

function MethChip({ k, v }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: "5px", height: "24px", padding: "0 9px", borderRadius: "var(--radius-pill)", background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", whiteSpace: "nowrap" }}>
      <span style={{ font: "var(--type-caption)", color: "var(--color-text-disabled)" }}>{k}</span>
      <span style={{ font: "600 var(--text-caption)/1 var(--font-mono)", color: "var(--color-text)", fontVariantNumeric: "tabular-nums" }}>{v}</span>
    </span>
  );
}

function CorrCard({ c, showRevenue }) {
  const { Icon } = DSo;
  return (
    <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-3)", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-3)" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", font: "var(--type-title)" }}>
            <span style={{ color: "var(--color-accent)" }}>{c.signalLabel}</span>
            <span style={{ color: "var(--color-text-disabled)" }}><Icon name="chevron" size={16} style={{ transform: "rotate(-90deg)" }} /></span>
            <span style={{ color: "var(--color-warning-on)" }}>{c.outcomeLabel}</span>
          </div>
          <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "4px", textWrap: "pretty" }}>{c.insight}</div>
        </div>
        <div style={{ flexShrink: 0 }}><StrengthChip r={c.r} /></div>
      </div>

      <Scatter c={c} accent="var(--color-accent)" />

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <MethChip k="n" v={c.n} />
        <MethChip k="window" v="14d" />
        <MethChip k="lag" v={c.lag} />
        <MethChip k="p" v="<0.01" />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", paddingTop: "var(--space-3)", borderTop: "1px solid var(--color-border)" }}>
        <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{c.impactLabel}<br /><span style={{ color: "var(--color-text-disabled)" }}>{c.sub}</span></span>
        <div style={{ textAlign: "right" }}>
          {showRevenue ? (
            <div style={{ font: "700 var(--text-headline)/1.05 var(--font-sans)", color: "var(--color-danger-on)", fontVariantNumeric: "tabular-nums" }}>{c.impact}</div>
          ) : (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", font: "var(--type-label)", color: "var(--color-text-disabled)" }}>
              <Icon name="audit" size={14} /> Restricted
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Ranked business-impact (revenue) or strength (support) drivers. */
function DriverRanking({ corrs, showRevenue }) {
  const sorted = [...corrs].sort((a, b) => (showRevenue ? b.impactVal - a.impactVal : b.r - a.r));
  const max = showRevenue ? sorted[0].impactVal : 1;
  const fmt = (v) => (v >= 1e6 ? `EGP ${(v / 1e6).toFixed(2)}M` : `EGP ${Math.round(v / 1e3)}K`);
  return (
    <div style={{ display: "grid", gap: "var(--space-1)" }}>
      {sorted.map((c) => {
        const w = showRevenue ? c.impactVal / max : c.r;
        return (
          <div key={c.key} style={{ display: "grid", gridTemplateColumns: "minmax(180px, 1.1fr) 1fr auto", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-2) 0", borderBottom: "1px solid var(--color-border)" }}>
            <span style={{ font: "var(--type-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <span style={{ color: "var(--color-accent)" }}>{c.signalLabel}</span>
              <span style={{ color: "var(--color-text-disabled)" }}> → </span>
              <span style={{ color: "var(--color-text-muted)" }}>{c.outcomeLabel}</span>
            </span>
            <div style={{ height: "10px", borderRadius: "9999px", background: "var(--color-surface-raised)", overflow: "hidden" }}>
              <div style={{ width: `${Math.max(4, Math.round(w * 100))}%`, height: "100%", borderRadius: "9999px", background: showRevenue ? "var(--color-danger-on)" : "var(--color-accent)" }} />
            </div>
            <span style={{ font: "700 var(--text-label)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--color-text)", minWidth: "92px", textAlign: "right" }}>
              {showRevenue ? fmt(c.impactVal) : `r ${c.r.toFixed(2)}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* Signal × outcome correlation matrix with numeric cells. */
function CorrMatrix() {
  const rows = ["ERP lag", "API p95", "Err rate", "Unknown", "POS gap"];
  const cols = ["Inv. delay", "Checkout", "Lost basket", "Stockout", "Refunds"];
  const m = [
    [86, 41, 33, 22, 18],
    [38, 71, 47, 19, 12],
    [52, 44, 39, 24, 31],
    [16, 35, 58, 27, 14],
    [29, 21, 26, 64, 19],
  ];
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: `92px repeat(${cols.length}, minmax(70px, 1fr))`, gap: "4px", minWidth: "520px" }}>
        <span />
        {cols.map((c) => <span key={c} style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", textAlign: "center", paddingBottom: "4px" }}>{c}</span>)}
        {m.map((row, ri) => (
          <React.Fragment key={ri}>
            <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "8px" }}>{rows[ri]}</span>
            {row.map((v, ci) => {
              const t = v / 100;
              const strong = t > 0.55;
              return (
                <div key={ci} title={`r ${(v / 100).toFixed(2)}`} style={{ height: "40px", display: "grid", placeItems: "center", borderRadius: "var(--radius-sm)", background: `color-mix(in oklab, var(--color-primary) ${Math.round(12 + t * 78)}%, var(--color-surface))`, border: "1px solid var(--color-border)", font: "600 var(--text-label)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", color: strong ? "#fff" : "var(--color-text-muted)" }}>
                  {(v / 100).toFixed(2)}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ============================ SCREEN ============================ */
function Observability({ scope }) {
  const { Button, Badge, Icon, Banner } = DSo;
  const { KpiCard, ComboChart, Donut, Panel } = window;
  const { Tabs, useLive, jitter, LivePulse } = window;
  const Table = window.Table, PageHeader = window.PageHeader;

  const [role, setRole] = React.useState(() => {
    try { const s = localStorage.getItem("rtc-obs-role"); return OBS_ROLES[s] ? s : "platform"; } catch (e) { return "platform"; }
  });
  React.useEffect(() => { try { localStorage.setItem("rtc-obs-role", role); } catch (e) {} }, [role]);
  const cfg = OBS_ROLES[role];

  const [tab, setTab] = React.useState("overview");
  React.useEffect(() => { if (!cfg.tabs.includes(tab)) setTab(cfg.tabs[0]); }, [role]);

  const tick = useLive(2600);
  const evMin = Math.round(jitter(1284, 7, tick, 2));
  const p95 = Math.round(jitter(142, 9, tick, 5));
  const errRate = jitter(0.04, 22, tick, 9).toFixed(2);

  const storeName = scope.store && scope.store !== "All stores" ? scope.store : "Cairo Festival City";
  const fill = (s) => s.replace("{tenant}", scope.tenant).replace("{store}", storeName);

  /* KPI pool. */
  const KPIS = {
    uptime: { icon: "activity", tone: "success", label: "Uptime (7d)", value: "99.98", unit: "%", delta: "0.02pp", deltaDir: "up", sub: "vs prev 7d", spark: [99.9, 99.95, 99.92, 99.99, 99.97, 99.98, 99.98], sparkColor: "var(--color-success-on)" },
    p95: { icon: "gauge", tone: "info", label: "p95 latency", value: String(p95), unit: "ms", delta: "8.4%", deltaDir: "up", sub: "faster vs 7d", spark: [168, 160, 150, 145, 148, 142, 138], sparkColor: "var(--color-info-on)" },
    err: { icon: "alert", tone: "danger", label: "Error rate", value: errRate, unit: "%", delta: "0.01pp", deltaDir: "up", sub: "lower vs 7d", spark: [0.09, 0.07, 0.08, 0.05, 0.06, 0.04, 0.04], sparkColor: "var(--color-danger-on)" },
    events: { icon: "signal", tone: "primary", label: "Events / min", value: evMin.toLocaleString(), unit: "", delta: "12.6%", deltaDir: "up", sub: "vs prev 7d", spark: [820, 910, 1040, 1180, 980, 1284, 1120], sparkColor: "var(--color-accent)" },
    sync: { icon: "link", tone: "warning", label: "Sync success", value: "99.71", unit: "%", delta: "0.30pp", deltaDir: "up", sub: "ERP outbox", spark: [99.2, 99.4, 99.1, 99.6, 99.5, 99.71, 99.7], sparkColor: "var(--color-warning-on)" },
    stores: { icon: "stores", tone: "success", label: "Stores online", value: cfg.crossScope ? "36" : "12", unit: cfg.crossScope ? "/ 42" : "/ 14", delta: null, sub: cfg.crossScope ? "85.7% online" : "your tenant", spark: [34, 35, 33, 36, 35, 36, 36], sparkColor: "var(--color-success-on)" },
    activeStores: { icon: "stores", tone: "primary", label: "Active stores", value: "412", unit: "/ 480", delta: "9", deltaDir: "up", sub: "across 9 tenants", spark: [380, 392, 401, 405, 408, 410, 412], sparkColor: "var(--color-accent)" },
    revPlatform: { icon: "audit", tone: "danger", label: "Revenue at risk", value: "EGP 6.8M", unit: "", delta: "EGP 1.1M", deltaDir: "down", sub: "platform · unposted", spark: [4.2, 5.1, 6.0, 6.4, 6.2, 6.8, 6.6], sparkColor: "var(--color-danger-on)" },
    revAtRisk: { icon: "audit", tone: "danger", label: "Revenue at risk", value: "EGP 1.24M", unit: "", delta: "EGP 310K", deltaDir: "down", sub: "unposted to ERP", spark: [0.4, 0.6, 0.9, 1.1, 1.0, 1.24, 1.18], sparkColor: "var(--color-danger-on)" },
    onTime: { icon: "clock", tone: "warning", label: "On-time posting", value: "94.2", unit: "%", delta: "2.1pp", deltaDir: "down", sub: "invoices < 5 min", spark: [98, 97, 96, 95, 95, 94.2, 94], sparkColor: "var(--color-warning-on)" },
    salesVel: { icon: "signal", tone: "primary", label: "Sales velocity", value: "EGP 1.9M", unit: "/day", delta: "4.1%", deltaDir: "up", sub: "tenant · 7d avg", spark: [1.6, 1.7, 1.65, 1.8, 1.78, 1.9, 1.88], sparkColor: "var(--color-accent)" },
    unposted: { icon: "audit", tone: "danger", label: "Unposted invoices", value: "412", unit: "", delta: "98", deltaDir: "down", sub: "in ERP outbox", spark: [180, 240, 320, 380, 360, 412, 400], sparkColor: "var(--color-danger-on)" },
    unknown: { icon: "unknown", tone: "info", label: "Unknown items", value: "24", unit: "open", delta: "6", deltaDir: "down", sub: "awaiting review", spark: [42, 38, 34, 30, 28, 26, 24], sparkColor: "var(--color-info-on)" },
    openInc: { icon: "alert", tone: "warning", label: "Open incidents", value: "2", unit: "", delta: null, sub: "your scope", spark: [1, 2, 1, 3, 2, 2, 2], sparkColor: "var(--color-warning-on)" },
    salesToday: { icon: "gauge", tone: "success", label: "Sales today", value: "EGP 482K", unit: "", delta: "6.2%", deltaDir: "up", sub: storeName, spark: [60, 120, 210, 290, 360, 430, 482], sparkColor: "var(--color-success-on)" },
    returns: { icon: "unknown", tone: "warning", label: "Returns rate", value: "2.4", unit: "%", delta: "0.3pp", deltaDir: "down", sub: "of tickets", spark: [3.1, 2.9, 2.8, 2.6, 2.5, 2.4, 2.4], sparkColor: "var(--color-warning-on)" },
    basket: { icon: "catalog", tone: "info", label: "Avg basket", value: "EGP 318", unit: "", delta: "1.8%", deltaDir: "up", sub: "vs 7d", spark: [298, 304, 310, 308, 314, 318, 318], sparkColor: "var(--color-info-on)" },
    stockouts: { icon: "alert", tone: "danger", label: "Phantom stockouts", value: "28", unit: "SKUs", delta: null, sub: "sync-driven", spark: [12, 18, 22, 30, 26, 28, 28], sparkColor: "var(--color-danger-on)" },
  };
  const kpis = cfg.kpis.map((k) => KPIS[k]).filter(Boolean);

  const services = [
    { svc: "Data-Pulse-2 API", status: ["success", "Operational"], p95: "138 ms", err: "0.03%", up: "99.99%", chk: "12s ago" },
    { svc: "POS-Pulse Sync", status: ["success", "Operational"], p95: "210 ms", err: "0.08%", up: "99.94%", chk: "20s ago" },
    { svc: "ERPNext Connector", status: ["warning", "Degraded"], p95: "612 ms", err: "1.20%", up: "99.40%", chk: "31s ago" },
    { svc: "Auth / Session", status: ["success", "Operational"], p95: "84 ms", err: "0.01%", up: "100.0%", chk: "9s ago" },
    { svc: "Database", status: ["success", "Operational"], p95: "22 ms", err: "0.00%", up: "99.99%", chk: "15s ago" },
  ];
  const integrations = [
    { name: "ERPNext / Frappe", tone: "success", label: "Healthy" },
    { name: "Data-Pulse-2", tone: "success", label: "Healthy" },
    { name: "POS-Pulse", tone: "success", label: "Healthy" },
    { name: "ERPNext Connector", tone: "warning", label: "Degraded" },
    { name: "Frappe Orchestration", tone: "success", label: "Healthy" },
  ];
  const systemStatus = [["API", "success"], ["Database", "success"], ["Queue", "warning"], ["Workers", "success"], ["Storage", "success"], ["Cache", "success"]];

  const allIncidents = [
    { t: "21:58:04", sev: ["danger", "Sev-2"], svc: "ERPNext Connector", sum: "Invoice post retries spiking (12 failed)", req: "7e21…4c", tenant: "Northstar Retail", mine: true },
    { t: "20:40:11", sev: ["warning", "Sev-3"], svc: "POS-Pulse Sync", sum: "Sync lag 45s on Branch 04", req: "c2e0…11", tenant: "Northstar Retail", mine: true },
    { t: "19:12:03", sev: ["warning", "Sev-3"], svc: "ERPNext Connector", sum: "Webhook backlog on Helios tenant", req: "f5b2…88", tenant: "Helios Markets", mine: false },
    { t: "18:12:55", sev: ["info", "Resolved"], svc: "Data-Pulse-2 API", sum: "Latency spike, auto-recovered in 90s", req: "a91f…3d", tenant: "Platform", mine: true },
    { t: "14:03:39", sev: ["info", "Resolved"], svc: "Database", sum: "Replica failover completed cleanly", req: "8c34…07", tenant: "Platform", mine: false },
  ];
  const incidents = cfg.crossScope ? allIncidents : allIncidents.filter((i) => i.mine);

  const visibleCorrs = cfg.storeOnly ? CORR_DEFS.filter((c) => c.storeRelevant) : CORR_DEFS;

  const tabItems = [
    { id: "overview", label: "Overview" },
    { id: "services", label: "Services & Infra" },
    { id: "correlations", label: "Business Correlations", count: visibleCorrs.length },
    { id: "incidents", label: "Incidents", count: incidents.length },
  ].filter((it) => cfg.tabs.includes(it.id));

  return (
    <div>
      <PageHeader
        title="Observability"
        subtitle={`Platform health & business signals · ${fill(cfg.scopeLabel)} · last 7 days`}
        actions={<>
          <LivePulse />
          <Button variant="secondary" iconStart={<Icon name="clock" size={16} />}>Jun 1 – Jun 7</Button>
          <Button variant="ghost" iconStart={<Icon name="activity" size={16} />}>Refresh</Button>
        </>}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap", marginBottom: "var(--space-5)" }}>
        <RoleLens role={role} onChange={setRole} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", font: "var(--type-caption)", color: "var(--color-text-muted)", flex: 1, minWidth: "240px", textWrap: "pretty" }}>
          <span style={{ color: "var(--color-gold-marker)", flexShrink: 0 }}><Icon name="info" size={15} /></span>
          {fill(cfg.desc)}
        </div>
      </div>

      <Tabs items={tabItems} active={tab} onChange={setTab} />

      {/* ---- OVERVIEW ---- */}
      {tab === "overview" ? (
        <div className="rtc-screen">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
            {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.75fr 1fr", gap: "var(--space-5)" }}>
            <Panel title="Request throughput &amp; p95 latency"
              action={<div style={{ display: "flex", gap: "var(--space-4)", font: "var(--type-caption)", color: "var(--color-text-muted)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--color-primary)" }} />req/min</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "2px", background: "var(--color-accent)" }} />p95 ms</span>
              </div>}>
              <ComboChart labels={["May 28", "May 29", "May 30", "May 31", "Jun 1", "Jun 2", "Jun 3"]} bars={[820, 910, 1040, 1180, 980, 1284, evMin]} line={[128, 135, 150, 142, 138, 142, p95]} barMax={1400} lineMax={300} />
            </Panel>
            <div style={{ display: "grid", gap: "var(--space-5)", alignContent: "start" }}>
              <Panel title="Integration health" action={<span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>5 sources</span>}>
                <div style={{ display: "grid", gap: "var(--space-1)" }}>
                  {integrations.map((it) => (
                    <div key={it.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-2) 0", borderBottom: "1px solid var(--color-border)" }}>
                      <span style={{ font: "var(--type-body)" }}>{it.name}</span>
                      <Badge tone={it.tone}>{it.label}</Badge>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel title="Events by source">
                <Donut segments={[
                  { label: "Data-Pulse-2", value: 62, color: "var(--color-primary)" },
                  { label: "POS-Pulse", value: 24, color: "var(--color-accent)" },
                  { label: "ERPNext", value: 9, color: "var(--color-warning-on)" },
                  { label: "Auth / Session", value: 5, color: "var(--color-text-muted)" },
                ]} />
              </Panel>
            </div>
          </div>
        </div>
      ) : null}

      {/* ---- SERVICES & INFRA ---- */}
      {tab === "services" ? (
        <div className="rtc-screen">
          <h2 style={{ font: "var(--type-headline)", letterSpacing: "var(--tracking-headline)", margin: "0 0 var(--space-3)" }}>Services</h2>
          <div style={{ marginBottom: "var(--space-6)" }}>
            <Table
              columns={[
                { label: "Service", render: (r) => r.svc },
                { label: "Status", render: (r) => <Badge tone={r.status[0]}>{r.status[1]}</Badge> },
                { label: "p95", align: "right", mono: true, render: (r) => r.p95 },
                { label: "Error rate", align: "right", mono: true, muted: true, render: (r) => r.err },
                { label: "Uptime", align: "right", mono: true, muted: true, render: (r) => r.up },
                { label: "Last check", muted: true, mono: true, render: (r) => r.chk },
              ]}
              rows={services}
            />
          </div>
          <Panel title="System status overview" action={<Badge tone="success">All systems operational</Badge>}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "var(--space-4)" }}>
              {systemStatus.map(([name, tone]) => (
                <div key={name} style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--color-surface-raised)" }}>
                  <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{name}</span>
                  <Badge tone={tone}>{tone === "warning" ? "Degraded" : "Healthy"}</Badge>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      ) : null}

      {/* ---- BUSINESS CORRELATIONS ---- */}
      {tab === "correlations" ? (
        <div className="rtc-screen">
          {!cfg.revenue ? (
            <div style={{ marginBottom: "var(--space-5)" }}>
              <Banner tone="info" icon={<Icon name="info" size={16} />} requestId="rbac-obs-9f2">
                Revenue and business-impact figures are restricted for the Support Engineer role. Correlation strength, sample and technical signals stay visible.
              </Banner>
            </div>
          ) : null}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)", alignItems: "start", marginBottom: "var(--space-6)" }} className="rtc-corr">
            <Panel title="What it costs the business" action={<span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{cfg.revenue ? "ranked by impact" : "ranked by strength"}</span>}>
              <DriverRanking corrs={visibleCorrs} showRevenue={cfg.revenue} />
            </Panel>
            {!cfg.storeOnly ? (
              <Panel title="Correlation matrix" action={<span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>signal × outcome · darker = stronger</span>}>
                <CorrMatrix />
              </Panel>
            ) : (
              <Panel title="How to read this" action={null}>
                <p style={{ font: "var(--type-body)", color: "var(--color-text-muted)", margin: 0, textWrap: "pretty" }}>
                  Each chart plots a technical signal (→ x) against the business outcome it drives (↑ y). The navy line is the
                  least-squares fit; r² shows how tightly they move together. Tighter clouds around the line = a stronger, more
                  reliable relationship you can act on.
                </p>
              </Panel>
            )}
          </div>

          <h2 style={{ font: "var(--type-headline)", letterSpacing: "var(--tracking-headline)", margin: "0 0 var(--space-3)" }}>Signal → outcome</h2>
          <div className="rtc-corr" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
            {visibleCorrs.map((c) => <CorrCard key={c.key} c={c} showRevenue={cfg.revenue} />)}
          </div>
        </div>
      ) : null}

      {/* ---- INCIDENTS ---- */}
      {tab === "incidents" ? (
        <div className="rtc-screen">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 var(--space-3)" }}>
            <h2 style={{ font: "var(--type-headline)", letterSpacing: "var(--tracking-headline)", margin: 0 }}>Recent incidents</h2>
            {cfg.crossScope ? <Badge tone="success">All tenants</Badge> : <Badge tone="info">Scoped to {scope.tenant}</Badge>}
          </div>
          <Table
            columns={[
              { label: "Time", align: "right", mono: true, render: (r) => r.t },
              { label: "Severity", render: (r) => <Badge tone={r.sev[0]} dot={r.sev[1] !== "Resolved"}>{r.sev[1]}</Badge> },
              { label: "Service", render: (r) => r.svc },
              ...(cfg.crossScope ? [{ label: "Tenant", muted: true, render: (r) => r.tenant }] : []),
              { label: "Summary", muted: true, render: (r) => r.sum },
              { label: "Req", mono: true, muted: true, render: (r) => r.req },
              { label: "", render: () => <Button variant="ghost" size="sm">Inspect</Button> },
            ]}
            rows={incidents}
          />
        </div>
      ) : null}
    </div>
  );
}

Object.assign(window, { Observability });
