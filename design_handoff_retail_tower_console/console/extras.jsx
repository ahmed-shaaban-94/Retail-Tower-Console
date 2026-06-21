/* Retail Tower Console — toasts + keyboard cheatsheet (global affordances). */

window.rtcToast = function (msg, tone) {
  window.dispatchEvent(new CustomEvent("rtc-toast", { detail: { msg, tone: tone || "info", id: Date.now() + Math.random() } }));
};

(function () {
  const NS = window.RetailTowerConsoleDesignSystem_b7c448;
  const { Icon } = NS;
  const tTone = { success: ["var(--color-success-surface)", "var(--color-success-on)", "check"], info: ["var(--color-info-surface)", "var(--color-info-on)", "info"], warning: ["var(--color-warning-surface)", "var(--color-warning-on)", "alert"], danger: ["var(--color-danger-surface)", "var(--color-danger-on)", "alert"] };

  function ToastHost() {
    const [items, setItems] = React.useState([]);
    React.useEffect(() => {
      const on = (e) => {
        const it = e.detail;
        setItems((l) => [...l, it]);
        setTimeout(() => setItems((l) => l.filter((x) => x.id !== it.id)), 3200);
      };
      window.addEventListener("rtc-toast", on);
      return () => window.removeEventListener("rtc-toast", on);
    }, []);
    return (
      <div style={{ position: "fixed", insetInlineEnd: "var(--space-5)", bottom: "var(--space-5)", zIndex: 1200, display: "flex", flexDirection: "column", gap: "var(--space-2)", pointerEvents: "none" }}>
        {items.map((it) => {
          const [bg, fg, icon] = tTone[it.tone] || tTone.info;
          return (
            <div key={it.id} className="rtc-toast" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", minWidth: "240px", maxWidth: "360px", padding: "var(--space-3) var(--space-4)", background: "var(--color-surface-overlay)", border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-control)", boxShadow: "var(--shadow-pane)" }}>
              <span style={{ width: "26px", height: "26px", borderRadius: "var(--radius-md)", flexShrink: 0, display: "grid", placeItems: "center", background: bg, color: fg }}><Icon name={icon} size={15} /></span>
              <span style={{ font: "var(--type-label)", color: "var(--color-text)" }}>{it.msg}</span>
            </div>
          );
        })}
      </div>
    );
  }

  const KEYS = [
    { k: "⌘ K", d: "Open command palette" },
    { k: "?", d: "Show this cheatsheet" },
    { k: "T", d: "Toggle dark / light theme" },
    { k: "G then 1–9 / 0", d: "Jump to nav item N" },
    { k: "Esc", d: "Close panel / overlay" },
  ];
  const MAP_KEYS = [
    { k: "Scroll", d: "Zoom the topology" },
    { k: "Drag", d: "Pan the map" },
    { k: "Click node", d: "Fly to & inspect" },
  ];

  function Cheatsheet({ open, onClose }) {
    if (!open) return null;
    return (
      <div onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(8,13,22,0.55)", display: "grid", placeItems: "center" }}>
        <div role="dialog" aria-label="Keyboard shortcuts" style={{ width: "min(460px, 92vw)", background: "var(--color-surface-overlay)", border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-dialog)", boxShadow: "var(--shadow-pane)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
            <span style={{ font: "var(--type-title)" }}>Keyboard shortcuts</span>
            <button type="button" onClick={onClose} title="Close" style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-md)", color: "var(--color-text-muted)", cursor: "pointer" }}><Icon name="plus" size={16} style={{ transform: "rotate(45deg)" }} /></button>
          </div>
          <div style={{ padding: "var(--space-4) var(--space-5)" }}>
            <Section title="Global" rows={KEYS} />
            <div style={{ height: "var(--space-4)" }} />
            <Section title="Command Desk map" rows={MAP_KEYS} />
          </div>
        </div>
      </div>
    );
  }
  function Section({ title, rows }) {
    return (
      <div>
        <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "var(--space-2)" }}>{title}</div>
        {rows.map((r) => (
          <div key={r.d} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-2) 0", borderBottom: "1px solid var(--color-border)" }}>
            <span style={{ font: "var(--type-body)", color: "var(--color-text)" }}>{r.d}</span>
            <kbd style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-text-muted)", border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-sm)", padding: "2px 8px", background: "var(--color-surface-sunken)" }}>{r.k}</kbd>
          </div>
        ))}
      </div>
    );
  }

  Object.assign(window, { ToastHost, Cheatsheet });
})();
