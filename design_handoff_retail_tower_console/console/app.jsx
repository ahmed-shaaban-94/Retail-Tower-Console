/* Retail Tower Console — orchestrator (deliverable build).
 * Routes between sign-in and the authenticated shell; owns theme + scope + route state,
 * the ⌘K command palette, and tweak-driven document attributes.
 * Mounts to #app so the design-system bundle's own #root auto-mount harmlessly no-ops. */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "density": "comfortable",
  "motion": true,
  "accent": "#2e7da3",
  "lang": "en"
}/*EDITMODE-END*/;

const ROUTES = [
  { id: "command", icon: "tower", label: "Command Desk" },
  { id: "incident", icon: "alert", label: "Incident War-Room" },
  { id: "overview", icon: "overview", label: "Overview" },
  { id: "sales", icon: "gauge", label: "Sales Monitor" },
  { id: "reconciliation", icon: "link", label: "Reconciliation" },
  { id: "moneyclose", icon: "clock", label: "Money Close" },
  { id: "outbox", icon: "link", label: "Outbox & Sync" },
  { id: "catalog", icon: "catalog", label: "Catalog & Inventory" },
  { id: "transfers", icon: "link", label: "Inventory Transfers" },
  { id: "pricing", icon: "catalog", label: "Price Changes" },
  { id: "returns", icon: "unknown", label: "Returns & Refunds" },
  { id: "unknown", icon: "unknown", label: "Unknown Items Review" },
  { id: "stores", icon: "stores", label: "Stores & Tenants" },
  { id: "onboarding", icon: "plus", label: "Onboard Store" },
  { id: "operators", icon: "operators", label: "Users & Roles" },
  { id: "permissions", icon: "operators", label: "Permissions" },
  { id: "audit", icon: "audit", label: "Audit Logs" },
  { id: "observability", icon: "activity", label: "Observability" },
  { id: "oncall", icon: "bell", label: "Alert & On-Call" },
  { id: "settings", icon: "settings", label: "Settings & Integrations" },
  { id: "billing", icon: "audit", label: "Billing & Usage" },
  { id: "aistudio", icon: "signal", label: "AI Studio" },
  { id: "edgestates", icon: "info", label: "Edge States" },
];

function ConsoleApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [authed, setAuthed] = React.useState(true);
  const [route, setRoute] = React.useState(() => {
    try { return localStorage.getItem("rtc-route") || "command"; } catch (e) { return "command"; }
  });
  const [theme, setTheme] = React.useState(() => {
    try { return localStorage.getItem("rtc-theme") || t.theme || "dark"; } catch (e) { return "dark"; }
  });
  const [scope, setScope] = React.useState({ tenant: "Northstar Retail", store: "All stores" });
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const [cheatOpen, setCheatOpen] = React.useState(false);
  const gRef = React.useRef(false);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("rtc-theme", theme); } catch (e) {}
  }, [theme]);
  React.useEffect(() => { if (t.theme !== theme) setTheme(t.theme); }, [t.theme]);
  React.useEffect(() => { try { localStorage.setItem("rtc-route", route); } catch (e) {} }, [route]);
  React.useEffect(() => { document.documentElement.setAttribute("data-density", t.density); }, [t.density]);
  React.useEffect(() => { document.documentElement.setAttribute("data-motion", t.motion ? "on" : "off"); }, [t.motion]);
  React.useEffect(() => {
    if (t.accent && t.accent !== "#2e7da3") document.documentElement.style.setProperty("--color-accent", t.accent);
    else document.documentElement.style.removeProperty("--color-accent");
  }, [t.accent]);
  React.useEffect(() => {
    document.documentElement.lang = t.lang || "en";
    document.documentElement.dir = t.lang === "ar" ? "rtl" : "ltr";
  }, [t.lang]);

  // Global keyboard shortcuts.
  React.useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target && e.target.isContentEditable)) return;
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); setCmdOpen((o) => !o); return; }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "?") { e.preventDefault(); setCheatOpen((o) => !o); return; }
      if (e.key === "Escape") { setCheatOpen(false); return; }
      if (gRef.current) {
        gRef.current = false;
        const order = ["command", "overview", "sales", "reconciliation", "catalog", "unknown", "stores", "operators", "audit", "observability"];
        const idx = e.key === "0" ? 9 : (parseInt(e.key, 10) - 1);
        if (idx >= 0 && idx < order.length) setRoute(order[idx]);
        return;
      }
      if (e.key === "g" || e.key === "G") { gRef.current = true; setTimeout(() => { gRef.current = false; }, 1200); return; }
      if (e.key === "t" || e.key === "T") { toggleTheme(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [theme]);

  const scopes = {
    tenants: ["Northstar Retail", "Helios Markets", "Qanater Commerce"],
    stores: ["All stores", "Cairo Festival City", "Mall of Egypt", "City Stars Heliopolis", "Maadi Grand"],
  };
  const user = { name: "Amal Saleh", role: "Tenant Admin", initials: "AS" };

  function setThemeBoth(v) { setTheme(v); setTweak("theme", v); }
  function toggleTheme() { setThemeBoth(theme === "dark" ? "light" : "dark"); }

  const cmdItems = [
    ...ROUTES.map((r) => ({ id: "go-" + r.id, group: "Navigate", icon: r.icon, label: r.label, hint: r.id === route ? "current" : "", run: () => setRoute(r.id) })),
    { id: "act-theme", group: "Actions", icon: theme === "dark" ? "sun" : "moon", label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme", run: toggleTheme },
    { id: "act-density", group: "Actions", icon: "overview", label: t.density === "compact" ? "Use comfortable density" : "Use compact density", run: () => setTweak("density", t.density === "compact" ? "comfortable" : "compact") },
    { id: "act-motion", group: "Actions", icon: "activity", label: t.motion ? "Disable screen motion" : "Enable screen motion", run: () => setTweak("motion", !t.motion) },
    { id: "act-lang", group: "Actions", icon: "audit", label: t.lang === "ar" ? "Switch to English (LTR)" : "التبديل إلى العربية (RTL)", run: () => setTweak("lang", t.lang === "ar" ? "en" : "ar") },
    { id: "act-report", group: "Actions", icon: "audit", label: "Create report", run: () => setRoute("overview") },
    { id: "act-store", group: "Actions", icon: "stores", label: "Add store", run: () => setRoute("stores") },
    { id: "act-signout", group: "Actions", icon: "sign-out", label: "Sign out", run: () => setAuthed(false) },
    ...scopes.tenants.map((tn) => ({ id: "scope-" + tn, group: "Switch tenant", icon: "stores", label: tn, hint: tn === scope.tenant ? "active" : "", run: () => setScope({ tenant: tn, store: "All stores" }) })),
  ];

  const panel = (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Appearance" />
      <TweakRadio label="Theme" value={theme} options={["dark", "light"]} onChange={setThemeBoth} />
      <TweakRadio label="Table density" value={t.density} options={["comfortable", "compact"]} onChange={(v) => setTweak("density", v)} />
      <TweakToggle label="Screen motion" value={t.motion} onChange={(v) => setTweak("motion", v)} />
      <TweakRadio label="Language" value={t.lang === "ar" ? "العربية" : "English"} options={["English", "العربية"]} onChange={(v) => setTweak("lang", v === "العربية" ? "ar" : "en")} />
      <TweakSection label="Data viz" />
      <TweakColor label="Chart accent" value={t.accent} options={["#2e7da3", "#2563a8", "#1e6f8c", "#3a8f6c"]} onChange={(v) => setTweak("accent", v)} />
    </TweaksPanel>
  );

  const cmd = <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} items={cmdItems} />;
  const extras = <>{<ToastHost />}<Cheatsheet open={cheatOpen} onClose={() => setCheatOpen(false)} /></>;

  if (!authed) return <>{<SignIn onSignIn={() => setAuthed(true)} />}{cmd}{panel}{extras}</>;

  const screens = {
    command: <CommandDesk scope={scope} />,
    incident: <IncidentWarRoom scope={scope} />,
    overview: <Overview scope={scope} />,
    sales: <SalesMonitor scope={scope} />,
    reconciliation: <Reconciliation scope={scope} />,
    moneyclose: <MoneyClose scope={scope} />,
    outbox: <OutboxMonitor scope={scope} />,
    catalog: <Catalog scope={scope} />,
    transfers: <InventoryTransfers scope={scope} />,
    pricing: <PriceChanges scope={scope} />,
    returns: <ReturnsRefunds scope={scope} />,
    unknown: <UnknownItems scope={scope} />,
    stores: <Stores scope={scope} />,
    onboarding: <OnboardStore scope={scope} />,
    operators: <Operators scope={scope} />,
    permissions: <PermissionsMatrix scope={scope} />,
    audit: <Audit scope={scope} />,
    observability: <Observability scope={scope} />,
    oncall: <AlertOnCall scope={scope} />,
    settings: <Settings scope={scope} />,
    billing: <TenantBilling scope={scope} />,
    aistudio: <AiStudio scope={scope} />,
    edgestates: <EdgeStates scope={scope} />,
  };

  return (
    <>
      <AppShell
        user={user}
        theme={theme}
        onToggleTheme={toggleTheme}
        scope={scope}
        scopes={scopes}
        onPickScope={setScope}
        route={route}
        onNavigate={setRoute}
        onCommand={() => setCmdOpen(true)}
        lang={t.lang}
      >
        {screens[route] || screens.command}
      </AppShell>
      {cmd}
      {panel}
      {extras}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<ConsoleApp />);
