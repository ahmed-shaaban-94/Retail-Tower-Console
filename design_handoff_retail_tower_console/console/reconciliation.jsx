/* Retail Tower Console — UI kit: Reconciliation.
 * Control ERP postings, monitor reconciliation accuracy, resolve exceptions. */

const DSrec = window.RetailTowerConsoleDesignSystem_b7c448;

function PostingTimeline({ steps }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      {steps.map((s, i) => {
        const tone = s.tone === "danger" ? "var(--color-danger-on)" : "var(--color-success-on)";
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative" }}>
            {i < steps.length - 1 ? <div style={{ position: "absolute", top: "13px", left: "50%", width: "100%", height: "2px", background: "var(--color-border)" }} /> : null}
            <span style={{ position: "relative", zIndex: 1, width: "28px", height: "28px", borderRadius: "9999px", background: "var(--color-surface)", border: `2px solid ${tone}`, color: tone, display: "grid", placeItems: "center" }}>
              <DSrec.Icon name={s.tone === "danger" ? "alert" : "check"} size={15} strokeWidth={2.5} />
            </span>
            <div style={{ font: "700 18px/1.2 var(--font-sans)", marginTop: "var(--space-3)", fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
            <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "2px", maxWidth: "120px" }}>{s.label}</div>
            <div style={{ font: "600 var(--text-caption)/1 var(--font-mono)", color: tone, marginTop: "4px" }}>{s.pct}</div>
          </div>
        );
      })}
    </div>
  );
}

function Reconciliation({ scope }) {
  const { Button, Badge, Icon } = DSrec;
  const { KpiCard, Panel } = window;
  const Table = window.Table, PageHeader = window.PageHeader;

  const kpis = [
    { icon: "audit", tone: "primary", label: "Total Posted", value: "2,458,250", unit: "", delta: "18.6%", deltaDir: "up", sub: "vs prev 7d", spark: [310, 340, 420, 390, 460, 520, 612], sparkColor: "var(--color-accent)" },
    { icon: "check", tone: "success", label: "Matched Amount", value: "2,389,410", unit: "", delta: "17.2%", deltaDir: "up", sub: "vs prev 7d", spark: [300, 320, 380, 360, 430, 470, 560], sparkColor: "var(--color-success-on)" },
    { icon: "clock", tone: "warning", label: "Pending Posts", value: "42,310", unit: "", delta: "9.8%", deltaDir: "up", sub: "outbox queue", spark: [30, 32, 38, 36, 40, 44, 42], sparkColor: "var(--color-warning-on)" },
    { icon: "alert", tone: "danger", label: "Failed Posts", value: "3,612", unit: "", delta: "12.3%", deltaDir: "down", sub: "lower vs 7d", spark: [52, 48, 44, 40, 38, 36, 36], sparkColor: "var(--color-danger-on)" },
    { icon: "link", tone: "info", label: "Retry Queue", value: "1,284", unit: "", delta: "4.5%", deltaDir: "up", sub: "auto-retrying", spark: [12, 13, 11, 14, 12, 13, 13], sparkColor: "var(--color-info-on)" },
    { icon: "gauge", tone: "success", label: "Reconciliation Health", value: "98.21", unit: "%", delta: "1.6pp", deltaDir: "up", sub: "matched / posted", spark: [96.5, 97, 97.4, 97.8, 98, 98.21, 98.2], sparkColor: "var(--color-success-on)" },
  ];

  const timeline = [
    { value: "2.46M", label: "Transaction Created", pct: "100%", tone: "success" },
    { value: "2.45M", label: "Validation", pct: "99.6%", tone: "success" },
    { value: "44.8K", label: "Queued for Posting", pct: "1.8%", tone: "success" },
    { value: "2.39M", label: "Posted to ERP", pct: "97.3%", tone: "success" },
    { value: "2.39M", label: "Matched", pct: "97.3%", tone: "success" },
    { value: "3.61K", label: "Exceptions", pct: "0.15%", tone: "danger" },
  ];

  const rows = [
    { st: ["success", "Matched"], id: "TXN-742981", src: "POS", store: "Cairo Festival City", type: "Sale", amt: "1,248.90", on: "Jun 7 · 10:42", doc: "INV-905321", match: ["success", "Matched"], age: "2m" },
    { st: ["success", "Matched"], id: "TXN-742980", src: "eCommerce", store: "Mall of Egypt", type: "Sale", amt: "89.00", on: "Jun 7 · 10:41", doc: "INV-905320", match: ["success", "Matched"], age: "3m" },
    { st: ["warning", "Pending"], id: "TXN-742979", src: "POS", store: "City Stars", type: "Return", amt: "-45.00", on: "—", doc: "—", match: ["warning", "Pending"], age: "7m" },
    { st: ["danger", "Failed"], id: "TXN-742978", src: "POS", store: "Maadi Grand", type: "Sale", amt: "210.50", on: "—", doc: "—", match: ["danger", "Failed"], age: "14m" },
    { st: ["info", "Retrying"], id: "TXN-742977", src: "Marketplace", store: "Alexandria", type: "Payout", amt: "-320.00", on: "—", doc: "—", match: ["info", "Retrying"], age: "17m" },
    { st: ["success", "Matched"], id: "TXN-742976", src: "POS", store: "Cairo Festival City", type: "Sale", amt: "75.40", on: "Jun 7 · 10:28", doc: "INV-905315", match: ["success", "Matched"], age: "19m" },
    { st: ["warning", "Mismatch"], id: "TXN-742974", src: "eCommerce", store: "Mall of Egypt", type: "Sale", amt: "139.90", on: "Jun 7 · 10:24", doc: "INV-905313", match: ["warning", "Mismatch"], age: "24m" },
  ];

  return (
    <div>
      <PageHeader
        title="Reconciliation"
        subtitle={`Control ERP postings, monitor accuracy & resolve exceptions · ${scope.tenant}`}
        actions={<>
          <Button variant="secondary" iconStart={<Icon name="clock" size={16} />}>Jun 1 – Jun 7</Button>
          <Button variant="primary" iconStart={<Icon name="link" size={16} />}>Run reconciliation</Button>
        </>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <Panel title="Posting timeline" action={<span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>last 7 days</span>} style={{ marginBottom: "var(--space-6)" }}>
        <div style={{ paddingTop: "var(--space-2)" }}><PostingTimeline steps={timeline} /></div>
      </Panel>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
        <h2 style={{ font: "var(--type-headline)", letterSpacing: "var(--tracking-headline)", margin: 0 }}>Outbox / reconciliation</h2>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Button variant="ghost" size="sm" iconStart={<Icon name="audit" size={15} />}>Export</Button>
          <Button variant="secondary" size="sm">Bulk actions</Button>
        </div>
      </div>
      <Table
        columns={[
          { label: "Status", render: (r) => <Badge tone={r.st[0]}>{r.st[1]}</Badge> },
          { label: "Transaction ID", mono: true, render: (r) => r.id },
          { label: "Source", muted: true, render: (r) => r.src },
          { label: "Store", muted: true, render: (r) => r.store },
          { label: "Type", muted: true, render: (r) => r.type },
          { label: "Amount (EGP)", align: "right", mono: true, render: (r) => r.amt },
          { label: "Posted On", muted: true, mono: true, render: (r) => r.on },
          { label: "ERP Doc #", mono: true, muted: true, render: (r) => r.doc },
          { label: "Match", render: (r) => <Badge tone={r.match[0]}>{r.match[1]}</Badge> },
          { label: "Age", align: "right", mono: true, muted: true, render: (r) => r.age },
        ]}
        rows={rows}
      />
    </div>
  );
}

Object.assign(window, { Reconciliation });
