/* Retail Tower Console — UI kit: Sales Monitor.
 * Real-time sales performance across channels & stores. Reuses charts.jsx. */

const DSsales = window.RetailTowerConsoleDesignSystem_b7c448;

function SalesMonitor({ scope }) {
  const { Button, Badge, Icon } = DSsales;
  const { KpiCard, ComboChart, Donut, Panel, useLive, LivePulse } = window;
  const Table = window.Table, PageHeader = window.PageHeader;
  const tick = useLive(2500);
  const gross = 2458250 + tick * 318;
  const txCount = 12842 + tick * 2;

  const kpis = [
    { icon: "activity", tone: "primary", label: "Gross Sales (EGP)", value: gross.toLocaleString(), unit: "", delta: "18.6%", deltaDir: "up", sub: "vs prev 7d", spark: [310, 340, 420, 390, 460, 520, 612], sparkColor: "var(--color-accent)" },
    { icon: "audit", tone: "success", label: "Net Sales (EGP)", value: "2,238,540", unit: "", delta: "16.2%", deltaDir: "up", sub: "vs prev 7d", spark: [300, 320, 380, 360, 430, 470, 560], sparkColor: "var(--color-success-on)" },
    { icon: "signal", tone: "info", label: "Transactions", value: txCount.toLocaleString(), unit: "", delta: "13.5%", deltaDir: "up", sub: "vs prev 7d", spark: [1600, 1720, 1810, 1750, 1980, 2040, 2145], sparkColor: "var(--color-info-on)" },
    { icon: "gauge", tone: "primary", label: "Average Basket", value: "174.22", unit: "EGP", delta: "2.8%", deltaDir: "up", sub: "vs prev 7d", spark: [165, 168, 170, 169, 172, 173, 174], sparkColor: "var(--color-accent)" },
    { icon: "alert", tone: "danger", label: "Refunds (EGP)", value: "28,540", unit: "", delta: "4.2%", deltaDir: "down", sub: "lower vs 7d", spark: [38, 36, 33, 31, 30, 29, 28], sparkColor: "var(--color-danger-on)" },
  ];

  const topStores = [
    { name: "Cairo Festival City", net: "487,250", tx: "2,145", chg: "+18.2%", up: true },
    { name: "Mall of Egypt", net: "386,900", tx: "1,876", chg: "+16.3%", up: true },
    { name: "City Stars Heliopolis", net: "296,410", tx: "1,512", chg: "+12.6%", up: true },
    { name: "Maadi Grand", net: "258,620", tx: "1,243", chg: "+9.2%", up: true },
    { name: "Alexandria Corniche", net: "196,380", tx: "1,021", chg: "-2.1%", up: false },
  ];

  const txns = [
    { id: "TRX-250607-004512", time: "Jun 7 · 14:14", store: "Cairo Festival City", chan: "In-Store", gross: "342.50", net: "300.00", pay: "Card", status: ["success", "Completed"] },
    { id: "TRX-250607-004511", time: "Jun 7 · 14:08", store: "Mall of Egypt", chan: "In-Store", gross: "189.75", net: "165.00", pay: "Cash", status: ["success", "Completed"] },
    { id: "TRX-250607-004510", time: "Jun 7 · 14:02", store: "City Stars Heliopolis", chan: "Click & Collect", gross: "268.40", net: "233.40", pay: "Wallet", status: ["success", "Completed"] },
    { id: "TRX-250607-004509", time: "Jun 7 · 13:58", store: "Maadi Grand", chan: "Online", gross: "512.00", net: "445.00", pay: "Card", status: ["success", "Completed"] },
    { id: "TRX-250607-004508", time: "Jun 7 · 13:45", store: "Alexandria Corniche", chan: "In-Store", gross: "156.75", net: "136.30", pay: "Card", status: ["warning", "Refunded"] },
  ];

  const insights = [
    { icon: "activity", text: "Sales vs last week", delta: "+16.2%", sub: "+313,280 EGP", up: true },
    { icon: "signal", text: "Transactions vs last week", delta: "+13.5%", sub: "+1,529", up: true },
    { icon: "gauge", text: "Average basket vs last week", delta: "+2.8%", sub: "+4.72 EGP", up: true },
  ];

  return (
    <div>
      <PageHeader
        title="Sales Monitor"
        subtitle={`Real-time sales performance across channels & stores · ${scope.tenant} · last 7 days`}
        actions={<>
          <LivePulse />
          <Button variant="secondary" iconStart={<Icon name="clock" size={16} />}>Jun 1 – Jun 7</Button>
          <Button variant="ghost" iconStart={<Icon name="catalog" size={16} />}>Filters</Button>
        </>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.75fr 1fr", gap: "var(--space-5)", marginBottom: "var(--space-6)" }}>
        <Panel
          title="Sales trend"
          action={<div style={{ display: "flex", gap: "var(--space-4)", font: "var(--type-caption)", color: "var(--color-text-muted)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--color-primary)" }} />Gross (EGP k)</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "2px", background: "var(--color-accent)" }} />Transactions</span>
          </div>}
        >
          <ComboChart labels={["May 28", "May 29", "May 30", "May 31", "Jun 1", "Jun 2", "Jun 3"]} bars={[520, 480, 760, 690, 540, 612, 700]} line={[1810, 1620, 2210, 2040, 1740, 2145, 2260]} barMax={900} lineMax={2600} />
        </Panel>
        <Panel title="Channel mix">
          <Donut segments={[
            { label: "In-Store", value: 72.3, color: "var(--color-primary)" },
            { label: "Online", value: 18.7, color: "var(--color-accent)" },
            { label: "Click & Collect", value: 6.1, color: "var(--color-info-on)" },
            { label: "Other", value: 2.9, color: "var(--color-text-muted)" },
          ]} />
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.75fr 1fr", gap: "var(--space-5)", marginBottom: "var(--space-6)" }}>
        <div>
          <h2 style={{ font: "var(--type-headline)", letterSpacing: "var(--tracking-headline)", margin: "0 0 var(--space-3)" }}>Top performing stores</h2>
          <Table
            columns={[
              { label: "Store", render: (r) => r.name },
              { label: "Net Sales (EGP)", align: "right", mono: true, render: (r) => r.net },
              { label: "Transactions", align: "right", mono: true, muted: true, render: (r) => r.tx },
              { label: "vs LW", align: "right", render: (r) => <span style={{ color: r.up ? "var(--color-success-on)" : "var(--color-danger-on)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{r.chg}</span> },
            ]}
            rows={topStores}
          />
        </div>
        <Panel title="Payment methods">
          <Donut segments={[
            { label: "Card", value: 1568940, color: "var(--color-primary)" },
            { label: "Cash", value: 503120, color: "var(--color-accent)" },
            { label: "Digital Wallet", value: 219850, color: "var(--color-info-on)" },
            { label: "Gift Card", value: 43680, color: "var(--color-success-on)" },
            { label: "Other", value: 22950, color: "var(--color-text-muted)" },
          ]} />
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        {insights.map((it) => (
          <div key={it.text} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", padding: "var(--space-4)" }}>
            <span style={{ color: "var(--color-text-muted)" }}><Icon name={it.icon} size={18} /></span>
            <span style={{ flex: 1, font: "var(--type-body)", color: "var(--color-text-muted)" }}>{it.text}</span>
            <span style={{ textAlign: "right" }}>
              <div style={{ color: it.up ? "var(--color-success-on)" : "var(--color-danger-on)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{it.delta}</div>
              <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{it.sub}</div>
            </span>
          </div>
        ))}
      </div>

      <h2 style={{ font: "var(--type-headline)", letterSpacing: "var(--tracking-headline)", margin: "0 0 var(--space-3)" }}>Recent sales transactions</h2>
      <Table
        columns={[
          { label: "Transaction ID", mono: true, render: (r) => r.id },
          { label: "Time", muted: true, render: (r) => r.time },
          { label: "Store", render: (r) => r.store },
          { label: "Channel", muted: true, render: (r) => r.chan },
          { label: "Gross", align: "right", mono: true, render: (r) => r.gross },
          { label: "Net", align: "right", mono: true, muted: true, render: (r) => r.net },
          { label: "Payment", muted: true, render: (r) => r.pay },
          { label: "Status", render: (r) => <Badge tone={r.status[0]}>{r.status[1]}</Badge> },
        ]}
        rows={txns}
      />
    </div>
  );
}

Object.assign(window, { SalesMonitor });
