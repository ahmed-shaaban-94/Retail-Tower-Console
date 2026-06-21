/* Retail Tower Console — ONBOARD STORE (wizard).
 * Staged go-live: Details → Catalog seed → Operators → Integrations → Go-live.
 * Left stepper, center form, right live summary + readiness checklist. Composes
 * design-system Field / Input / Button. Gold stays authority-only (unused). */

const DSob = window.RetailTowerConsoleDesignSystem_b7c448;
const obCard = { border: "1px solid var(--color-border)", borderRadius: "var(--radius-card)", background: "var(--color-surface)", boxShadow: "var(--shadow-card)" };

function OnboardStore({ scope }) {
  const { Button, Badge, Icon, Input, Field } = DSob;
  const PageHeader = window.PageHeader;

  const steps = [
    { id: "details", label: "Store details", icon: "stores", hint: "Name, code, location" },
    { id: "catalog", label: "Catalog seed", icon: "catalog", hint: "Import or clone" },
    { id: "operators", label: "Operators", icon: "operators", hint: "Invite the team" },
    { id: "integrations", label: "Integrations", icon: "link", hint: "ERP & POS link" },
    { id: "golive", label: "Go-live", icon: "check", hint: "Final checklist" },
  ];
  const [active, setActive] = React.useState(0);
  const done = active; // steps before active are complete

  function act(m) { window.rtcToast && window.rtcToast(m, "info"); }
  const next = () => setActive((a) => Math.min(steps.length - 1, a + 1));
  const back = () => setActive((a) => Math.max(0, a - 1));

  const body = [
    // 0 — details
    <div key="d" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4) var(--space-5)" }}>
      <Field label="Store name" htmlFor="ob-name" hint="Shown across the console"><Input id="ob-name" defaultValue="Cairo Festival City" /></Field>
      <Field label="Store code" htmlFor="ob-code" hint="Unique within the tenant"><Input id="ob-code" defaultValue="CFC-01" /></Field>
      <Field label="Region" htmlFor="ob-region"><ObSelect id="ob-region" options={["Greater Cairo", "Alexandria", "Nile Delta"]} /></Field>
      <Field label="Timezone" htmlFor="ob-tz"><ObSelect id="ob-tz" options={["Africa/Cairo (GMT+2)"]} /></Field>
      <div style={{ gridColumn: "1 / -1" }}><Field label="Address" htmlFor="ob-addr"><Input id="ob-addr" defaultValue="Ring Road, New Cairo, Cairo Governorate" /></Field></div>
      <Field label="Currency" htmlFor="ob-cur" hint="Platform-fixed"><Input id="ob-cur" defaultValue="EGP — Egyptian Pound" disabled /></Field>
      <Field label="Tax profile" htmlFor="ob-tax"><ObSelect id="ob-tax" options={["Standard 14% VAT", "Zero-rated", "Exempt"]} /></Field>
    </div>,
    // 1 — catalog
    <div key="c" style={{ display: "grid", gap: "var(--space-4)" }}>
      <div style={{ font: "var(--type-body)", color: "var(--color-text-muted)" }}>Seed this store's catalog. You can refine SKUs after go-live.</div>
      {[["Clone from existing store", "Copy 1,284 SKUs from Mall of Egypt", true], ["Import from ERPNext", "Pull the master item list from the back office", false], ["Start empty", "Add items manually later", false]].map(([t, s, on], i) => (
        <label key={i} style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-4)", border: `1px solid ${on ? "var(--color-primary)" : "var(--color-border)"}`, borderRadius: "var(--radius-control)", background: on ? "var(--color-primary-subtle)" : "var(--color-surface)", cursor: "pointer", alignItems: "flex-start" }}>
          <span style={{ width: "18px", height: "18px", borderRadius: "9999px", border: `1.5px solid ${on ? "var(--color-primary)" : "var(--color-border-strong)"}`, display: "grid", placeItems: "center", flexShrink: 0, marginTop: "2px" }}>{on ? <span style={{ width: "9px", height: "9px", borderRadius: "9999px", background: "var(--color-primary)" }} /> : null}</span>
          <div><div style={{ font: "var(--type-label)" }}>{t}</div><div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "2px" }}>{s}</div></div>
        </label>
      ))}
    </div>,
    // 2 — operators
    <div key="o" style={{ display: "grid", gap: "var(--space-4)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 200px auto", gap: "var(--space-3)", alignItems: "end" }}>
        <Field label="Invite by email" htmlFor="ob-inv"><Input id="ob-inv" placeholder="name@northstar.eg" /></Field>
        <Field label="Role" htmlFor="ob-role"><ObSelect id="ob-role" options={["Store Manager", "Store Staff"]} /></Field>
        <Button variant="secondary" iconStart={<Icon name="plus" size={16} />} onClick={() => act("Invite sent")} style={{ height: "36px" }}>Invite</Button>
      </div>
      <div style={{ ...obCard, overflow: "hidden" }}>
        {[["Nadia Kamel", "Store Manager", "Accepted"], ["Omar Fathy", "Store Staff", "Invited"], ["Mariam Adel", "Store Staff", "Invited"]].map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)", borderTop: i ? "1px solid var(--color-border)" : "none" }}>
            <span style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--color-primary-subtle)", color: "var(--color-accent)", display: "grid", placeItems: "center", font: "700 12px/1 var(--font-sans)", flexShrink: 0 }}>{r[0].split(" ").map((p) => p[0]).join("")}</span>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ font: "var(--type-label)" }}>{r[0]}</div><div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{r[1]}</div></div>
            <Badge tone={r[2] === "Accepted" ? "success" : "info"}>{r[2]}</Badge>
          </div>
        ))}
      </div>
    </div>,
    // 3 — integrations
    <div key="i" style={{ display: "grid", gap: "var(--space-3)" }}>
      {[["ERPNext", "server", "Connected", "success", "Back-office posting & inventory"], ["POS-Pulse", "gauge", "2 terminals paired", "success", "Point-of-sale registers"], ["Data-Pulse-2", "database", "Streaming", "success", "Telemetry & reconciliation feed"], ["Frappe Orchestrator", "link", "Awaiting first sync", "warning", "Workflow engine"]].map((r, i) => (
        <div key={i} style={{ ...obCard, display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-4) var(--space-5)" }}>
          <span style={{ width: "34px", height: "34px", borderRadius: "var(--radius-md)", background: "var(--color-surface-raised)", color: "var(--color-text-muted)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name={r[1]} size={18} /></span>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ font: "var(--type-label)" }}>{r[0]}</div><div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{r[4]}</div></div>
          <Badge tone={r[3]}>{r[2]}</Badge>
        </div>
      ))}
    </div>,
    // 4 — go-live
    <div key="g" style={{ display: "grid", gap: "var(--space-3)" }}>
      {[["Store details complete", true], ["Catalog seeded (1,284 SKUs)", true], ["At least one manager invited", true], ["ERP & POS connected", true], ["Frappe Orchestrator first sync", false], ["Opening cash float recorded", false]].map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-control)", background: "var(--color-surface)" }}>
          <span style={{ width: "24px", height: "24px", borderRadius: "9999px", display: "grid", placeItems: "center", flexShrink: 0, background: r[1] ? "var(--color-success-surface)" : "var(--color-surface-raised)", color: r[1] ? "var(--color-success-on)" : "var(--color-text-disabled)", border: `1.5px solid ${r[1] ? "var(--color-success-on)" : "var(--color-border-strong)"}` }}>{r[1] ? <Icon name="check" size={13} strokeWidth={2.5} /> : <Icon name="clock" size={13} />}</span>
          <span style={{ font: "var(--type-body)", color: r[1] ? "var(--color-text)" : "var(--color-text-muted)" }}>{r[0]}</span>
        </div>
      ))}
    </div>,
  ];

  return (
    <div>
      <PageHeader title="Onboard store" subtitle={`New store · ${scope.tenant} · 4 of 5 stages complete`}
        actions={<Button variant="ghost" onClick={() => act("Draft saved")}>Save draft & exit</Button>} />

      <div className="rtc-onboard" style={{ display: "grid", gridTemplateColumns: "240px minmax(0,1fr) 280px", gap: "var(--space-5)", alignItems: "start" }}>
        {/* Stepper */}
        <div style={{ ...obCard, padding: "var(--space-4) var(--space-3)" }}>
          {steps.map((s, i) => {
            const isDone = i < done, isOn = i === active;
            return (
              <button key={s.id} type="button" onClick={() => setActive(i)} style={{ position: "relative", width: "100%", textAlign: "left", display: "flex", gap: "var(--space-3)", padding: "var(--space-2) var(--space-3)", cursor: "pointer", background: "transparent" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ width: "30px", height: "30px", borderRadius: "9999px", display: "grid", placeItems: "center", flexShrink: 0, background: isDone ? "var(--color-success-surface)" : isOn ? "var(--color-primary-subtle)" : "var(--color-surface-raised)", color: isDone ? "var(--color-success-on)" : isOn ? "var(--color-accent)" : "var(--color-text-disabled)", border: `1.5px solid ${isDone ? "var(--color-success-on)" : isOn ? "var(--color-primary)" : "var(--color-border-strong)"}` }}>{isDone ? <Icon name="check" size={15} strokeWidth={2.5} /> : <span style={{ font: "700 13px/1 var(--font-mono)" }}>{i + 1}</span>}</span>
                  {i < steps.length - 1 ? <span style={{ flex: 1, width: "2px", minHeight: "20px", background: isDone ? "var(--color-success-on)" : "var(--color-border)", marginTop: "4px" }} /> : null}
                </div>
                <div style={{ paddingBottom: "var(--space-3)", paddingTop: "4px" }}>
                  <div style={{ font: "var(--type-label)", color: isOn ? "var(--color-text)" : isDone ? "var(--color-text)" : "var(--color-text-muted)" }}>{s.label}</div>
                  <div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "2px" }}>{s.hint}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Form */}
        <div style={{ ...obCard, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
            <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-md)", background: "var(--color-primary-subtle)", color: "var(--color-accent)", display: "grid", placeItems: "center" }}><Icon name={steps[active].icon} size={18} /></span>
            <div><div style={{ font: "var(--type-title)" }}>{steps[active].label}</div><div style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>Step {active + 1} of {steps.length}</div></div>
          </div>
          <div style={{ padding: "var(--space-5)" }}>{body[active]}</div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--space-4) var(--space-5)", borderTop: "1px solid var(--color-border)" }}>
            <Button variant="ghost" onClick={back} disabled={active === 0} iconStart={<Icon name="chevron" size={16} style={{ transform: "rotate(90deg)" }} />}>Back</Button>
            {active === steps.length - 1
              ? <Button variant="primary" iconStart={<Icon name="check" size={16} />} onClick={() => act("Store scheduled to go live")}>Activate store</Button>
              : <Button variant="primary" onClick={next} iconStart={<Icon name="chevron" size={16} style={{ transform: "rotate(-90deg)" }} />}>Continue</Button>}
          </div>
        </div>

        {/* Summary */}
        <div style={{ ...obCard, padding: "var(--space-5)", position: "sticky", top: 0 }}>
          <div style={{ font: "var(--type-title)", marginBottom: "var(--space-3)" }}>Summary</div>
          <div style={{ display: "grid", gap: "var(--space-1)" }}>
            <ObKv k="Store" v="Cairo Festival City" />
            <ObKv k="Code" v="CFC-01" mono />
            <ObKv k="Region" v="Greater Cairo" />
            <ObKv k="Tenant" v={scope.tenant} />
            <ObKv k="Catalog" v="1,284 SKUs" />
            <ObKv k="Operators" v="3 invited" />
          </div>
          <div style={{ height: "1px", background: "var(--color-border)", margin: "var(--space-4) 0" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
            <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>Readiness</span>
            <span style={{ font: "600 var(--text-label)/1 var(--font-mono)", color: "var(--color-text)" }}>4 / 6</span>
          </div>
          <div style={{ height: "8px", borderRadius: "9999px", background: "var(--color-surface-raised)", overflow: "hidden" }}><div style={{ width: "67%", height: "100%", background: "var(--color-success-on)" }} /></div>
        </div>
      </div>
    </div>
  );
}

function ObSelect({ id, options }) {
  return (
    <div style={{ position: "relative" }}>
      <select id={id} style={{ width: "100%", height: "36px", padding: "0 32px 0 12px", background: "var(--color-surface-sunken)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-control)", color: "var(--color-text)", font: "var(--type-body)", outline: "none", appearance: "none", cursor: "pointer" }}>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--color-text-muted)", display: "inline-flex" }}><DSob.Icon name="chevron" size={15} /></span>
    </div>
  );
}

function ObKv({ k, v, mono }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-3)" }}>
      <span style={{ font: "var(--type-caption)", color: "var(--color-text-muted)" }}>{k}</span>
      <span style={{ font: mono ? "var(--type-mono)" : "var(--type-label)", color: "var(--color-text)", textAlign: "right" }}>{v}</span>
    </div>
  );
}

Object.assign(window, { OnboardStore });
