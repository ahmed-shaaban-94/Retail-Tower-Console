/* Retail Tower Console — Command palette (⌘K).
 * Generic: takes a flat list of {id,label,group,icon,hint,run}. Keyboard-first:
 * ↑/↓ move · Enter run · Esc close. A professional power-operator affordance. */

const DScmd = window.RetailTowerConsoleDesignSystem_b7c448;

function CommandPalette({ open, onClose, items }) {
  const { Icon } = DScmd;
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef(null);
  const listRef = React.useRef(null);

  React.useEffect(() => {
    if (open) { setQ(""); setActive(0); setTimeout(() => inputRef.current && inputRef.current.focus(), 30); }
  }, [open]);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => (it.label + " " + (it.group || "") + " " + (it.hint || "")).toLowerCase().includes(s));
  }, [q, items]);

  React.useEffect(() => { if (active >= filtered.length) setActive(Math.max(0, filtered.length - 1)); }, [filtered.length]);

  function run(it) { if (!it) return; onClose(); it.run && it.run(); }

  function onKey(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(filtered.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); run(filtered[active]); }
    else if (e.key === "Escape") { e.preventDefault(); onClose(); }
  }

  React.useEffect(() => {
    const el = listRef.current && listRef.current.querySelector('[data-active="true"]');
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  // group the filtered results preserving group order of first appearance
  const groups = [];
  filtered.forEach((it) => { let g = groups.find((x) => x.name === (it.group || "")); if (!g) { g = { name: it.group || "", items: [] }; groups.push(g); } g.items.push(it); });
  let idx = -1;

  return (
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(8,13,22,0.55)", backdropFilter: "blur(2px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh" }}
    >
      <div
        role="dialog" aria-label="Command palette" onKeyDown={onKey}
        style={{ width: "min(620px, 92vw)", maxHeight: "70vh", display: "flex", flexDirection: "column", background: "var(--color-surface-overlay)", border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-dialog)", boxShadow: "var(--shadow-pane)", overflow: "hidden" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
          <span style={{ color: "var(--color-text-muted)", display: "inline-flex" }}><Icon name="search" size={18} /></span>
          <input
            ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }}
            placeholder="Search screens, actions, scope…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--color-text)", font: "var(--text-title)/1.4 var(--font-sans)" }}
          />
          <span style={{ font: "var(--type-caption)", color: "var(--color-text-disabled)", fontFamily: "var(--font-mono)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "1px 6px" }}>Esc</span>
        </div>

        <div ref={listRef} style={{ overflow: "auto", padding: "var(--space-2)" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--color-text-muted)", font: "var(--type-body)" }}>No matches for “{q}”.</div>
          ) : groups.map((g) => (
            <div key={g.name} style={{ marginBottom: "var(--space-2)" }}>
              {g.name ? <div style={{ font: "600 var(--text-caption)/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-disabled)", padding: "var(--space-2) var(--space-3)" }}>{g.name}</div> : null}
              {g.items.map((it) => {
                idx += 1; const i = idx; const on = i === active;
                return (
                  <button key={it.id} type="button" data-active={on} onMouseEnter={() => setActive(i)} onClick={() => run(it)}
                    style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", width: "100%", textAlign: "left", padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-md)", cursor: "pointer", color: "var(--color-text)", background: on ? "var(--color-primary-subtle)" : "transparent" }}>
                    <span style={{ width: "28px", height: "28px", borderRadius: "var(--radius-md)", display: "grid", placeItems: "center", flexShrink: 0, background: on ? "var(--color-surface-overlay)" : "var(--color-surface-raised)", color: on ? "var(--color-accent)" : "var(--color-text-muted)" }}><Icon name={it.icon} size={16} /></span>
                    <span style={{ flex: 1, font: "var(--type-body)" }}>{it.label}</span>
                    {it.hint ? <span style={{ font: "var(--type-caption)", color: "var(--color-text-disabled)", fontFamily: "var(--font-mono)" }}>{it.hint}</span> : null}
                    {on ? <span style={{ color: "var(--color-text-muted)", display: "inline-flex", transform: "rotate(-90deg)" }}><Icon name="chevron" size={14} /></span> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-3) var(--space-5)", borderTop: "1px solid var(--color-border)", font: "var(--type-caption)", color: "var(--color-text-muted)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><kbd style={kbd}>↑</kbd><kbd style={kbd}>↓</kbd> navigate</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><kbd style={kbd}>↵</kbd> open</span>
          <span style={{ marginLeft: "auto" }}>{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>
  );
}
const kbd = { fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-muted)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "0 5px", lineHeight: "16px", display: "inline-block" };

Object.assign(window, { CommandPalette });
