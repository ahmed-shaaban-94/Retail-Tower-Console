/* Retail Tower Console — shared rich-screen widgets.
 * Composes design-system primitives + charts.jsx. Loaded after charts.jsx so it
 * can read its exports. Everything attaches to window for the screen files. */

(function () {
  const NS = window.RetailTowerConsoleDesignSystem_b7c448;
  const { Icon, Badge, Button } = NS;

  /* ---- Section title (matches the headline rhythm used across screens) ---- */
  function SectionTitle({ children, action, style }) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 var(--space-3)", ...style }}>
        <h2 style={{ font: "var(--type-headline)", letterSpacing: "var(--tracking-headline)", margin: 0 }}>{children}</h2>
        {action || null}
      </div>
    );
  }

  /* ---- Tabs (underline, navy active) ---- */
  function Tabs({ items, active, onChange }) {
    return (
      <div style={{ display: "flex", gap: "var(--space-5)", borderBottom: "1px solid var(--color-border)", marginBottom: "var(--space-4)", overflowX: "auto" }}>
        {items.map((it) => {
          const id = typeof it === "string" ? it : it.id;
          const label = typeof it === "string" ? it : it.label;
          const count = typeof it === "object" ? it.count : null;
          const on = id === active;
          return (
            <button key={id} type="button" onClick={() => onChange(id)}
              style={{ position: "relative", padding: "0 0 var(--space-3)", cursor: "pointer", font: "var(--type-label)", color: on ? "var(--color-text)" : "var(--color-text-muted)", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
              {label}
              {count != null ? <span style={{ font: "600 var(--text-caption)/1 var(--font-mono)", color: on ? "var(--color-accent)" : "var(--color-text-disabled)" }}>{count}</span> : null}
              {on ? <span style={{ position: "absolute", left: 0, right: 0, bottom: "-1px", height: "2px", background: "var(--color-primary)", borderRadius: "2px 2px 0 0" }} /> : null}
            </button>
          );
        })}
      </div>
    );
  }

  /* ---- Hierarchy tree (expandable, count chips, gold marker on active) ---- */
  function TreeNode({ node, depth = 0, activeId, onSelect }) {
    const [open, setOpen] = React.useState(depth < 1);
    const [hover, setHover] = React.useState(false);
    const kids = node.children || [];
    const hasKids = kids.length > 0;
    const on = node.id === activeId;
    return (
      <div>
        <div
          onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
          onClick={() => { onSelect && onSelect(node.id); }}
          style={{ position: "relative", display: "flex", alignItems: "center", gap: "var(--space-2)", height: "32px", padding: `0 var(--space-2) 0 ${8 + depth * 16}px`, borderRadius: "var(--radius-md)", cursor: "pointer", font: "var(--type-body)", color: on ? "var(--color-text)" : "var(--color-text-muted)", background: on ? "var(--color-primary-subtle)" : hover ? "var(--color-surface-raised)" : "transparent" }}>
          {on ? <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "3px", height: "16px", borderRadius: "0 2px 2px 0", background: "var(--color-gold-marker)" }} /> : null}
          {hasKids ? (
            <button type="button" onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }} style={{ display: "grid", placeItems: "center", width: "16px", height: "16px", color: "var(--color-text-muted)", cursor: "pointer", flexShrink: 0 }}>
              <Icon name="chevron" size={13} style={{ transform: open ? "none" : "rotate(-90deg)", transition: "transform var(--duration-2) var(--ease-out)" }} />
            </button>
          ) : <span style={{ width: "16px", flexShrink: 0 }} />}
          {node.icon ? <span style={{ color: on ? "var(--color-accent)" : "var(--color-text-disabled)", flexShrink: 0 }}><Icon name={node.icon} size={15} /></span> : null}
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.label}</span>
          {node.count != null ? <span style={{ font: "var(--type-caption)", color: "var(--color-text-disabled)", fontFamily: "var(--font-mono)" }}>{node.count}</span> : null}
        </div>
        {hasKids && open ? kids.map((k) => <TreeNode key={k.id} node={k} depth={depth + 1} activeId={activeId} onSelect={onSelect} />) : null}
      </div>
    );
  }

  /* ---- Horizontal bar meter (distributions) ---- */
  function BarMeter({ label, value, max, count, pct, color = "var(--color-primary)" }) {
    const w = Math.max(2, Math.round((value / max) * 100));
    return (
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-2) 0" }}>
        <span style={{ font: "var(--type-body)", color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
        <div style={{ height: "8px", borderRadius: "9999px", background: "var(--color-surface-raised)", overflow: "hidden" }}>
          <div style={{ width: `${w}%`, height: "100%", borderRadius: "9999px", background: color }} />
        </div>
        <span style={{ font: "600 var(--text-label)/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--color-text)", minWidth: "64px", textAlign: "right" }}>{count != null ? count : value}{pct ? <span style={{ color: "var(--color-text-disabled)", fontWeight: 400 }}> · {pct}</span> : null}</span>
      </div>
    );
  }

  /* ---- Radial gauge (single percentage, navy ring) ---- */
  function Gauge({ value, size = 132, label, sub, color = "var(--color-success-on)" }) {
    const r = size / 2 - 10, c = 2 * Math.PI * r, cxv = size / 2;
    const frac = Math.max(0, Math.min(1, value / 100));
    return (
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <g transform={`rotate(-90 ${cxv} ${cxv})`}>
            <circle cx={cxv} cy={cxv} r={r} fill="none" stroke="var(--color-surface-raised)" strokeWidth="13" />
            <circle cx={cxv} cy={cxv} r={r} fill="none" stroke={color} strokeWidth="13" strokeLinecap="round" strokeDasharray={`${(frac * c).toFixed(2)} ${(c - frac * c).toFixed(2)}`} />
          </g>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
          <div>
            <div style={{ font: "700 22px/1 var(--font-sans)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>{label != null ? label : `${value}%`}</div>
            {sub ? <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "3px" }}>{sub}</div> : null}
          </div>
        </div>
      </div>
    );
  }

  /* ---- Heat grid (event volume) ---- */
  function HeatGrid({ rows, cols, data, rowLabels, colLabels }) {
    const max = Math.max(...data.flat(), 1);
    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: `64px repeat(${cols}, 1fr)`, gap: "4px" }}>
          {data.map((row, ri) => (
            <React.Fragment key={ri}>
              <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", display: "flex", alignItems: "center" }}>{rowLabels[ri]}</span>
              {row.map((v, ci) => {
                const t = v / max;
                return <div key={ci} title={`${v}`} style={{ height: "22px", borderRadius: "var(--radius-sm)", background: t === 0 ? "var(--color-surface-raised)" : `color-mix(in oklab, var(--color-primary) ${Math.round(15 + t * 75)}%, var(--color-surface))`, border: "1px solid var(--color-border)" }} />;
              })}
            </React.Fragment>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `64px repeat(${cols}, 1fr)`, gap: "4px", marginTop: "6px" }}>
          <span />
          {colLabels.map((l, i) => <span key={i} style={{ font: "var(--type-caption)", color: "var(--color-text-disabled)", textAlign: "center" }}>{l}</span>)}
        </div>
      </div>
    );
  }

  /* ---- Detail drawer (right-side selectable panel) ---- */
  function DetailDrawer({ title, onClose, children, footer }) {
    return (
      <aside style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", alignSelf: "start", position: "sticky", top: 0, maxHeight: "calc(100vh - 220px)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
          <span style={{ font: "var(--type-title)" }}>{title}</span>
          {onClose ? <button type="button" onClick={onClose} title="Close" style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-md)", color: "var(--color-text-muted)", cursor: "pointer" }}><Icon name="plus" size={16} style={{ transform: "rotate(45deg)" }} /></button> : null}
        </div>
        <div style={{ padding: "var(--space-5)", overflow: "auto", flex: 1 }}>{children}</div>
        {footer ? <div style={{ padding: "var(--space-4) var(--space-5)", borderTop: "1px solid var(--color-border)" }}>{footer}</div> : null}
      </aside>
    );
  }

  /* ---- Key/value detail rows ---- */
  function KV({ k, v, mono }) {
    return (
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-4)", padding: "var(--space-2) 0", borderBottom: "1px solid var(--color-border)" }}>
        <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", flexShrink: 0 }}>{k}</span>
        <span style={{ font: mono ? "var(--type-mono)" : "var(--type-label)", textAlign: "right", color: "var(--color-text)" }}>{v}</span>
      </div>
    );
  }

  /* ---- Small toolbar (search + buttons) used above tables ---- */
  function Toolbar({ children, style }) {
    return <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-4)", flexWrap: "wrap", ...style }}>{children}</div>;
  }

  /* ---- Search input (icon-led, on-surface; controlled when value/onChange given) ---- */
  function SearchInput({ placeholder, style, value, onChange }) {
    return (
      <div style={{ flex: 1, minWidth: "200px", position: "relative", ...style }}>
        <span style={{ position: "absolute", insetInlineStart: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none", display: "inline-flex" }}><Icon name="search" size={15} /></span>
        <input value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined} placeholder={placeholder} style={{ width: "100%", height: "36px", padding: "0 12px 0 32px", background: "var(--color-surface-sunken)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-control)", color: "var(--color-text)", font: "var(--type-body)", outline: "none" }} />
      </div>
    );
  }

  /* ---- Checkbox ---- */
  function Checkbox({ checked, indeterminate, onChange }) {
    return (
      <span onClick={(e) => { e.stopPropagation(); onChange && onChange(!checked); }} style={{ display: "inline-grid", placeItems: "center", width: "18px", height: "18px", borderRadius: "var(--radius-sm)", border: `1px solid ${checked || indeterminate ? "var(--color-primary)" : "var(--color-border-strong)"}`, background: checked || indeterminate ? "var(--color-primary)" : "transparent", cursor: "pointer", flexShrink: 0 }}>
        {checked ? <Icon name="check" size={12} strokeWidth={3} style={{ color: "#fff" }} /> : indeterminate ? <span style={{ width: "8px", height: "2px", background: "#fff", borderRadius: "1px" }} /> : null}
      </span>
    );
  }

  /* ---- Sortable header cell ---- */
  function SortHeader({ label, k, sort, onSort, align }) {
    const on = sort && sort.key === k;
    return (
      <th onClick={() => onSort(k)} style={{ font: "600 var(--text-caption)/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.04em", color: on ? "var(--color-text)" : "var(--color-text-muted)", textAlign: align === "right" ? "right" : "left", padding: "var(--space-3)", background: "var(--color-surface-raised)", borderBottom: "1px solid var(--color-border)", whiteSpace: "nowrap", cursor: "pointer", userSelect: "none" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", flexDirection: align === "right" ? "row-reverse" : "row" }}>
          {label}
          <span style={{ opacity: on ? 1 : 0.25, fontSize: "10px", lineHeight: 1 }}>{on ? (sort.dir === "asc" ? "\u25b2" : "\u25bc") : "\u21c5"}</span>
        </span>
      </th>
    );
  }

  /* ---- Bulk-action bar (appears above a table when rows are selected) ---- */
  function BulkBar({ count, actions, onClear }) {
    if (!count) return null;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-2) var(--space-3)", marginBottom: "var(--space-2)", background: "var(--color-primary-subtle)", border: "1px solid var(--color-primary)", borderRadius: "var(--radius-control)" }}>
        <span style={{ font: "var(--type-label)", color: "var(--color-accent)" }}>{count} selected</span>
        <div style={{ display: "flex", gap: "var(--space-2)", marginInlineStart: "auto", flexWrap: "wrap" }}>
          {(actions || []).map((a) => (
            <button key={a} type="button" style={{ height: "28px", padding: "0 10px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-strong)", background: "var(--color-surface)", color: "var(--color-text)", font: "var(--type-label)", cursor: "pointer" }}>{a}</button>
          ))}
          <button type="button" onClick={onClear} title="Clear selection" style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", borderRadius: "var(--radius-md)", color: "var(--color-text-muted)", cursor: "pointer" }}><Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
      </div>
    );
  }

  /* ---- Table state: search + sort + selection over a row set ---- */
  function useTableState(rows, { text, sortAccessors, getId } = {}) {
    const [query, setQuery] = React.useState("");
    const [sort, setSort] = React.useState(null);
    const [selected, setSelected] = React.useState(() => new Set());
    const idOf = getId || ((r, i) => i);

    const onSort = (k) => setSort((s) => (s && s.key === k ? (s.dir === "asc" ? { key: k, dir: "desc" } : null) : { key: k, dir: "asc" }));

    const view = React.useMemo(() => {
      let out = rows;
      const q = query.trim().toLowerCase();
      if (q && text) out = out.filter((r) => text(r).toLowerCase().includes(q));
      if (sort && sortAccessors && sortAccessors[sort.key]) {
        const acc = sortAccessors[sort.key];
        out = [...out].sort((a, b) => {
          const va = acc(a), vb = acc(b);
          if (va < vb) return sort.dir === "asc" ? -1 : 1;
          if (va > vb) return sort.dir === "asc" ? 1 : -1;
          return 0;
        });
      }
      return out;
    }, [rows, query, sort]);

    const allIds = view.map((r, i) => idOf(r, i));
    const allOn = allIds.length > 0 && allIds.every((id) => selected.has(id));
    const someOn = allIds.some((id) => selected.has(id));
    const toggle = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const toggleAll = () => setSelected(() => { if (allOn) return new Set(); return new Set(allIds); });
    const clear = () => setSelected(new Set());

    return { query, setQuery, sort, onSort, view, selected, toggle, toggleAll, allOn, someOn, clear, idOf };
  }

  /* ---- Live tick: returns an incrementing counter every `ms`. Pauses when tab hidden. ---- */
  function useLive(ms = 2600) {
    const [tick, setTick] = React.useState(0);
    React.useEffect(() => {
      const id = setInterval(() => { if (!document.hidden) setTick((t) => t + 1); }, ms);
      return () => clearInterval(id);
    }, [ms]);
    return tick;
  }
  // Smooth jitter around a base value (percentage swing).
  function jitter(base, pct, tick, seed = 1) {
    const n = Math.sin((tick + seed) * 1.7) * 0.5 + Math.sin((tick + seed) * 0.6) * 0.5;
    return base * (1 + (n * pct) / 100);
  }

  /* ---- Live pulse pill ---- */
  function LivePulse({ label = "Live" }) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", font: "600 var(--text-caption)/1 var(--font-sans)", color: "var(--color-success-on)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
        <span className="rtc-pulse" style={{ width: "7px", height: "7px", borderRadius: "9999px", background: "var(--color-success-on)" }} />
        {label}
      </span>
    );
  }

  /* ---- Pagination footer ---- */
  function Pager({ page = 1, pages = 1, label }) {
    const around = [1, 2, 3];
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-3) var(--space-1)", font: "var(--type-label)", color: "var(--color-text-muted)" }}>
        <span>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button type="button" style={pagerBtn(false)}><Icon name="chevron" size={14} style={{ transform: "rotate(90deg)" }} /></button>
          {around.map((n) => <button key={n} type="button" style={pagerBtn(n === page)}>{n}</button>)}
          <span style={{ padding: "0 6px", color: "var(--color-text-disabled)" }}>…</span>
          <button type="button" style={pagerBtn(false)}>{pages}</button>
          <button type="button" style={pagerBtn(false)}><Icon name="chevron" size={14} style={{ transform: "rotate(-90deg)" }} /></button>
        </div>
      </div>
    );
  }
  function pagerBtn(active) {
    return { display: "grid", placeItems: "center", minWidth: "30px", height: "30px", padding: "0 8px", borderRadius: "var(--radius-md)", cursor: "pointer", font: "600 var(--text-label)/1 var(--font-mono)", color: active ? "#fff" : "var(--color-text-muted)", background: active ? "var(--color-primary)" : "transparent", border: active ? "1px solid var(--color-primary)" : "1px solid var(--color-border)" };
  }

  /* ---- Avatar (initials, deterministic tint) ---- */
  function Avatar({ name, size = 28 }) {
    const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
    return <span style={{ width: size, height: size, borderRadius: "50%", background: "var(--color-primary-subtle)", color: "var(--color-accent)", display: "grid", placeItems: "center", font: `700 ${Math.round(size * 0.4)}px/1 var(--font-sans)`, flexShrink: 0 }}>{initials}</span>;
  }

  Object.assign(window, { SectionTitle, Tabs, TreeNode, BarMeter, Gauge, HeatGrid, DetailDrawer, KV, Toolbar, SearchInput, Pager, Avatar, Checkbox, SortHeader, BulkBar, useTableState, useLive, jitter, LivePulse });
})();
