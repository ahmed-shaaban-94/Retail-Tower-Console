/* Retail Tower Console — COMMAND DESK (signature flagship).
 * "The Lit Command Desk." The whole platform as one live topology: the Tower at the
 * hub, integrations feeding in, regions & stores branching out — telemetry flowing
 * along the links, a vitals spine, and a real-time command log. Data-viz, not decor.
 * Composes design-system primitives; gold stays authority-only (hub + active marker). */

const DScmd2 = window.RetailTowerConsoleDesignSystem_b7c448;

function CommandDesk({ scope }) {
  const { Button, Badge, Icon } = DScmd2;
  const PageHeader = window.PageHeader;
  const { useLive, jitter, LivePulse } = window;
  const tick = useLive(2400);

  const cx = 500, cy = 320;

  const integrations = [
    { id: "erpnext", label: "ERPNext", sub: "ERP / back office", health: "success", x: 150, y: 130, flow: true, m: { "p95": "138 ms", "Errors": "0.03%", "Uptime": "99.99%" } },
    { id: "pos", label: "POS-Pulse", sub: "Point of sale", health: "success", x: 150, y: 270, flow: true, m: { "p95": "210 ms", "Errors": "0.08%", "Uptime": "99.94%" } },
    { id: "dp2", label: "Data-Pulse-2", sub: "Data pipeline", health: "success", x: 150, y: 410, flow: true, m: { "p95": "84 ms", "Errors": "0.01%", "Uptime": "100.0%" } },
    { id: "frappe", label: "Frappe Orch.", sub: "Workflow engine", health: "warning", x: 270, y: 540, flow: true, m: { "p95": "612 ms", "Errors": "1.20%", "Uptime": "99.40%" } },
  ];

  const stores = {
    cairo: [
      { id: "CFC-01", label: "Cairo Festival City", health: "success", x: 905, y: 70, sales: "412,250", term: 12, tx: "2,145" },
      { id: "MOE-02", label: "Mall of Egypt", health: "success", x: 945, y: 150, sales: "358,920", term: 10, tx: "1,876" },
      { id: "CSH-03", label: "City Stars", health: "warning", x: 905, y: 228, sales: "298,410", term: 8, tx: "1,512" },
    ],
    alex: [
      { id: "ALX-05", label: "Alexandria Corniche", health: "danger", x: 960, y: 330, sales: "198,330", term: 5, tx: "1,021" },
      { id: "SMU-06", label: "Smouha Center", health: "success", x: 905, y: 405, sales: "176,540", term: 6, tx: "964" },
    ],
    delta: [
      { id: "MAD-04", label: "Maadi Grand", health: "success", x: 905, y: 500, sales: "245,600", term: 7, tx: "1,243" },
      { id: "TNT-07", label: "Tanta Plaza", health: "success", x: 945, y: 575, sales: "132,210", term: 4, tx: "742" },
    ],
  };
  const regions = [
    { id: "cairo", label: "Greater Cairo", health: "success", x: 740, y: 150, count: 18 },
    { id: "alex", label: "Alexandria", health: "warning", x: 815, y: 360, count: 9 },
    { id: "delta", label: "Nile Delta", health: "success", x: 740, y: 540, count: 15 },
  ];

  const hub = { id: "hub", label: "Retail Tower OS", sub: scope.tenant, health: "gold", x: cx, y: cy };

  const tone = { success: "var(--color-success-on)", warning: "var(--color-warning-on)", danger: "var(--color-danger-on)", gold: "var(--color-gold-marker)" };
  const surf = { success: "var(--color-success-surface)", warning: "var(--color-warning-surface)", danger: "var(--color-danger-surface)", gold: "var(--color-gold-soft)" };

  // flatten nodes for lookup
  const allNodes = {};
  [hub, ...integrations, ...regions].forEach((n) => (allNodes[n.id] = n));
  Object.values(stores).flat().forEach((n) => (allNodes[n.id] = n));

  const [sel, setSel] = React.useState("hub");
  const node = allNodes[sel] || hub;

  // ---- navigable map: zoom / pan / fly-to ----
  const svgRef = React.useRef(null);
  const [view, setView] = React.useState({ k: 1, x: 0, y: 0 });
  const [anim, setAnim] = React.useState(true);
  const drag = React.useRef(null);
  const reduce = (typeof window.matchMedia !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) || document.documentElement.getAttribute("data-motion") === "off";
  const clampK = (k) => Math.max(0.6, Math.min(3.2, k));
  function zoomBy(f) { setAnim(true); setView((v) => { const k = clampK(v.k * f), cx = 500, cy = 320; return { k, x: cx - (cx - v.x) * (k / v.k), y: cy - (cy - v.y) * (k / v.k) }; }); }
  function focusNode(n) { setAnim(true); const K = 2.0; setView({ k: K, x: 500 - n.x * K, y: 320 - n.y * K }); }
  function resetView() { setAnim(true); setView({ k: 1, x: 0, y: 0 }); }
  function pick(n) { setSel(n.id); if (n.id === "hub") resetView(); else focusNode(n); }
  function onWheel(e) { e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.12 : 0.892); }
  function onDown(e) { setAnim(false); drag.current = { px: e.clientX, py: e.clientY, x: view.x, y: view.y }; }
  function onMove(e) { if (!drag.current) return; const sw = (svgRef.current && svgRef.current.clientWidth) || 1000; const u = 1000 / sw; setView((v) => ({ ...v, x: drag.current.x + (e.clientX - drag.current.px) * u, y: drag.current.y + (e.clientY - drag.current.py) * u })); }
  function onUp() { drag.current = null; }
  const mapBtn = { width: "30px", height: "30px", display: "grid", placeItems: "center", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-strong)", background: "var(--color-surface-overlay)", color: "var(--color-text-muted)", cursor: "pointer", font: "600 16px/1 var(--font-sans)", boxShadow: "var(--shadow-card)" };

  // ---- alert flares + auto-follow ----
  const NODE_BY_LABEL = {}; Object.values(allNodes).forEach((n) => { NODE_BY_LABEL[n.label] = n; });
  const [flare, setFlare] = React.useState(null);
  const [follow, setFollow] = React.useState(false);
  const followRef = React.useRef(follow); followRef.current = follow;

  // ---- breadcrumb trail ----
  function trail() {
    if (sel === "hub") return [{ label: "Platform", id: "hub" }];
    const ig = integrations.find((i) => i.id === sel); if (ig) return [{ label: "Platform", id: "hub" }, { label: "Integrations" }, { label: ig.label, id: ig.id }];
    const rg = regions.find((r) => r.id === sel); if (rg) return [{ label: "Platform", id: "hub" }, { label: rg.label, id: rg.id }];
    for (const r of regions) { const s = stores[r.id].find((x) => x.id === sel); if (s) return [{ label: "Platform", id: "hub" }, { label: r.label, id: r.id }, { label: s.label, id: s.id }]; }
    return [{ label: "Platform", id: "hub" }];
  }

  // ---- live per-link throughput (req/s) ----
  const linkRps = { erpnext: Math.round(jitter(1240, 14, tick, 1)), pos: Math.round(jitter(820, 16, tick, 4)), dp2: Math.round(jitter(540, 18, tick, 7)), frappe: Math.round(jitter(180, 30, tick, 9)) };
  const rpsMax = 1400;

  // ---- minimap recenter ----
  function miniClick(e) {
    const b = e.currentTarget.getBoundingClientRect();
    const wx = ((e.clientX - b.left) / b.width) * 1000, wy = ((e.clientY - b.top) / b.height) * 640;
    setAnim(true); const K = Math.max(1.5, view.k); setView({ k: K, x: 500 - wx * K, y: 320 - wy * K });
  }

  // ---- replay ----
  const INCIDENTS = [
    { m: 52, tone: "warning", label: "Sync lag · Branch 04" },
    { m: 40, tone: "warning", label: "POS-Pulse lag 45s" },
    { m: 18, tone: "danger", label: "ERP retry spike (12)" },
    { m: 4, tone: "info", label: "Latency auto-recovered" },
  ];
  const [replay, setReplay] = React.useState(false);
  const [playT, setPlayT] = React.useState(60);
  const [playing, setPlaying] = React.useState(false);
  React.useEffect(() => {
    if (!replay || !playing) return;
    const id = setInterval(() => setPlayT((t) => { if (t <= 0) { setPlaying(false); return 0; } return t - 1; }), 320);
    return () => clearInterval(id);
  }, [replay, playing]);
  const nearIncident = INCIDENTS.reduce((a, b) => (Math.abs(b.m - playT) <= 4 && Math.abs(b.m - playT) < Math.abs((a ? a.m : 999) - playT) ? b : a), null);

  // ---- live command log ----
  const POOL = [
    { tone: "success", icon: "audit", msg: "Sales invoice posted to ERPNext", who: "Cairo Festival City" },
    { tone: "success", icon: "link", msg: "Payment synced to outbox", who: "Mall of Egypt" },
    { tone: "info", icon: "unknown", msg: "Unknown item auto-classified", who: "City Stars" },
    { tone: "warning", icon: "alert", msg: "Sync lag detected (38s)", who: "Frappe Orch." },
    { tone: "success", icon: "catalog", msg: "Stock reconciled", who: "Maadi Grand" },
    { tone: "danger", icon: "alert", msg: "Invoice post retry failed", who: "Alexandria Corniche" },
    { tone: "info", icon: "operators", msg: "Operator session opened", who: "Tanta Plaza" },
    { tone: "success", icon: "gauge", msg: "Terminal heartbeat OK", who: "Smouha Center" },
  ];
  const [log, setLog] = React.useState(() => POOL.slice(0, 6).map((e, i) => ({ ...e, id: i, age: (i + 1) * 12 })));
  React.useEffect(() => {
    if (tick === 0) return;
    const e = POOL[tick % POOL.length];
    setLog((l) => [{ ...e, id: Date.now(), age: 0 }, ...l.map((x) => ({ ...x, age: x.age + 3 }))].slice(0, 7));
    if (e.tone === "danger" || e.tone === "warning") {
      const n = NODE_BY_LABEL[e.who];
      if (n) {
        const key = Date.now();
        setFlare({ id: n.id, key, tone: e.tone });
        if (followRef.current) { setAnim(true); const K = 2.0; setView({ k: K, x: 500 - n.x * K, y: 320 - n.y * K }); }
        setTimeout(() => setFlare((f) => (f && f.key === key ? null : f)), 3400);
      }
    }
  }, [tick]);

  const grossToday = (3128450 + tick * 412).toLocaleString();
  const txMin = Math.round(jitter(214, 14, tick, 3));
  const posted = (12842 + tick * 2).toLocaleString();

  // rolling throughput ribbon
  const ribbon = Array.from({ length: 48 }, (_, i) => 40 + jitter(60, 60, tick - (47 - i), i) * 0.5);
  const rmax = Math.max(...ribbon);
  const rpath = ribbon.map((v, i) => `${(i / 47) * 100},${36 - (v / rmax) * 32}`).join(" ");

  const link = (a, b, flow) => (
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={flow ? "var(--color-accent)" : "var(--color-border-strong)"} strokeWidth={flow ? 1.6 : 1.2} className={flow ? "rtc-flow" : ""} opacity={flow ? 0.9 : 0.5} />
  );

  const Node = ({ n, r, gold }) => {
    const on = sel === n.id;
    const c = tone[n.health] || "var(--color-text-muted)";
    return (
      <g className="rtc-node" transform={`translate(${n.x},${n.y})`} onClick={() => pick(n)} style={{ cursor: "pointer" }}>
        {(n.health === "warning" || n.health === "danger") ? <circle r={r + 6} fill="none" stroke={c} strokeWidth="1.5" className="rtc-halo" opacity="0.5" /> : null}
        {on ? <circle r={r + 7} fill="none" stroke="var(--color-gold-marker)" strokeWidth="2" /> : null}
        {flare && flare.id === n.id ? <circle r={r + 5} fill="none" stroke={flare.tone === "danger" ? "var(--color-danger-on)" : "var(--color-warning-on)"} strokeWidth="2.5" className="rtc-flare" /> : null}
        <circle r={r} fill={gold ? "var(--color-gold-soft)" : "var(--color-surface-raised)"} stroke={gold ? "var(--color-gold-marker)" : c} strokeWidth={gold ? 2 : 1.75} />
        {gold
          ? <g transform="translate(-12,-12)" style={{ color: "var(--color-gold-marker)" }}><Icon name="tower" size={24} /></g>
          : <circle r={r * 0.34} fill={c} />}
        <text y={r + 15} textAnchor="middle" style={{ font: "600 12px/1 var(--font-sans)", fill: on ? "var(--color-text)" : "var(--color-text-muted)" }}>{n.label}</text>
      </g>
    );
  };

  const Vital = ({ label, value, unit, spark, color }) => (
    <div style={{ borderBottom: "1px solid var(--color-border)", padding: "var(--space-3) 0" }}>
      <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "5px", margin: "3px 0 6px" }}>
        <span className="rtc-live-val" key={value} style={{ font: "700 22px/1 var(--font-sans)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>{value}</span>
        {unit ? <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{unit}</span> : null}
      </div>
      <div style={{ display: "flex", gap: "2px", height: "20px", alignItems: "flex-end" }}>
        {spark.map((v, i) => <span key={i} style={{ flex: 1, height: `${Math.max(8, v)}%`, background: color, opacity: 0.35 + (i / spark.length) * 0.65, borderRadius: "1px" }} />)}
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Command Desk"
        subtitle={`Live platform topology · ${scope.tenant} · ${scope.store}`}
        actions={<>
          {replay
            ? <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", font: "600 var(--text-caption)/1 var(--font-sans)", color: "var(--color-warning-on)", textTransform: "uppercase", letterSpacing: "0.04em" }}><span style={{ width: "7px", height: "7px", borderRadius: "9999px", background: "var(--color-warning-on)" }} />Replay · T−{playT}m</span>
            : <LivePulse />}
          <Button variant={replay ? "primary" : "secondary"} onClick={() => { setReplay((r) => !r); setPlaying(false); setPlayT(60); }} iconStart={<Icon name="clock" size={16} />}>{replay ? "Exit replay" : "Replay"}</Button>
          <Button variant="ghost" iconStart={<Icon name="check" size={16} />} onClick={() => window.rtcToast && window.rtcToast("All alerts acknowledged", "success")}>Acknowledge all</Button>
        </>}
      />

      <div className="rtc-command" style={{ display: "grid", gridTemplateColumns: "208px minmax(0,1fr) 300px", gap: "var(--space-5)", alignItems: "stretch" }}>
        {/* Vitals spine */}
        <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", padding: "var(--space-4) var(--space-5)", display: "flex", flexDirection: "column" }}>
          <div style={{ font: "var(--type-label)", marginBottom: "var(--space-2)" }}>Platform vitals</div>
          <Vital label="Gross today (EGP)" value={grossToday} spark={[40, 52, 48, 60, 55, 70, 66, 82]} color="var(--color-accent)" />
          <Vital label="Transactions / min" value={txMin} spark={[50, 44, 62, 58, 70, 64, 78, 72]} color="var(--color-info-on)" />
          <Vital label="Posted to ERP" value={posted} spark={[60, 64, 58, 72, 68, 80, 76, 88]} color="var(--color-success-on)" />
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "var(--space-3)", borderTop: "1px solid var(--color-border)" }}>
            <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>Health index</span>
            <span style={{ font: "700 16px/1 var(--font-sans)", color: "var(--color-success-on)", fontVariantNumeric: "tabular-nums" }}>99.71%</span>
          </div>
        </div>

        {/* Topology canvas */}
        <div style={{ position: "relative", border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "radial-gradient(120% 90% at 50% 42%, var(--color-surface) 0%, var(--color-surface-sunken) 100%)", overflow: "hidden", minHeight: "560px" }}>
          <div style={{ position: "absolute", top: "var(--space-4)", left: "var(--space-5)", zIndex: 3, display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", maxWidth: "60%" }}>
            <span style={{ font: "var(--type-caption)", color: "var(--color-text-disabled)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Topology</span>
            <span style={{ color: "var(--color-text-disabled)" }}>·</span>
            {trail().map((seg, i, arr) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                {i > 0 ? <span style={{ color: "var(--color-text-disabled)" }}>›</span> : null}
                <button type="button" onClick={() => seg.id && pick(allNodes[seg.id])} style={{ font: "var(--type-caption)", fontWeight: i === arr.length - 1 ? 600 : 400, color: i === arr.length - 1 ? "var(--color-text)" : seg.id ? "var(--color-accent)" : "var(--color-text-muted)", cursor: seg.id ? "pointer" : "default" }}>{seg.label}</button>
              </span>
            ))}
          </div>
          <div style={{ position: "absolute", top: "var(--space-4)", right: "var(--space-5)", zIndex: 2, display: "flex", gap: "var(--space-3)", font: "var(--type-caption)", color: "var(--color-text-muted)" }}>
            {[["Healthy", "var(--color-success-on)"], ["Degraded", "var(--color-warning-on)"], ["Critical", "var(--color-danger-on)"]].map(([k, c]) => (
              <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: c }} />{k}</span>
            ))}
          </div>

          {/* minimap */}
          <div style={{ position: "absolute", top: "42px", right: "var(--space-5)", zIndex: 3, width: "140px", height: "92px", background: "var(--color-surface-overlay)", border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-md)", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
            <svg viewBox="0 0 1000 640" width="140" height="92" onClick={miniClick} style={{ display: "block", cursor: "pointer" }}>
              {integrations.map((n) => <line key={"mli" + n.id} x1={n.x} y1={n.y} x2={hub.x} y2={hub.y} stroke="var(--color-border-strong)" strokeWidth="2" />)}
              {regions.map((n) => <line key={"mlr" + n.id} x1={hub.x} y1={hub.y} x2={n.x} y2={n.y} stroke="var(--color-border-strong)" strokeWidth="2" />)}
              {regions.map((rg) => stores[rg.id].map((s) => <line key={"mls" + s.id} x1={rg.x} y1={rg.y} x2={s.x} y2={s.y} stroke="var(--color-border-strong)" strokeWidth="2" />))}
              {Object.values(allNodes).map((n) => <circle key={"mn" + n.id} cx={n.x} cy={n.y} r={n.id === "hub" ? 22 : 12} fill={n.health === "gold" ? "var(--color-gold-marker)" : (tone[n.health] || "var(--color-text-muted)")} />)}
              <rect x={-view.x / view.k} y={-view.y / view.k} width={1000 / view.k} height={640 / view.k} fill="none" stroke="var(--color-text)" strokeWidth="7" opacity="0.7" />
            </svg>
          </div>

          <svg ref={svgRef} viewBox="0 0 1000 640" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
            onWheel={onWheel} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
            style={{ display: "block", cursor: "grab", touchAction: "none" }}>
            <defs>
              <pattern id="rtcgrid" width="38" height="38" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="var(--color-border)" opacity="0.7" />
              </pattern>
            </defs>
            <g style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`, transition: anim && !reduce ? "transform .55s cubic-bezier(.2,0,0,1)" : "none" }}>
              <rect x="-600" y="-500" width="2200" height="1640" fill="url(#rtcgrid)" />
              {/* links */}
              {integrations.map((n) => {
                const rps = linkRps[n.id] || 0, w = 1.3 + (rps / rpsMax) * 3.2, mx = (n.x + hub.x) / 2, my = (n.y + hub.y) / 2;
                return (
                  <g key={"li" + n.id}>
                    <line x1={n.x} y1={n.y} x2={hub.x} y2={hub.y} stroke="var(--color-accent)" strokeWidth={w} className="rtc-flow" opacity="0.85" />
                    <g transform={`translate(${mx},${my})`}>
                      <rect x="-21" y="-9" width="42" height="16" rx="8" fill="var(--color-surface-overlay)" stroke="var(--color-border)" />
                      <text textAnchor="middle" y="3" style={{ font: "600 9px/1 var(--font-mono)", fill: "var(--color-accent)" }}>{rps}/s</text>
                    </g>
                  </g>
                );
              })}
              {regions.map((n) => <React.Fragment key={"lr" + n.id}>{link(hub, n, false)}</React.Fragment>)}
              {regions.map((rg) => stores[rg.id].map((s) => <React.Fragment key={"ls" + s.id}>{link(rg, s, false)}</React.Fragment>))}
              {/* data packets flowing into the tower */}
              {!reduce ? integrations.map((n, i) => (
                <circle key={"pk" + n.id} r="2.6" fill="var(--color-accent)">
                  <animateMotion dur="2.1s" begin={`${i * 0.5}s`} repeatCount="indefinite" path={`M${n.x},${n.y} L${hub.x},${hub.y}`} />
                </circle>
              )) : null}
              {/* nodes */}
              {integrations.map((n) => <Node key={n.id} n={n} r={15} />)}
              {regions.map((n) => <Node key={n.id} n={n} r={20} />)}
              {regions.map((rg) => stores[rg.id].map((s) => <Node key={s.id} n={s} r={13} />))}
              <Node n={hub} r={34} gold />
            </g>
          </svg>

          {/* map controls */}
          <div style={{ position: "absolute", left: "var(--space-5)", top: "84px", zIndex: 3, display: "flex", flexDirection: "column", gap: "6px" }}>
            <button type="button" onClick={() => zoomBy(1.25)} title="Zoom in" style={mapBtn}>+</button>
            <button type="button" onClick={() => zoomBy(0.8)} title="Zoom out" style={mapBtn}>−</button>
            <button type="button" onClick={resetView} title="Reset view" style={mapBtn}><Icon name="overview" size={15} /></button>
            <button type="button" onClick={() => setFollow((f) => !f)} title={follow ? "Auto-follow alerts: on" : "Auto-follow alerts: off"} style={{ ...mapBtn, color: follow ? "var(--color-accent)" : "var(--color-text-muted)", borderColor: follow ? "var(--color-primary)" : "var(--color-border-strong)", background: follow ? "var(--color-primary-subtle)" : "var(--color-surface-overlay)" }}><Icon name="signal" size={15} /></button>
          </div>
          <div style={{ position: "absolute", left: "50%", bottom: "var(--space-3)", transform: "translateX(-50%)", zIndex: 2, font: "var(--type-caption)", color: "var(--color-text-disabled)", pointerEvents: "none", whiteSpace: "nowrap" }}>Scroll to zoom · drag to pan · click a node to focus</div>

          {/* inspector */}
          <div style={{ position: "absolute", left: "var(--space-5)", bottom: "var(--space-5)", width: "212px", boxSizing: "border-box", zIndex: 3, background: "var(--color-surface-overlay)", border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-dialog)", boxShadow: "var(--shadow-pane)", padding: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
              <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{node.id === "hub" ? "Platform" : node.term != null ? "Store" : node.count != null ? "Region" : "Integration"}</span>
              {node.health && node.health !== "gold" ? <Badge tone={node.health}>{node.health === "success" ? "Healthy" : node.health === "warning" ? "Degraded" : "Critical"}</Badge> : <span style={{ color: "var(--color-gold-strong)", font: "var(--type-caption)", fontWeight: 600 }}>Authority</span>}
            </div>
            <div style={{ font: "var(--type-title)" }}>{node.label}</div>
            {node.sub ? <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "2px" }}>{node.sub}</div> : null}
            {node.id !== "hub" ? <div style={{ font: "var(--type-mono)", color: "var(--color-text-muted)", marginTop: "2px" }}>{node.id}</div> : null}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
              {(node.term != null
                ? [["Sales 7d", node.sales], ["Term.", node.term], ["Tx 7d", node.tx]]
                : node.count != null
                  ? [["Stores", node.count], ["Online", `${node.count - (node.health === "warning" ? 1 : 0)}`], ["Alerts", node.health === "warning" ? 2 : 0]]
                  : node.m
                    ? Object.entries(node.m)
                    : [["Tenants", 42], ["Stores", "1,248"], ["Health", "99.7%"]]
              ).map(([k, v]) => (
                <div key={k} style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", background: "var(--color-surface-sunken)", padding: "var(--space-2)" }}>
                  <div style={{ font: "10px/1.2 var(--font-sans)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{k}</div>
                  <div style={{ font: "700 13px/1.2 var(--font-sans)", fontVariantNumeric: "tabular-nums", marginTop: "2px" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* throughput ribbon */}
          <div style={{ position: "absolute", right: "var(--space-5)", bottom: "var(--space-5)", width: "176px", boxSizing: "border-box", zIndex: 3, background: "var(--color-surface-overlay)", border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-dialog)", boxShadow: "var(--shadow-pane)", padding: "var(--space-3) var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>Throughput · req/s</span>
              <span style={{ font: "700 13px/1 var(--font-mono)", color: "var(--color-accent)", fontVariantNumeric: "tabular-nums" }}>{Math.round(ribbon[47])}</span>
            </div>
            <svg viewBox="0 0 100 38" width="100%" height="38" preserveAspectRatio="none" style={{ display: "block" }}>
              <polyline points={rpath} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <polygon points={`0,38 ${rpath} 100,38`} fill="var(--color-accent)" opacity="0.12" />
            </svg>
          </div>
        </div>

        {/* live command log */}
        <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
            <span style={{ font: "var(--type-title)" }}>Command log</span>
            <LivePulse label="Streaming" />
          </div>
          <div style={{ overflow: "auto", flex: 1 }}>
            {log.map((e) => (
              <div key={e.id} className={e.age === 0 ? "rtc-logrow rtc-logrow-new" : "rtc-logrow"} style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-3) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
                <span style={{ width: "28px", height: "28px", borderRadius: "var(--radius-md)", flexShrink: 0, display: "grid", placeItems: "center", background: surf[e.tone] || "var(--color-info-surface)", color: tone[e.tone] || "var(--color-info-on)" }}><Icon name={e.icon} size={15} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "var(--type-label)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.msg}</div>
                  <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{e.who} · {e.age === 0 ? "now" : `${e.age}s ago`}</div>
                </div>
                <span style={{ width: "7px", height: "7px", borderRadius: "9999px", marginTop: "8px", background: tone[e.tone] || "var(--color-info-on)", flexShrink: 0 }} />
              </div>
            ))}
          </div>
          <div style={{ padding: "var(--space-3) var(--space-5)", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", font: "var(--type-caption)", color: "var(--color-text-muted)" }}>
            <span>Live event stream</span>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--color-accent)", textDecoration: "none", fontWeight: 600 }}>Open audit ›</a>
          </div>
        </div>
      </div>

      {replay ? (
        <div style={{ marginTop: "var(--space-5)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", padding: "var(--space-4) var(--space-5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <button type="button" onClick={() => setPlaying((p) => !p)} title={playing ? "Pause" : "Play"} style={{ width: "38px", height: "38px", borderRadius: "var(--radius-pill)", display: "grid", placeItems: "center", background: "var(--color-primary)", color: "#fff", cursor: "pointer", flexShrink: 0, border: "none" }}>
              {playing
                ? <span style={{ display: "flex", gap: "3px" }}><span style={{ width: "3px", height: "12px", background: "#fff" }} /><span style={{ width: "3px", height: "12px", background: "#fff" }} /></span>
                : <span style={{ width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "11px solid #fff", marginLeft: "2px" }} />}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", font: "var(--type-caption)", color: "var(--color-text-muted)", marginBottom: "6px" }}>
                <span>60 min ago</span>
                <span style={{ color: nearIncident ? (tone[nearIncident.tone] || "var(--color-text)") : "var(--color-text)", fontWeight: 600 }}>{nearIncident ? nearIncident.label : (playT === 0 ? "Live edge" : "Nominal")}</span>
                <span>now</span>
              </div>
              <div onClick={(e) => { const b = e.currentTarget.getBoundingClientRect(); setPlayT(Math.max(0, Math.min(60, Math.round(60 - ((e.clientX - b.left) / b.width) * 60)))); }} style={{ position: "relative", height: "26px", borderRadius: "var(--radius-pill)", background: "var(--color-surface-sunken)", border: "1px solid var(--color-border)", cursor: "pointer" }}>
                {INCIDENTS.map((it, i) => (
                  <span key={i} title={it.label} style={{ position: "absolute", top: "50%", left: `${((60 - it.m) / 60) * 100}%`, transform: "translate(-50%,-50%)", width: "10px", height: "10px", borderRadius: "9999px", background: tone[it.tone] || "var(--color-info-on)", border: "2px solid var(--color-surface)" }} />
                ))}
                <span style={{ position: "absolute", top: "-4px", bottom: "-4px", left: `${((60 - playT) / 60) * 100}%`, transform: "translateX(-50%)", width: "3px", borderRadius: "2px", background: "var(--color-gold-marker)" }} />
              </div>
            </div>
            <div style={{ font: "700 16px/1 var(--font-mono)", color: "var(--color-text)", fontVariantNumeric: "tabular-nums", minWidth: "64px", textAlign: "right" }}>T−{playT}m</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

Object.assign(window, { CommandDesk });
