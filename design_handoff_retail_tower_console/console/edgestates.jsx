/* Retail Tower Console — EDGE STATES gallery.
 * The "errors are first-class" spec made concrete: empty / loading / permission-denied /
 * error / offline / no-results, each as a specimen card showing the canonical treatment
 * (what happened, who can fix it, how — with a mono request_id where relevant). */

const DSes = window.RetailTowerConsoleDesignSystem_b7c448;
const esCard = { border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", boxShadow: "var(--shadow-card)", overflow: "hidden" };

function EdgeStates({ scope }) {
  const { Button, Badge, Icon, Banner } = DSes;
  const PageHeader = window.PageHeader;

  function Frame({ label, kind, children }) {
    return (
      <div style={esCard}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface-raised)" }}>
          <span style={{ font: "var(--type-label)" }}>{label}</span>
          <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>{kind}</span>
        </div>
        <div style={{ minHeight: "248px", display: "grid", placeItems: "center", padding: "var(--space-6)" }}>{children}</div>
      </div>
    );
  }

  const EmptyIcon = ({ name, tone }) => (
    <span style={{ width: "52px", height: "52px", borderRadius: "var(--radius-card)", display: "grid", placeItems: "center", background: tone ? `var(--color-${tone}-surface)` : "var(--color-surface-raised)", color: tone ? `var(--color-${tone}-on)` : "var(--color-text-muted)", border: "1px solid var(--color-border)", marginBottom: "var(--space-4)" }}><Icon name={name} size={26} /></span>
  );
  const Title = ({ children }) => <div style={{ font: "var(--type-headline)", textAlign: "center", marginBottom: "6px" }}>{children}</div>;
  const Sub = ({ children }) => <div style={{ font: "var(--type-body)", color: "var(--color-text-muted)", textAlign: "center", maxWidth: "320px", textWrap: "pretty", marginBottom: "var(--space-4)" }}>{children}</div>;

  function Skeleton() {
    return (
      <div style={{ width: "100%", maxWidth: "360px", display: "grid", gap: "var(--space-3)" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <div className="rtc-shimmer" style={{ width: "32px", height: "32px", borderRadius: "var(--radius-md)", flexShrink: 0 }} />
            <div style={{ flex: 1, display: "grid", gap: "6px" }}>
              <div className="rtc-shimmer" style={{ height: "10px", borderRadius: "var(--radius-sm)", width: `${80 - i * 8}%` }} />
              <div className="rtc-shimmer" style={{ height: "10px", borderRadius: "var(--radius-sm)", width: `${55 - i * 6}%` }} />
            </div>
            <div className="rtc-shimmer" style={{ width: "48px", height: "20px", borderRadius: "var(--radius-pill)", flexShrink: 0 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Edge states" subtitle={`Empty · loading · error · permission · offline — the canonical treatments`}
        actions={<span style={{ display: "inline-flex", alignItems: "center", height: "36px", padding: "0 var(--space-3)", borderRadius: "var(--radius-control)", border: "1px solid var(--color-border)", font: "var(--type-caption)", color: "var(--color-text-muted)" }}>Reference · errors are first-class</span>} />

      <div className="rtc-es" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-5)" }}>

        {/* Empty — no data yet */}
        <Frame label="Empty — first run" kind="no-data">
          <div style={{ display: "grid", placeItems: "center" }}>
            <EmptyIcon name="stores" />
            <Title>No stores yet</Title>
            <Sub>Create your first store to start capturing sales under {scope.tenant}.</Sub>
            <Button variant="primary" iconStart={<Icon name="plus" size={16} />}>New store</Button>
          </div>
        </Frame>

        {/* Loading */}
        <Frame label="Loading" kind="skeleton">
          <Skeleton />
        </Frame>

        {/* No results */}
        <Frame label="No results — filtered" kind="empty-query">
          <div style={{ display: "grid", placeItems: "center" }}>
            <EmptyIcon name="search" />
            <Title>No matching records</Title>
            <Sub>No audit events match <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-text)" }}>actor:layla</span> in this scope. Try widening the date range.</Sub>
            <Button variant="secondary">Clear filters</Button>
          </div>
        </Frame>

        {/* Permission denied */}
        <Frame label="Permission denied" kind="403">
          <div style={{ display: "grid", placeItems: "center" }}>
            <EmptyIcon name="audit" tone="warning" />
            <Title>Access not permitted</Title>
            <Sub>You do not have permission to view audit for this scope. A <b style={{ color: "var(--color-text)", fontWeight: 600 }}>Tenant Admin</b> can grant the <i>View audit · all scopes</i> capability.</Sub>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <Button variant="secondary">Request access</Button>
              <Button variant="ghost">Switch scope</Button>
            </div>
          </div>
        </Frame>

        {/* Error */}
        <Frame label="Error — load failed" kind="500">
          <div style={{ display: "grid", placeItems: "center", width: "100%" }}>
            <EmptyIcon name="alert" tone="danger" />
            <Title>Couldn't load reconciliation</Title>
            <Sub>The Data-Pulse-2 service didn't respond. Sales are unaffected — this is a read failure only.</Sub>
            <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
              <Button variant="primary" iconStart={<Icon name="link" size={16} />}>Retry</Button>
              <Button variant="ghost">View status</Button>
            </div>
            <span style={{ font: "var(--type-mono)", color: "var(--color-text-disabled)" }}>request_id 7e21-aa90-4c3f</span>
          </div>
        </Frame>

        {/* Offline */}
        <Frame label="Offline — degraded" kind="network">
          <div style={{ display: "grid", placeItems: "center", width: "100%" }}>
            <Banner tone="warning" icon={<Icon name="info" size={16} />} style={{ width: "100%", marginBottom: "var(--space-4)" }}>
              Connection lost — showing the last synced snapshot from <span style={{ fontFamily: "var(--font-mono)" }}>14:31</span>. Actions are paused until you reconnect.
            </Banner>
            <Sub>Sales keep capturing locally on each register and will post automatically once the connection is restored.</Sub>
            <Button variant="secondary" iconStart={<Icon name="link" size={16} />}>Reconnect</Button>
          </div>
        </Frame>
      </div>
    </div>
  );
}

Object.assign(window, { EdgeStates });
