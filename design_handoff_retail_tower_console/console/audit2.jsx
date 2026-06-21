/* Retail Tower Console — Audit Logs (rich rebuild).
 * Filter bar · KPI strip · event-volume heatmap · high-risk events ·
 * dense audit-events table · selectable event-details drawer. */

const DSaud = window.RetailTowerConsoleDesignSystem_b7c448;

function Audit({ scope }) {
  const { Button, Badge, Icon, Input } = DSaud;
  const { KpiCard } = window;
  const { HeatGrid, DetailDrawer, KV, SearchInput, Pager, SectionTitle, Checkbox, SortHeader, BulkBar, useTableState } = window;

  const kpis = [
    { icon: "audit", tone: "primary", label: "Audited Events Today", value: "24,842", delta: "18.6%", deltaDir: "up", sub: "vs yesterday", spark: [18000, 19500, 20100, 21500, 22800, 23900, 24842], sparkColor: "var(--color-accent)" },
    { icon: "alert", tone: "danger", label: "Failed Actions", value: "312", delta: "32.4%", deltaDir: "up", sub: "vs yesterday", spark: [180, 210, 230, 250, 280, 300, 312], sparkColor: "var(--color-danger-on)" },
    { icon: "settings", tone: "info", label: "Config Changes", value: "128", delta: "12.3%", deltaDir: "up", sub: "vs yesterday", spark: [90, 98, 104, 112, 118, 124, 128], sparkColor: "var(--color-info-on)" },
    { icon: "operators", tone: "warning", label: "Permission Changes", value: "56", delta: "4.2%", deltaDir: "up", sub: "vs yesterday", spark: [44, 47, 49, 51, 53, 55, 56], sparkColor: "var(--color-warning-on)" },
    { icon: "link", tone: "success", label: "Exports", value: "41", delta: "9.1%", deltaDir: "down", sub: "vs yesterday", spark: [58, 54, 50, 47, 45, 43, 41], sparkColor: "var(--color-success-on)" },
  ];

  const heat = [
    [1, 2, 4, 6, 9, 8, 7, 5, 4, 3, 2, 1],
    [1, 1, 3, 7, 10, 9, 8, 6, 5, 3, 2, 1],
    [2, 3, 5, 8, 11, 12, 10, 7, 6, 4, 3, 2],
    [1, 2, 4, 7, 10, 11, 9, 8, 6, 4, 2, 1],
    [2, 4, 6, 9, 12, 11, 10, 8, 5, 3, 2, 1],
    [1, 1, 2, 4, 6, 7, 6, 5, 4, 3, 2, 1],
    [0, 1, 1, 3, 5, 6, 5, 4, 3, 2, 1, 1],
  ];

  const highRisk = [
    { icon: "alert", tone: "danger", title: "Unauthorized delete — product", meta: "admin@northstar deleted SKU PRD-49213", time: "2m ago", level: "Critical" },
    { icon: "operators", tone: "danger", title: "Role escalation", meta: "user maged@northstar assigned Tenant Admin", time: "18m ago", level: "High" },
    { icon: "settings", tone: "warning", title: "Payment config changed", meta: "ERPNext API key rotated in Production", time: "1h ago", level: "High" },
    { icon: "operators", tone: "info", title: "Bulk user deactivation", meta: "23 users deactivated by amal@northstar", time: "2h ago", level: "Medium" },
    { icon: "audit", tone: "info", title: "Audit log exported", meta: "logs exported by auditor@northstar", time: "3h ago", level: "Low" },
  ];

  const events = [
    { time: "10:24:31", event: "Payment gateway updated", icon: "settings", user: "amal@northstar", role: "Tenant Admin", res: "erpnext_prod", resType: "Integration", store: "All stores", status: ["success", "Success"], level: ["warning", "Medium"], id: "evt_8f7c2b9e4a1d", ip: "197.45.x.x", loc: "Cairo, Egypt", session: "sess_7a9d3f2c4b6e", reqId: "req_1d2f3a4b5c6e7f8g", changes: [["API version", "v14", "v15"], ["Verify SSL", "off", "on"], ["Batch size", "500", "1000"]] },
    { time: "10:21:09", event: "User role changed", icon: "operators", user: "amal@northstar", role: "Tenant Admin", res: "maged@northstar", resType: "User", store: "All stores", status: ["success", "Success"], level: ["danger", "High"], id: "evt_2a4c6e8g0i2k", ip: "197.45.x.x", loc: "Cairo, Egypt", session: "sess_7a9d3f2c4b6e", reqId: "req_2b3c4d5e6f7g8h9i", changes: [["Role", "Analyst", "Tenant Admin"], ["Scope", "Greater Cairo", "All stores"]] },
    { time: "10:18:45", event: "Product deleted", icon: "catalog", user: "admin@northstar", role: "Admin", res: "PRD-49213", resType: "Product", store: "Maadi Grand", status: ["danger", "Failed"], level: ["danger", "Critical"], id: "evt_3b5d7f9h1j3l", ip: "41.33.x.x", loc: "Maadi, Egypt", session: "sess_1c2d3e4f5a6b", reqId: "req_3c4d5e6f7g8h9i0j", changes: [["State", "Listed", "Delete requested"]] },
    { time: "10:15:22", event: "Inventory adjustment", icon: "catalog", user: "karim@northstar", role: "Store Manager", res: "ADJ-77321", resType: "Inventory", store: "Mall of Egypt", status: ["success", "Success"], level: ["info", "Low"], id: "evt_4c6e8g0i2k4m", ip: "156.21.x.x", loc: "6 October, Egypt", session: "sess_9z8y7x6w5v4u", reqId: "req_4d5e6f7g8h9i0j1k", changes: [["Qty on hand", "1,210", "1,180"]] },
    { time: "10:11:03", event: "Permission updated", icon: "operators", user: "amal@northstar", role: "Tenant Admin", res: "role_finance_admin", resType: "Role", store: "All stores", status: ["success", "Success"], level: ["warning", "Medium"], id: "evt_5d7f9h1j3l5n", ip: "197.45.x.x", loc: "Cairo, Egypt", session: "sess_7a9d3f2c4b6e", reqId: "req_5e6f7g8h9i0j1k2l", changes: [["Audit export", "denied", "allowed"]] },
    { time: "10:07:55", event: "Audit logs exported", icon: "audit", user: "auditor@northstar", role: "Auditor", res: "export_20260607", resType: "Audit export", store: "All stores", status: ["success", "Success"], level: ["info", "Low"], id: "evt_6e8g0i2k4m6o", ip: "62.114.x.x", loc: "Cairo, Egypt", session: "sess_2m3n4o5p6q7r", reqId: "req_6f7g8h9i0j1k2l3m", changes: [["Range", "—", "7 days"]] },
    { time: "09:58:32", event: "Store created", icon: "stores", user: "ops@northstar", role: "Admin", res: "SMU-06", resType: "Store", store: "Smouha Center", status: ["success", "Success"], level: ["info", "Low"], id: "evt_7f9h1j3l5n7p", ip: "41.33.x.x", loc: "Alexandria, Egypt", session: "sess_3n4o5p6q7r8s", reqId: "req_7g8h9i0j1k2l3m4n", changes: [["Status", "—", "Provisioning"]] },
  ];

  const [sel, setSel] = React.useState(events[0].id);
  const e = events.find((x) => x.id === sel) || events[0];
  const ts = useTableState(events, {
    text: (x) => `${x.event} ${x.user} ${x.resType} ${x.res} ${x.store} ${x.ip} ${x.id}`,
    getId: (x) => x.id,
    sortAccessors: { time: (x) => x.time, event: (x) => x.event, user: (x) => x.user, resType: (x) => x.resType, store: (x) => x.store, status: (x) => x.status[1], level: (x) => x.level[1] },
  });

  const lvlColor = (t) => t === "danger" ? "var(--color-danger-on)" : t === "warning" ? "var(--color-warning-on)" : t === "info" ? "var(--color-info-on)" : "var(--color-text-muted)";

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle={`Search, analyze & investigate system events · ${scope.tenant} · ${scope.store}`}
        actions={<>
          <Button variant="secondary" iconStart={<Icon name="audit" size={16} />}>Save search</Button>
          <Button variant="secondary" iconStart={<Icon name="audit" size={16} />}>Export</Button>
        </>}
      />

      {/* Filter bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)", alignItems: "center", padding: "var(--space-3)", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", marginBottom: "var(--space-5)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "36px", padding: "0 var(--space-3)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-control)", font: "var(--type-label)", color: "var(--color-text-muted)" }}><Icon name="clock" size={15} />Jun 1 – Jun 7, 2026</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "36px", padding: "0 var(--space-3)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-control)", font: "var(--type-label)", color: "var(--color-text-muted)" }}><Icon name="gauge" size={15} />Last 24 hours</span>
        <SearchInput placeholder="Search events, users, resources or IP addresses…" value={ts.query} onChange={ts.setQuery} />
        <Button variant="secondary" iconStart={<Icon name="catalog" size={15} />}>Filters</Button>
        <Button variant="secondary" iconStart={<Icon name="settings" size={15} />}>Advanced</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 332px", gap: "var(--space-5)", alignItems: "start" }}>
        {/* Main column */}
        <div style={{ minWidth: 0, display: "grid", gap: "var(--space-6)" }}>
          {/* Heatmap + high risk */}
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "var(--space-5)" }}>
            <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", padding: "var(--space-5)" }}>
              <SectionTitle>Event volume heatmap</SectionTitle>
              <HeatGrid rows={7} cols={12} data={heat} rowLabels={["Mon 6/1", "Tue 6/2", "Wed 6/3", "Thu 6/4", "Fri 6/5", "Sat 6/6", "Sun 6/7"]} colLabels={["12a", "", "4a", "", "8a", "", "12p", "", "4p", "", "8p", ""]} />
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginTop: "var(--space-4)", font: "var(--type-caption)", color: "var(--color-text-muted)" }}>
                Low
                <div style={{ display: "flex", gap: "3px" }}>{[18, 35, 55, 75, 92].map((p) => <span key={p} style={{ width: "16px", height: "10px", borderRadius: "2px", background: `color-mix(in oklab, var(--color-primary) ${p}%, var(--color-surface))` }} />)}</div>
                High
              </div>
            </div>
            <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", padding: "var(--space-5)" }}>
              <SectionTitle action={<a href="#" onClick={(ev) => ev.preventDefault()} style={{ font: "var(--type-caption)", color: "var(--color-accent)", textDecoration: "none", fontWeight: 600 }}>View all ›</a>}>High-risk events</SectionTitle>
              <div style={{ display: "grid" }}>
                {highRisk.map((it, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) 0", borderBottom: i < highRisk.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                    <span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-md)", display: "grid", placeItems: "center", flexShrink: 0, background: it.tone === "danger" ? "var(--color-danger-surface)" : it.tone === "warning" ? "var(--color-warning-surface)" : "var(--color-info-surface)", color: lvlColor(it.tone) }}><Icon name={it.icon} size={15} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: "var(--type-label)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title}</div>
                      <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.meta}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <Badge tone={it.tone} dot={false}>{it.level}</Badge>
                      <div style={{ font: "var(--type-caption)", color: "var(--color-text-disabled)", marginTop: "3px" }}>{it.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit events table */}
          <div>
            <SectionTitle action={<div style={{ display: "flex", gap: "var(--space-2)" }}><Button variant="secondary" size="sm" iconStart={<Icon name="overview" size={14} />}>Columns</Button><Button variant="secondary" size="sm" iconStart={<Icon name="audit" size={14} />}>Export</Button></div>}>Audit events</SectionTitle>
            <BulkBar count={ts.selected.size} actions={["Investigate", "Add to case", "Export"]} onClear={ts.clear} />
            <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", overflow: "hidden", background: "var(--color-surface)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "var(--space-3)", background: "var(--color-surface-raised)", borderBottom: "1px solid var(--color-border)", width: "40px" }}><Checkbox checked={ts.allOn} indeterminate={ts.someOn} onChange={ts.toggleAll} /></th>
                    <SortHeader label="Time" k="time" sort={ts.sort} onSort={ts.onSort} align="right" />
                    <SortHeader label="Event" k="event" sort={ts.sort} onSort={ts.onSort} />
                    <SortHeader label="User" k="user" sort={ts.sort} onSort={ts.onSort} />
                    <SortHeader label="Resource type" k="resType" sort={ts.sort} onSort={ts.onSort} />
                    <SortHeader label="Store" k="store" sort={ts.sort} onSort={ts.onSort} />
                    <SortHeader label="Status" k="status" sort={ts.sort} onSort={ts.onSort} />
                    <SortHeader label="Risk" k="level" sort={ts.sort} onSort={ts.onSort} />
                  </tr>
                </thead>
                <tbody>
                  {ts.view.map((x, ri) => {
                    const on = x.id === sel;
                    const bd = ri < ts.view.length - 1 ? "1px solid var(--color-border)" : "none";
                    const checked = ts.selected.has(x.id);
                    return (
                      <tr key={x.id} onClick={() => setSel(x.id)} style={{ cursor: "pointer", background: on ? "var(--color-primary-subtle)" : checked ? "var(--color-surface-raised)" : "transparent" }}>
                        <td style={{ padding: "var(--space-3)", borderBottom: bd }}><Checkbox checked={checked} onChange={() => ts.toggle(x.id)} /></td>
                        <td style={{ padding: "var(--space-3)", borderBottom: bd, textAlign: "right", font: "var(--type-mono)", color: "var(--color-text-muted)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{x.time}</td>
                        <td style={{ padding: "var(--space-3)", borderBottom: bd, whiteSpace: "nowrap" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
                            <span style={{ color: "var(--color-text-muted)" }}><Icon name={x.icon} size={15} /></span>{x.event}
                          </span>
                        </td>
                        <td style={{ padding: "var(--space-3)", borderBottom: bd, font: "var(--type-mono)", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{x.user}</td>
                        <td style={{ padding: "var(--space-3)", borderBottom: bd, color: "var(--color-text-muted)", font: "var(--type-body)", whiteSpace: "nowrap" }}>{x.resType}</td>
                        <td style={{ padding: "var(--space-3)", borderBottom: bd, color: "var(--color-text-muted)", font: "var(--type-body)", whiteSpace: "nowrap" }}>{x.store}</td>
                        <td style={{ padding: "var(--space-3)", borderBottom: bd, whiteSpace: "nowrap" }}><Badge tone={x.status[0]}>{x.status[1]}</Badge></td>
                        <td style={{ padding: "var(--space-3)", borderBottom: bd, whiteSpace: "nowrap" }}><Badge tone={x.level[0]} dot={false}>{x.level[1]}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pager page={1} pages={2485} label={`Showing ${ts.view.length} of 24,842 events`} />
          </div>
        </div>

        {/* Event details drawer */}
        <DetailDrawer title="Event details" onClose={null} footer={<div style={{ display: "flex", gap: "var(--space-2)" }}><Button variant="secondary" style={{ flex: 1 }}>View in context</Button><Button variant="primary" style={{ flex: 1 }}>Investigate</Button></div>}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
            <Badge tone={e.status[0]}>{e.status[1]}</Badge>
            <Badge tone={e.level[0]} dot={false}>{e.level[1]} risk</Badge>
          </div>
          <div style={{ font: "var(--type-headline)", letterSpacing: "var(--tracking-headline)", marginBottom: "var(--space-1)" }}>{e.event}</div>
          <div style={{ font: "var(--type-mono)", color: "var(--color-text-muted)", marginBottom: "var(--space-4)" }}>{e.id}</div>

          <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 var(--space-2)" }}>Metadata</div>
          <KV k="Time" v="Jun 7, 2026 10:24:31 (UTC)" />
          <KV k="User" v={e.user} mono />
          <KV k="Role" v={e.role} />
          <KV k="IP address" v={e.ip} mono />
          <KV k="Location" v={e.loc} />
          <KV k="Session ID" v={e.session} mono />
          <KV k="Source" v="Retail Tower Console" />
          <KV k="Resource type" v={e.resType} />
          <KV k="Resource ID" v={e.res} mono />
          <KV k="Environment" v="Production" />
          <KV k="Store" v={e.store} />
          <KV k="Request ID" v={e.reqId} mono />

          <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "var(--space-4) 0 var(--space-2)" }}>Change summary</div>
          <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Field", "Old", "New"].map((h, i) => <th key={i} style={{ font: "600 var(--text-caption)/1 var(--font-sans)", color: "var(--color-text-muted)", textAlign: "left", padding: "var(--space-2)", background: "var(--color-surface-sunken)", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
              <tbody>
                {e.changes.map((c, i) => (
                  <tr key={i}>
                    <td style={{ padding: "var(--space-2)", borderTop: "1px solid var(--color-border)", font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{c[0]}</td>
                    <td style={{ padding: "var(--space-2)", borderTop: "1px solid var(--color-border)", font: "var(--type-mono)", color: "var(--color-danger-on)" }}>{c[1]}</td>
                    <td style={{ padding: "var(--space-2)", borderTop: "1px solid var(--color-border)", font: "var(--type-mono)", color: "var(--color-success-on)" }}>{c[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DetailDrawer>
      </div>
    </div>
  );
}

Object.assign(window, { Audit });
