/* Retail Tower Console — Catalog & Inventory (rich rebuild).
 * KPI strip · category tree · product master table · product details drawer ·
 * replenishment / inventory-insights / stock-by-location row. */

const DScat = window.RetailTowerConsoleDesignSystem_b7c448;

function Catalog({ scope }) {
  const { Button, Badge, Icon } = DScat;
  const { KpiCard, Donut, Panel } = window;
  const { TreeNode, DetailDrawer, KV, Toolbar, SearchInput, Pager, SectionTitle, Checkbox, SortHeader, BulkBar, useTableState } = window;

  const kpis = [
    { icon: "catalog", tone: "primary", label: "Total Products", value: "24,563", delta: "8.6%", deltaDir: "up", sub: "catalog size", spark: [21000, 21800, 22500, 23100, 23800, 24200, 24563], sparkColor: "var(--color-accent)" },
    { icon: "audit", tone: "success", label: "Active SKUs", value: "21,438", delta: "7.3%", deltaDir: "up", sub: "listed", spark: [19000, 19600, 20100, 20600, 21000, 21250, 21438], sparkColor: "var(--color-success-on)" },
    { icon: "overview", tone: "info", label: "Categories", value: "256", delta: "1.6%", deltaDir: "up", sub: "taxonomy", spark: [248, 250, 251, 253, 254, 255, 256], sparkColor: "var(--color-info-on)" },
    { icon: "unknown", tone: "warning", label: "Barcode Coverage", value: "98.42", unit: "%", delta: "0.8pp", deltaDir: "up", sub: "mapped", spark: [96.8, 97.2, 97.6, 98, 98.2, 98.3, 98.42], sparkColor: "var(--color-warning-on)" },
    { icon: "gauge", tone: "success", label: "Catalog Sync Health", value: "99.71", unit: "%", delta: "0.6pp", deltaDir: "up", sub: "to ERPNext", spark: [99.1, 99.3, 99.4, 99.5, 99.6, 99.7, 99.71], sparkColor: "var(--color-success-on)" },
    { icon: "stores", tone: "success", label: "Stock Accuracy", value: "97.23", unit: "%", delta: "1.2pp", deltaDir: "up", sub: "vs count", spark: [95.5, 95.9, 96.3, 96.7, 97, 97.1, 97.23], sparkColor: "var(--color-success-on)" },
  ];

  const tree = [{
    id: "all", label: "All categories", icon: "catalog", count: "24,563", children: [
      { id: "bev", label: "Beverages", count: "2,145", children: [
        { id: "soft", label: "Soft Drinks", count: 602 },
        { id: "juice", label: "Juices", count: 438 },
        { id: "water", label: "Water", count: 312 },
        { id: "energy", label: "Energy Drinks", count: 198 },
        { id: "teacoffee", label: "Tea & Coffee", count: 595 },
      ] },
      { id: "grocery", label: "Grocery", count: "6,852" },
      { id: "snacks", label: "Snacks", count: "3,245" },
      { id: "dairy", label: "Dairy & Eggs", count: "1,872" },
      { id: "bakery", label: "Bakery", count: "1,453" },
      { id: "personal", label: "Personal Care", count: "2,961" },
      { id: "household", label: "Household", count: "2,147" },
    ],
  }];

  const products = [
    { sku: "PRD-49210", name: "Nescafé Gold 200g", brand: "Nescafé", cat: "Beverages › Tea & Coffee", barcode: "7613036942010", unit: "Each", price: "189.00", cost: "121.00", stock: 4250, reorder: 1200, status: ["success", "Listed"], size: "200 g", pack: "Jar", shelf: "18 months", supplier: "Nestlé Egypt" },
    { sku: "PRD-49211", name: "Juhayna Full Cream 1L", brand: "Juhayna", cat: "Dairy & Eggs", barcode: "6223000511019", unit: "Each", price: "42.50", cost: "31.00", stock: 3980, reorder: 1000, status: ["success", "Listed"], size: "1 L", pack: "Carton", shelf: "6 months", supplier: "Juhayna Food" },
    { sku: "PRD-49255", name: "Molto Croissant 60g", brand: "Molto", cat: "Bakery", barcode: "6221031492551", unit: "Each", price: "12.00", cost: "7.40", stock: 1140, reorder: 1400, status: ["warning", "Price review"], size: "60 g", pack: "Wrap", shelf: "30 days", supplier: "Edita Foods" },
    { sku: "PRD-49301", name: "Lipton Yellow 100s", brand: "Lipton", cat: "Beverages › Tea & Coffee", barcode: "8901030493010", unit: "Each", price: "96.00", cost: "62.00", stock: 2780, reorder: 800, status: ["success", "Listed"], size: "100 bags", pack: "Box", shelf: "24 months", supplier: "Unilever Mashreq" },
    { sku: "PRD-49402", name: "Domty Feta 500g", brand: "Domty", cat: "Dairy & Eggs", barcode: "6223000494020", unit: "Each", price: "78.00", cost: "54.00", stock: 0, reorder: 600, status: ["danger", "Delisted"], size: "500 g", pack: "Tub", shelf: "4 months", supplier: "Domty" },
    { sku: "PRD-49510", name: "Coca-Cola 330ml Can", brand: "Coca-Cola", cat: "Beverages › Soft Drinks", barcode: "5449000000996", unit: "Each", price: "10.00", cost: "6.20", stock: 6240, reorder: 2000, status: ["success", "Listed"], size: "330 ml", pack: "Can", shelf: "12 months", supplier: "Coca-Cola Egypt" },
    { sku: "PRD-49620", name: "Ariel Detergent 1.5kg", brand: "Ariel", cat: "Household", barcode: "8001090496201", unit: "Each", price: "164.00", cost: "118.00", stock: 1010, reorder: 500, status: ["success", "Listed"], size: "1.5 kg", pack: "Box", shelf: "36 months", supplier: "P&G Egypt" },
  ];

  const [sel, setSel] = React.useState(products[0].sku);
  const [treeSel, setTreeSel] = React.useState("all");
  const p = products.find((x) => x.sku === sel) || products[0];
  const margin = (((parseFloat(p.price.replace(/,/g, "")) - parseFloat(p.cost.replace(/,/g, ""))) / parseFloat(p.price.replace(/,/g, ""))) * 100).toFixed(1);
  const pnum = (v) => parseFloat(String(v).replace(/[^0-9.]/g, "")) || 0;
  const ts = useTableState(products, {
    text: (x) => `${x.name} ${x.brand} ${x.sku} ${x.cat} ${x.barcode}`,
    getId: (x) => x.sku,
    sortAccessors: { name: (x) => x.name, sku: (x) => x.sku, cat: (x) => x.cat, price: (x) => pnum(x.price), stock: (x) => x.stock, status: (x) => x.status[1] },
  });

  return (
    <div>
      <PageHeader
        title="Catalog & Inventory"
        subtitle={`Manage product catalog, monitor inventory & data accuracy · ${scope.tenant}`}
        actions={<>
          <Button variant="secondary" iconStart={<Icon name="audit" size={16} />}>Import</Button>
          <Button variant="secondary" iconStart={<Icon name="audit" size={16} />}>Export</Button>
          <Button variant="primary" iconStart={<Icon name="plus" size={16} />}>Create product</Button>
        </>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "248px minmax(0,1fr) 332px", gap: "var(--space-5)", marginBottom: "var(--space-6)", alignItems: "start" }}>
        {/* Category tree */}
        <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", padding: "var(--space-4)" }}>
          <SectionTitle style={{ marginBottom: "var(--space-3)" }}>Category tree</SectionTitle>
          <div style={{ marginBottom: "var(--space-3)" }}><SearchInput placeholder="Search categories…" /></div>
          {tree.map((n) => <TreeNode key={n.id} node={n} activeId={treeSel} onSelect={setTreeSel} />)}
          <button type="button" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)", width: "100%", height: "36px", marginTop: "var(--space-3)", border: "1px dashed var(--color-border-strong)", borderRadius: "var(--radius-control)", color: "var(--color-text-muted)", cursor: "pointer", font: "var(--type-label)" }}><Icon name="plus" size={15} />Add category</button>
        </div>

        {/* Product master */}
        <div style={{ minWidth: 0 }}>
          <Toolbar>
            <SearchInput placeholder="Search by name, SKU, barcode…" value={ts.query} onChange={ts.setQuery} />
            <Button variant="secondary" iconStart={<Icon name="catalog" size={15} />}>Filters</Button>
            <Button variant="secondary" iconStart={<Icon name="overview" size={15} />}>Columns</Button>
          </Toolbar>
          <BulkBar count={ts.selected.size} actions={["Edit", "Re-price", "Delist", "Export"]} onClear={ts.clear} />
          <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", overflow: "hidden", background: "var(--color-surface)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: "var(--space-3)", background: "var(--color-surface-raised)", borderBottom: "1px solid var(--color-border)", width: "40px" }}><Checkbox checked={ts.allOn} indeterminate={ts.someOn} onChange={ts.toggleAll} /></th>
                  <SortHeader label="Product" k="name" sort={ts.sort} onSort={ts.onSort} />
                  <SortHeader label="SKU" k="sku" sort={ts.sort} onSort={ts.onSort} />
                  <SortHeader label="Category" k="cat" sort={ts.sort} onSort={ts.onSort} />
                  <SortHeader label="Price (EGP)" k="price" sort={ts.sort} onSort={ts.onSort} align="right" />
                  <SortHeader label="Stock" k="stock" sort={ts.sort} onSort={ts.onSort} align="right" />
                  <SortHeader label="Status" k="status" sort={ts.sort} onSort={ts.onSort} />
                </tr>
              </thead>
              <tbody>
                {ts.view.map((x, ri) => {
                  const on = x.sku === sel;
                  const bd = ri < ts.view.length - 1 ? "1px solid var(--color-border)" : "none";
                  const checked = ts.selected.has(x.sku);
                  return (
                    <tr key={x.sku} onClick={() => setSel(x.sku)} style={{ cursor: "pointer", background: on ? "var(--color-primary-subtle)" : checked ? "var(--color-surface-raised)" : "transparent" }}>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd }}><Checkbox checked={checked} onChange={() => ts.toggle(x.sku)} /></td>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd, whiteSpace: "nowrap" }}>
                        <div style={{ font: "var(--type-label)" }}>{x.name}</div>
                        <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{x.brand}</div>
                      </td>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd, font: "var(--type-mono)", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{x.sku}</td>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd, color: "var(--color-text-muted)", font: "var(--type-body)", whiteSpace: "nowrap" }}>{x.cat.split(" › ")[0]}</td>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd, textAlign: "right", font: "var(--type-mono)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{x.price}</td>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd, textAlign: "right", font: "var(--type-mono)", fontVariantNumeric: "tabular-nums", color: x.stock === 0 ? "var(--color-danger-on)" : x.stock < x.reorder ? "var(--color-warning-on)" : "var(--color-text-muted)", whiteSpace: "nowrap" }}>{x.stock.toLocaleString()}</td>
                      <td style={{ padding: "var(--space-3)", borderBottom: bd, whiteSpace: "nowrap" }}><Badge tone={x.status[0]}>{x.status[1]}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pager page={1} pages={2457} label={`Showing ${ts.view.length} of 24,563 products`} />
        </div>

        {/* Product details */}
        <DetailDrawer title="Product details" onClose={null} footer={<Button variant="secondary" style={{ width: "100%" }}>Edit product</Button>}>
          <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "var(--radius-md)", background: "var(--color-surface-sunken)", border: "1px solid var(--color-border)", display: "grid", placeItems: "center", color: "var(--color-text-disabled)", flexShrink: 0 }}><Icon name="catalog" size={26} /></div>
            <div style={{ minWidth: 0 }}>
              <div style={{ font: "var(--type-title)" }}>{p.name}</div>
              <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "2px" }}>{p.cat}</div>
              <div style={{ marginTop: "6px" }}><Badge tone={p.status[0]}>{p.status[1]}</Badge></div>
            </div>
          </div>

          <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 var(--space-2)" }}>Pricing & stock</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
            {[["Selling", `EGP ${p.price}`], ["Cost", `EGP ${p.cost}`], ["Margin", `${margin}%`]].map(([k, v]) => (
              <div key={k} style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", background: "var(--color-surface-sunken)", padding: "var(--space-2) var(--space-3)" }}>
                <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{k}</div>
                <div style={{ font: "700 14px/1.2 var(--font-sans)", fontVariantNumeric: "tabular-nums", marginTop: "2px" }}>{v}</div>
              </div>
            ))}
          </div>

          <KV k="SKU" v={p.sku} mono />
          <KV k="Barcode" v={p.barcode} mono />
          <KV k="Unit" v={p.unit} />
          <KV k="Current stock" v={p.stock.toLocaleString()} mono />
          <KV k="Reorder level" v={p.reorder.toLocaleString()} mono />
          <KV k="Size" v={p.size} />
          <KV k="Pack" v={p.pack} />
          <KV k="Shelf life" v={p.shelf} />
          <KV k="Supplier" v={p.supplier} />
        </DetailDrawer>
      </div>

      {/* Replenishment / insights / stock row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-5)" }}>
        <Panel title="Replenishment alerts" action={<a href="#" onClick={(e) => e.preventDefault()} style={{ font: "var(--type-caption)", color: "var(--color-accent)", textDecoration: "none", fontWeight: 600 }}>23 alerts ›</a>}>
          <div style={{ display: "grid" }}>
            {[
              { tone: "warning", name: "Molto Croissant 60g", store: "Maadi Grand", stock: "1,140", reorder: "1,400", tag: "Low stock" },
              { tone: "danger", name: "Domty Feta 500g", store: "Smouha Center", stock: "0", reorder: "600", tag: "Out of stock" },
              { tone: "info", name: "Coca-Cola 330ml Can", store: "Multiple stores", stock: "+24% demand", reorder: "2,000", tag: "High demand" },
            ].map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) 0", borderBottom: i < 2 ? "1px solid var(--color-border)" : "none" }}>
                <span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-md)", display: "grid", placeItems: "center", flexShrink: 0, background: a.tone === "danger" ? "var(--color-danger-surface)" : a.tone === "warning" ? "var(--color-warning-surface)" : "var(--color-info-surface)", color: a.tone === "danger" ? "var(--color-danger-on)" : a.tone === "warning" ? "var(--color-warning-on)" : "var(--color-info-on)" }}><Icon name={a.tone === "info" ? "activity" : "alert"} size={15} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "var(--type-label)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                  <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{a.store} · stock {a.stock} · reorder {a.reorder}</div>
                </div>
                <Badge tone={a.tone} dot={false}>{a.tag}</Badge>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Inventory insights">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            {[
              ["Inventory value", "EGP 1.24M", "+6.3%", true],
              ["Days of supply", "18.6", "+1.2", true],
              ["Slow-moving SKUs", "1,245", "+3.6%", false],
              ["Stock turnover", "5.8×", "+0.7×", true],
            ].map(([k, v, d, up]) => (
              <div key={k} style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", background: "var(--color-surface-sunken)", padding: "var(--space-3)" }}>
                <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{k}</div>
                <div style={{ font: "700 18px/1.2 var(--font-sans)", fontVariantNumeric: "tabular-nums", margin: "2px 0" }}>{v}</div>
                <div style={{ font: "var(--type-caption)", color: up ? "var(--color-success-on)" : "var(--color-danger-on)", fontWeight: 600 }}>{up ? "▴" : "▾"} {d} vs last week</div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Stock by location">
          <Donut segments={[
            { label: "Cairo Festival City", value: 57780, color: "var(--color-primary)" },
            { label: "Mall of Egypt", value: 47980, color: "var(--color-accent)" },
            { label: "City Stars", value: 41820, color: "var(--color-info-on)" },
            { label: "Maadi Grand", value: 37880, color: "var(--color-success-on)" },
            { label: "Others", value: 39980, color: "var(--color-text-muted)" },
          ]} />
        </Panel>
      </div>
    </div>
  );
}

Object.assign(window, { Catalog });
