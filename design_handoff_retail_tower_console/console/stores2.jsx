/* Retail Tower Console — Stores & Tenants (rich rebuild).
 * KPI strip · tenant hierarchy tree · store directory · selectable detail drawer ·
 * rollout / device-health / hours-compliance row. Overrides the thin screens.jsx version. */

const DSstores = window.RetailTowerConsoleDesignSystem_b7c448;

function Stores({ scope }) {
  const { Button, Badge, Icon } = DSstores;
  const { KpiCard, Donut, Panel } = window;
  const { Tabs, TreeNode, Gauge, DetailDrawer, KV, Toolbar, SearchInput, Pager, SectionTitle, Checkbox, SortHeader, BulkBar, useTableState } = window;

  const kpis = [
    { icon: "stores", tone: "primary", label: "Total Tenants", value: "42", delta: "5.0%", deltaDir: "up", sub: "active", spark: [36, 37, 38, 39, 40, 41, 42], sparkColor: "var(--color-accent)" },
    { icon: "stores", tone: "success", label: "Active Stores", value: "1,248", delta: "3.1%", deltaDir: "up", sub: "of 1,290", spark: [1180, 1195, 1210, 1222, 1235, 1242, 1248], sparkColor: "var(--color-success-on)" },
    { icon: "plus", tone: "info", label: "New Openings (30d)", value: "18", delta: "20.0%", deltaDir: "up", sub: "this month", spark: [9, 11, 12, 14, 15, 17, 18], sparkColor: "var(--color-info-on)" },
    { icon: "gauge", tone: "primary", label: "Store Health", value: "92.4", unit: "%", delta: "1.2pp", deltaDir: "up", sub: "avg index", spark: [90, 90.5, 91, 91.4, 92, 92.2, 92.4], sparkColor: "var(--color-accent)" },
    { icon: "signal", tone: "info", label: "Paired Terminals", value: "2,842", delta: "6.3%", deltaDir: "up", sub: "POS devices", spark: [2600, 2660, 2700, 2740, 2790, 2820, 2842], sparkColor: "var(--color-info-on)" },
    { icon: "audit", tone: "success", label: "Compliance Score", value: "98.6", unit: "%", delta: "1.7pp", deltaDir: "up", sub: "policy adherence", spark: [96.5, 97, 97.4, 97.9, 98.2, 98.4, 98.6], sparkColor: "var(--color-success-on)" },
  ];

  const tree = [{
    id: "northstar", label: "Northstar Retail", icon: "stores", count: 42, children: [
      { id: "ng-greater-cairo", label: "Greater Cairo", count: 18, children: [
        { id: "ng-newcairo", label: "New Cairo", count: 6 },
        { id: "ng-october", label: "6th of October", count: 5 },
        { id: "ng-heliopolis", label: "Heliopolis", count: 4 },
      ] },
      { id: "ng-alex", label: "Alexandria", count: 9, children: [
        { id: "ng-corniche", label: "Corniche", count: 5 },
        { id: "ng-smouha", label: "Smouha", count: 4 },
      ] },
      { id: "ng-delta", label: "Nile Delta", count: 15 },
    ],
  }];

  const stores = [
    { id: "CFC-01", name: "Cairo Festival City", region: "New Cairo", status: ["success", "Active"], health: 97, sales: "412,250", terminals: 12, compliance: "99%", mgr: "Amal Saleh", addr: "Ring Rd, New Cairo, Cairo", phone: "+20 2 2618 0100", type: "Flagship", opened: "Jan 15, 2022", tx: "2,145" },
    { id: "MOE-02", name: "Mall of Egypt", region: "6th of October", status: ["success", "Active"], health: 95, sales: "358,920", terminals: 10, compliance: "98%", mgr: "Karim Adel", addr: "Mall of Egypt, 6th of October", phone: "+20 2 3850 4200", type: "Flagship", opened: "Mar 02, 2022", tx: "1,876" },
    { id: "CSH-03", name: "City Stars Heliopolis", region: "Heliopolis", status: ["warning", "Provisioning"], health: 88, sales: "298,410", terminals: 8, compliance: "93%", mgr: "Nour Hassan", addr: "City Stars, Heliopolis, Cairo", phone: "+20 2 2480 2222", type: "Standard", opened: "Jun 10, 2024", tx: "1,512" },
    { id: "MAD-04", name: "Maadi Grand", region: "Maadi", status: ["success", "Active"], health: 94, sales: "245,600", terminals: 7, compliance: "96%", mgr: "Omar Fathy", addr: "Cornish El Nil, Maadi, Cairo", phone: "+20 2 2358 9000", type: "Standard", opened: "Sep 01, 2023", tx: "1,243" },
    { id: "ALX-05", name: "Alexandria Corniche", region: "Corniche", status: ["danger", "Suspended"], health: 61, sales: "198,330", terminals: 5, compliance: "74%", mgr: "—", addr: "Corniche Rd, Alexandria", phone: "—", type: "Standard", opened: "Nov 20, 2021", tx: "1,021" },
    { id: "SMU-06", name: "Smouha Center", region: "Smouha", status: ["success", "Active"], health: 91, sales: "176,540", terminals: 6, compliance: "95%", mgr: "Hana Adel", addr: "Smouha, Alexandria", phone: "+20 3 426 7788", type: "Express", opened: "Feb 12, 2024", tx: "964" },
  ];

  const [sel, setSel] = React.useState(stores[0].id);
  const [treeSel, setTreeSel] = React.useState("northstar");
  const [tab, setTab] = React.useState("all");
  const store = stores.find((s) => s.id === sel) || stores[0];
  const num = (v) => parseFloat(String(v).replace(/[^0-9.]/g, "")) || 0;
  const ts = useTableState(stores, {
    text: (s) => `${s.name} ${s.id} ${s.region} ${s.status[1]} ${s.mgr}`,
    getId: (s) => s.id,
    sortAccessors: { name: (s) => s.name, region: (s) => s.region, status: (s) => s.status[1], health: (s) => s.health, sales: (s) => num(s.sales), terminals: (s) => s.terminals, compliance: (s) => num(s.compliance) },
  });

  const healthColor = (h) => h >= 90 ? "var(--color-success-on)" : h >= 75 ? "var(--color-warning-on)" : "var(--color-danger-on)";

  return (
    <div>
      <PageHeader
        title="Stores & Tenants"
        subtitle={`Tenants, stores & operational performance · ${scope.tenant} · ${scope.store}`}
        actions={<>
          <Button variant="secondary" iconStart={<Icon name="audit" size={16} />}>Export</Button>
          <Button variant="primary" iconStart={<Icon name="plus" size={16} />}>New store</Button>
        </>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "248px minmax(0,1fr) 332px", gap: "var(--space-5)", marginBottom: "var(--space-6)", alignItems: "start" }}>
        {/* Tenant hierarchy */}
        <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", padding: "var(--space-4)" }}>
          <SectionTitle style={{ marginBottom: "var(--space-3)" }}>Tenant hierarchy</SectionTitle>
          <div style={{ marginBottom: "var(--space-3)" }}><SearchInput placeholder="Search tenants…" /></div>
          {tree.map((n) => <TreeNode key={n.id} node={n} activeId={treeSel} onSelect={setTreeSel} />)}
        </div>

        {/* Store directory */}
        <div style={{ minWidth: 0 }}>
          <Tabs items={[{ id: "all", label: "All stores", count: 1248 }, { id: "active", label: "Active", count: 1186 }, { id: "provisioning", label: "Provisioning", count: 38 }, { id: "suspended", label: "Suspended", count: 24 }]} active={tab} onChange={setTab} />
          <Toolbar>
            <SearchInput placeholder="Search stores by name, ID, region…" value={ts.query} onChange={ts.setQuery} />
            <Button variant="secondary" iconStart={<Icon name="catalog" size={15} />}>Filters</Button>
          </Toolbar>
          <BulkBar count={ts.selected.size} actions={["Sync now", "Suspend", "Export"]} onClear={ts.clear} />
          <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", overflow: "hidden", background: "var(--color-surface)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: "var(--space-3)", background: "var(--color-surface-raised)", borderBottom: "1px solid var(--color-border)", width: "40px" }}><Checkbox checked={ts.allOn} indeterminate={ts.someOn} onChange={ts.toggleAll} /></th>
                  <SortHeader label="Store" k="name" sort={ts.sort} onSort={ts.onSort} />
                  <SortHeader label="Region" k="region" sort={ts.sort} onSort={ts.onSort} />
                  <SortHeader label="Status" k="status" sort={ts.sort} onSort={ts.onSort} />
                  <SortHeader label="Health" k="health" sort={ts.sort} onSort={ts.onSort} align="right" />
                  <SortHeader label="Sales (EGP)" k="sales" sort={ts.sort} onSort={ts.onSort} align="right" />
                  <SortHeader label="Term." k="terminals" sort={ts.sort} onSort={ts.onSort} align="right" />
                  <SortHeader label="Comp." k="compliance" sort={ts.sort} onSort={ts.onSort} align="right" />
                </tr>
              </thead>
              <tbody>
                {ts.view.map((s, ri) => {
                  const on = s.id === sel;
                  const bd = ri < ts.view.length - 1 ? "1px solid var(--color-border)" : "none";
                  const checked = ts.selected.has(s.id);
                  return (
                    <tr key={s.id} onClick={() => setSel(s.id)} style={{ cursor: "pointer", background: on ? "var(--color-primary-subtle)" : checked ? "var(--color-surface-raised)" : "transparent" }}>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd }}><Checkbox checked={checked} onChange={() => ts.toggle(s.id)} /></td>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd, whiteSpace: "nowrap" }}>
                        <div style={{ font: "var(--type-label)" }}>{s.name}</div>
                        <div style={{ font: "var(--type-mono)", color: "var(--color-text-muted)" }}>{s.id}</div>
                      </td>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd, color: "var(--color-text-muted)", font: "var(--type-body)", whiteSpace: "nowrap" }}>{s.region}</td>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd, whiteSpace: "nowrap" }}><Badge tone={s.status[0]}>{s.status[1]}</Badge></td>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd, textAlign: "right", whiteSpace: "nowrap" }}><span style={{ font: "600 var(--text-label)/1 var(--font-mono)", color: healthColor(s.health) }}>{s.health}%</span></td>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd, textAlign: "right", font: "var(--type-mono)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{s.sales}</td>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd, textAlign: "right", font: "var(--type-mono)", color: "var(--color-text-muted)", fontVariantNumeric: "tabular-nums" }}>{s.terminals}</td>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd, textAlign: "right", font: "var(--type-mono)", color: "var(--color-text-muted)", fontVariantNumeric: "tabular-nums" }}>{s.compliance}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pager page={1} pages={178} label={`Showing ${ts.view.length} of 1,248 stores`} />
        </div>

        {/* Detail drawer */}
        <DetailDrawer title="Store details" onClose={null} footer={<Button variant="secondary" style={{ width: "100%" }}>View full store profile</Button>}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
            <div>
              <div style={{ font: "var(--type-mono)", color: "var(--color-text-muted)" }}>{store.id}</div>
              <div style={{ font: "var(--type-headline)", letterSpacing: "var(--tracking-headline)" }}>{store.name}</div>
            </div>
            <Badge tone={store.status[0]}>{store.status[1]}</Badge>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
            {[["Health", `${store.health}%`, healthColor(store.health)], ["Sales (7d)", store.sales, "var(--color-text)"], ["Tx (7d)", store.tx, "var(--color-text)"]].map(([k, v, c]) => (
              <div key={k} style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", background: "var(--color-surface-sunken)", padding: "var(--space-3)" }}>
                <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{k}</div>
                <div style={{ font: "700 16px/1.2 var(--font-sans)", fontVariantNumeric: "tabular-nums", color: c, marginTop: "2px" }}>{v}</div>
              </div>
            ))}
          </div>
          <KV k="Tenant" v={scope.tenant} />
          <KV k="Region" v={store.region} />
          <KV k="Store type" v={store.type} />
          <KV k="Manager" v={store.mgr} />
          <KV k="Terminals" v={store.terminals} mono />
          <KV k="Compliance" v={store.compliance} mono />
          <KV k="Opened" v={store.opened} />
          <KV k="Phone" v={store.phone} mono />
          <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "var(--space-3)" }}>Address</div>
          <div style={{ font: "var(--type-body)", marginTop: "2px" }}>{store.addr}</div>
        </DetailDrawer>
      </div>

      {/* Rollout / device / hours row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-5)" }}>
        <Panel title="Store rollout & onboarding" action={<a href="#" onClick={(e) => e.preventDefault()} style={{ font: "var(--type-caption)", color: "var(--color-accent)", textDecoration: "none", fontWeight: 600 }}>View all ›</a>}>
          <Donut segments={[
            { label: "Completed", value: 982, color: "var(--color-success-on)" },
            { label: "In progress", value: 167, color: "var(--color-accent)" },
            { label: "Scheduled", value: 22, color: "var(--color-info-on)" },
            { label: "On hold", value: 4, color: "var(--color-warning-on)" },
          ]} />
        </Panel>
        <Panel title="Device & terminal health" action={<a href="#" onClick={(e) => e.preventDefault()} style={{ font: "var(--type-caption)", color: "var(--color-accent)", textDecoration: "none", fontWeight: 600 }}>View all ›</a>}>
          <Donut segments={[
            { label: "Healthy", value: 2345, color: "var(--color-success-on)" },
            { label: "Warning", value: 312, color: "var(--color-warning-on)" },
            { label: "Critical", value: 123, color: "var(--color-danger-on)" },
            { label: "Offline", value: 62, color: "var(--color-text-muted)" },
          ]} />
        </Panel>
        <Panel title="Store hours compliance">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-5)" }}>
            <Gauge value={98.6} label="98.6%" sub="compliant" color="var(--color-success-on)" />
            <div style={{ display: "grid", gap: "var(--space-2)", flex: 1, font: "var(--type-body)" }}>
              {[["Compliant", "1,232", "var(--color-success-on)"], ["Non-compliant", "16", "var(--color-warning-on)"], ["Unknown", "0", "var(--color-text-muted)"]].map(([k, v, c]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: c }} />
                  <span style={{ flex: 1, color: "var(--color-text-muted)" }}>{k}</span>
                  <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

Object.assign(window, { Stores });
