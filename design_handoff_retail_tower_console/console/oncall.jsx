/* Retail Tower Console — ALERT & ON-CALL.
 * Closes the paging loop behind the Incident War-Room: escalation policies, the live
 * on-call rotation (who gets paged now / next), and recent alert routing. Status on
 * badges; gold authority-only (unused). */

const DSoc = window.RetailTowerConsoleDesignSystem_b7c448;
const ocCard = { border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", boxShadow: "var(--shadow-card)", overflow: "hidden" };

function AlertOnCall({ scope }) {
  const { Button, Badge, Icon, Banner } = DSoc;
  const PageHeader = window.PageHeader;
  const { Avatar, useLive } = window;
  useLive(5000);

  const policies = [
    { name: "Platform SRE", scope: "All tenants · infrastructure", steps: ["Page primary on-call", "+10m → secondary", "+20m → SRE lead", "+30m → VP Eng"], chan: "Push · SMS · Call", tone: "danger" },
    { name: "ERP Connector", scope: "Northstar Retail · integrations", steps: ["Page connector on-call", "+15m → platform SRE", "+30m → tenant owner"], chan: "Push · SMS", tone: "warning" },
    { name: "Store Operations", scope: "Per-store · business hours", steps: ["Notify store manager", "+20m → regional lead"], chan: "Push", tone: "info" },
  ];

  const rotation = [
    { name: "Amal Saleh", role: "Primary · Platform SRE", state: "on", until: "until 18:00", tone: "danger" },
    { name: "Hassan Nabil", role: "Secondary · Platform SRE", state: "backup", until: "shadow", tone: "warning" },
    { name: "Layla Mansour", role: "Primary · ERP Connector", state: "on", until: "until 20:00", tone: "danger" },
    { name: "Tarek Sami", role: "Next · Platform SRE", state: "next", until: "18:00–02:00", tone: "info" },
  ];

  const recent = [
    { t: "14:14", policy: "ERP Connector", target: "Layla Mansour", ack: "3m", status: "resolved" },
    { t: "14:14", policy: "Platform SRE", target: "Amal Saleh", ack: "3m", status: "resolved" },
    { t: "09:02", policy: "Store Operations", target: "Nadia Kamel", ack: "1m", status: "resolved" },
    { t: "Yest 23:48", policy: "Platform SRE", target: "Hassan Nabil", ack: "6m", status: "resolved" },
    { t: "Yest 21:15", policy: "ERP Connector", target: "Layla Mansour", ack: "—", status: "auto-resolved" },
  ];
  const stMeta = { resolved: { tone: "success", label: "Resolved" }, "auto-resolved": { tone: "info", label: "Auto-resolved" }, firing: { tone: "danger", label: "Firing" } };
  const stateBadge = { on: { tone: "danger", label: "On call" }, backup: { tone: "warning", label: "Backup" }, next: { tone: "info", label: "Up next" } };

  function act(m, t) { window.rtcToast && window.rtcToast(m, t || "info"); }

  return (
    <div>
      <PageHeader title="Alert & On-Call" subtitle={`Escalation policies & rotation · ${scope.tenant}`}
        actions={<>
          <Button variant="secondary" iconStart={<Icon name="bell" size={16} />} onClick={() => act("Test page sent to primary on-call")}>Send test page</Button>
          <Button variant="primary" iconStart={<Icon name="plus" size={16} />} onClick={() => act("New escalation policy")}>New policy</Button>
        </>} />

      <div className="rtc-oc" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: "var(--space-5)", alignItems: "start" }}>
        <div style={{ display: "grid", gap: "var(--space-5)", minWidth: 0 }}>
          {/* Policies */}
          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            {policies.map((p) => (
              <div key={p.name} style={{ ...ocCard, padding: "var(--space-5)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
                  <div>
                    <div style={{ font: "var(--type-title)" }}>{p.name}</div>
                    <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "2px" }}>{p.scope}</div>
                  </div>
                  <Badge tone="info">{p.chan}</Badge>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0", flexWrap: "wrap" }}>
                  {p.steps.map((s, i) => (
                    <React.Fragment key={i}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "var(--radius-pill)", background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", font: "var(--type-caption)", color: "var(--color-text)" }}>
                        <span style={{ width: "18px", height: "18px", borderRadius: "9999px", display: "grid", placeItems: "center", background: i === 0 ? `var(--color-${p.tone}-surface)` : "var(--color-surface)", color: i === 0 ? `var(--color-${p.tone}-on)` : "var(--color-text-muted)", font: "700 10px/1 var(--font-mono)" }}>{i + 1}</span>
                        {s}
                      </span>
                      {i < p.steps.length - 1 ? <span style={{ color: "var(--color-text-disabled)", padding: "0 4px", display: "inline-flex" }}><Icon name="chevron" size={14} style={{ transform: "rotate(-90deg)" }} /></span> : null}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Recent pages */}
          <div style={ocCard}>
            <div style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)", font: "var(--type-title)" }}>Recent pages</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[["Time", "left"], ["Policy", "left"], ["Paged", "left"], ["Ack", "right"], ["Status", "left"]].map(([h, a]) => (
                    <th key={h} style={{ font: "600 var(--text-caption)/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", textAlign: a, padding: "var(--space-3) var(--space-4)", background: "var(--color-surface-raised)", borderBottom: "1px solid var(--color-border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((x, i) => (
                  <tr key={i} style={{ borderTop: i ? "1px solid var(--color-border)" : "none" }}>
                    <td style={{ padding: "var(--space-3) var(--space-4)", font: "var(--type-mono)", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{x.t}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", font: "var(--type-body)" }}>{x.policy}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", font: "var(--type-body)", color: "var(--color-text-muted)" }}>{x.target}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", font: "var(--type-mono)", color: "var(--color-text-muted)" }}>{x.ack}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)" }}><Badge tone={stMeta[x.status].tone}>{stMeta[x.status].label}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* On-call now */}
        <div style={{ display: "grid", gap: "var(--space-5)" }}>
          <div style={{ ...ocCard, padding: "var(--space-5)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
              <span style={{ font: "var(--type-title)" }}>On call now</span>
              <span className="rtc-pulse" style={{ width: "8px", height: "8px", borderRadius: "9999px", background: "var(--color-success-on)" }} />
            </div>
            <div style={{ display: "grid", gap: "var(--space-1)" }}>
              {rotation.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) 0", borderTop: i ? "1px solid var(--color-border)" : "none" }}>
                  <Avatar name={p.name} size={34} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ font: "var(--type-label)" }}>{p.name}</div>
                    <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{p.role}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Badge tone={stateBadge[p.state].tone}>{stateBadge[p.state].label}</Badge>
                    <div style={{ font: "var(--type-caption)", color: "var(--color-text-disabled)", marginTop: "3px" }}>{p.until}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="secondary" iconStart={<Icon name="operators" size={16} />} onClick={() => act("Override on-call assignment")} style={{ width: "100%", marginTop: "var(--space-4)" }}>Override</Button>
          </div>

          <div style={{ ...ocCard, padding: "var(--space-5)" }}>
            <div style={{ font: "var(--type-title)", marginBottom: "var(--space-3)" }}>This week</div>
            <div style={{ display: "grid", gap: "var(--space-1)" }}>
              <OcKv k="Pages fired" v="11" />
              <OcKv k="Median ack" v="3m 20s" mono />
              <OcKv k="Auto-resolved" v="36%" />
              <OcKv k="Escalated to L2" v="2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OcKv({ k, v, mono }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-3)" }}>
      <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{k}</span>
      <span style={{ font: mono ? "var(--type-mono)" : "var(--type-label)", color: "var(--color-text)" }}>{v}</span>
    </div>
  );
}

Object.assign(window, { AlertOnCall });
