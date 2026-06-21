/* Retail Tower Console — UI kit: shared chart + analytic primitives.
 * Data-viz SVG (not decorative). Series use the navy/teal interactive family +
 * semantic health; gold stays authority-only. Flat surfaces, no gradient hero. */

(function () {
  const NS = window.RetailTowerConsoleDesignSystem_b7c448;

  /* ---- Sparkline ---- */
  function Sparkline({ data, color, h = 34 }) {
    const w = 140;
    const max = Math.max(...data), min = Math.min(...data), rng = max - min || 1;
    const pts = data.map((d, i) => [(i / (data.length - 1)) * w, h - 3 - ((d - min) / rng) * (h - 8)]);
    const line = pts.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ");
    const area = `0,${h} ${line} ${w},${h}`;
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ display: "block" }}>
        <polygon points={area} fill={color} opacity="0.13" />
        <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  }

  /* ---- KPI card ---- */
  function KpiCard({ icon, tone, label, value, unit, delta, deltaDir, sub, spark, sparkColor }) {
    const toneSurface = {
      primary: ["var(--color-primary-subtle)", "var(--color-accent)"],
      success: ["var(--color-success-surface)", "var(--color-success-on)"],
      warning: ["var(--color-warning-surface)", "var(--color-warning-on)"],
      danger: ["var(--color-danger-surface)", "var(--color-danger-on)"],
      info: ["var(--color-info-surface)", "var(--color-info-on)"],
    }[tone] || ["var(--color-surface-raised)", "var(--color-text-muted)"];
    const deltaColor = deltaDir === "down" ? "var(--color-danger-on)" : "var(--color-success-on)";
    return (
      <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span style={{ width: "28px", height: "28px", borderRadius: "var(--radius-md)", background: toneSurface[0], color: toneSurface[1], display: "grid", placeItems: "center", flexShrink: 0 }}>
            <NS.Icon name={icon} size={16} />
          </span>
          <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
          <span style={{ font: "700 26px/1.1 var(--font-sans)", letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>{value}</span>
          {unit ? <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{unit}</span> : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", font: "var(--type-caption)" }}>
          {delta ? (
            <span style={{ color: deltaColor, display: "inline-flex", alignItems: "center", gap: "2px", fontWeight: 600 }}>
              {deltaDir === "down" ? "▾" : "▴"} {delta}
            </span>
          ) : null}
          <span style={{ color: "var(--color-text-muted)" }}>{sub}</span>
        </div>
        <div style={{ marginTop: "2px" }}><Sparkline data={spark} color={sparkColor} /></div>
      </div>
    );
  }

  /* ---- Bar + line combo chart, dual axis ---- */
  function ComboChart({ labels, bars, line, barMax, lineMax }) {
    const W = 720, H = 260, padL = 44, padR = 44, padT = 16, padB = 30;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const n = labels.length;
    const slot = plotW / n;
    const barW = Math.min(26, slot * 0.42);
    const yBar = (v) => padT + plotH - (v / barMax) * plotH;
    const yLine = (v) => padT + plotH - (v / lineMax) * plotH;
    const cx = (i) => padL + slot * i + slot / 2;
    const linePts = line.map((v, i) => `${cx(i).toFixed(1)},${yLine(v).toFixed(1)}`).join(" ");
    const grid = [0, 0.25, 0.5, 0.75, 1];
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        {grid.map((g, i) => {
          const y = padT + plotH - g * plotH;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="var(--color-border)" strokeWidth="1" opacity="0.6" />
              <text x={padL - 8} y={y + 3} textAnchor="end" fontSize="10" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">{Math.round(g * barMax)}</text>
              <text x={W - padR + 8} y={y + 3} textAnchor="start" fontSize="10" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">{Math.round(g * lineMax)}</text>
            </g>
          );
        })}
        {bars.map((v, i) => (
          <rect key={i} x={cx(i) - barW / 2} y={yBar(v)} width={barW} height={padT + plotH - yBar(v)} rx="3" fill="var(--color-primary)" />
        ))}
        <polyline points={linePts} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {line.map((v, i) => (
          <circle key={i} cx={cx(i)} cy={yLine(v)} r="3.5" fill="var(--color-bg)" stroke="var(--color-accent)" strokeWidth="2" />
        ))}
        {labels.map((l, i) => (
          <text key={i} x={cx(i)} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--color-text-muted)" fontFamily="var(--font-sans)">{l}</text>
        ))}
      </svg>
    );
  }

  /* ---- Donut ---- */
  function Donut({ segments, size = 132 }) {
    const r = size / 2 - 10, c = 2 * Math.PI * r, cxv = size / 2;
    let offset = 0;
    const total = segments.reduce((s, x) => s + x.value, 0);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
          <g transform={`rotate(-90 ${cxv} ${cxv})`}>
            {segments.map((s, i) => {
              const frac = s.value / total;
              const dash = `${(frac * c).toFixed(2)} ${(c - frac * c).toFixed(2)}`;
              const el = (
                <circle key={i} cx={cxv} cy={cxv} r={r} fill="none" stroke={s.color} strokeWidth="14" strokeDasharray={dash} strokeDashoffset={(-offset * c).toFixed(2)} />
              );
              offset += frac;
              return el;
            })}
          </g>
        </svg>
        <div style={{ display: "grid", gap: "var(--space-2)", flex: 1 }}>
          {segments.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", font: "var(--type-body)" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: s.color, flexShrink: 0 }} />
              <span style={{ flex: 1, color: "var(--color-text-muted)" }}>{s.label}</span>
              <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{((s.value / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---- Panel (card with header + optional action) ---- */
  function Panel({ title, action, children, style }) {
    return (
      <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", padding: "var(--space-5)", ...style }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
          <h2 style={{ font: "var(--type-headline)", letterSpacing: "var(--tracking-headline)", margin: 0 }}>{title}</h2>
          {action || null}
        </div>
        {children}
      </div>
    );
  }

  /* ---- Exceptions list (severity icon · text · count · time) ---- */
  function ExceptionList({ items }) {
    const toneSurface = {
      danger: ["var(--color-danger-surface)", "var(--color-danger-on)"],
      warning: ["var(--color-warning-surface)", "var(--color-warning-on)"],
      info: ["var(--color-info-surface)", "var(--color-info-on)"],
    };
    return (
      <div style={{ display: "grid" }}>
        {items.map((it, i) => {
          const [bg, fg] = toneSurface[it.tone] || toneSurface.info;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) 0", borderBottom: i < items.length - 1 ? "1px solid var(--color-border)" : "none" }}>
              <span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-md)", background: bg, color: fg, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <NS.Icon name={it.icon} size={16} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: "var(--type-label)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title}</div>
                <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{it.time}</div>
              </div>
              <span style={{ font: "600 var(--text-label)/1 var(--font-mono)", color: fg, background: bg, borderRadius: "var(--radius-pill)", padding: "2px 9px", flexShrink: 0 }}>{it.count}</span>
            </div>
          );
        })}
      </div>
    );
  }

  /* ---- Activity feed (icon · text · meta · badge) ---- */
  function ActivityFeed({ items }) {
    return (
      <div style={{ display: "grid" }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) 0", borderBottom: i < items.length - 1 ? "1px solid var(--color-border)" : "none" }}>
            <span style={{ color: "var(--color-text-muted)", flexShrink: 0 }}><NS.Icon name={it.icon} size={18} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: "var(--type-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.text}</div>
              <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{it.meta}</div>
            </div>
            <NS.Badge tone={it.tone} dot={false}>{it.label}</NS.Badge>
          </div>
        ))}
      </div>
    );
  }

  /* ---- Multi-series line chart with optional confidence band ---- */
  function LineChart({ labels, series, band, yMax }) {
    const W = 720, H = 250, padL = 44, padR = 16, padT = 16, padB = 28;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const n = labels.length;
    const x = (i) => padL + (i / (n - 1)) * plotW;
    const y = (v) => padT + plotH - (v / yMax) * plotH;
    const grid = [0, 0.25, 0.5, 0.75, 1];
    const poly = (arr) => arr.map((v, i) => (v == null ? null : `${x(i).toFixed(1)},${y(v).toFixed(1)}`)).filter(Boolean).join(" ");
    let bandPts = "";
    if (band) {
      const up = band.upper.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
      const lo = band.lower.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).reverse();
      bandPts = up.concat(lo).join(" ");
    }
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        {grid.map((g, i) => {
          const yy = padT + plotH - g * plotH;
          return (
            <g key={i}>
              <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="var(--color-border)" strokeWidth="1" opacity="0.6" />
              <text x={padL - 8} y={yy + 3} textAnchor="end" fontSize="10" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">{Math.round(g * yMax)}</text>
            </g>
          );
        })}
        {band ? <polygon points={bandPts} fill={band.color} opacity="0.14" /> : null}
        {series.map((s, i) => (
          <polyline key={i} points={poly(s.values)} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={s.dashed ? "6 5" : undefined} />
        ))}
        {labels.map((l, i) => (i % Math.ceil(n / 8) === 0 ? (
          <text key={i} x={x(i)} y={H - 9} textAnchor="middle" fontSize="10" fill="var(--color-text-muted)" fontFamily="var(--font-sans)">{l}</text>
        ) : null))}
      </svg>
    );
  }

  Object.assign(window, { Sparkline, KpiCard, ComboChart, LineChart, Donut, Panel, ExceptionList, ActivityFeed });
})();
