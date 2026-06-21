/* Retail Tower Console — UI kit: sign-in (RF-1).
 * Centered card on the command-room ground; gold lockup; navy primary action. */

const DSs = window.RetailTowerConsoleDesignSystem_b7c448;

function SignIn({ onSignIn }) {
  const { Button, Icon, Input, Field, Banner } = DSs;
  const [email, setEmail] = React.useState("amal@northstar");
  const [pw, setPw] = React.useState("••••••••••");
  const [err, setErr] = React.useState(false);

  function submit(e) {
    e.preventDefault();
    if (!email || !pw) { setErr(true); return; }
    onSignIn();
  }

  return (
    <div style={{ height: "100%", display: "grid", placeItems: "center", background: "var(--color-bg)", padding: "var(--space-6)" }}>
      <form onSubmit={submit} style={{ width: "380px", maxWidth: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", justifyContent: "center", marginBottom: "var(--space-6)" }}>
          <span style={{ color: "var(--color-gold-marker)" }}><Icon name="tower" size={32} /></span>
          <span style={{ font: "700 var(--text-headline)/1 var(--font-sans)", letterSpacing: "-0.01em" }}>Retail Tower OS</span>
        </div>
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-dialog)", boxShadow: "var(--shadow-pane)", padding: "var(--space-6)" }}>
          <h1 style={{ font: "var(--type-headline)", letterSpacing: "var(--tracking-headline)", margin: "0 0 var(--space-1)" }}>Sign in</h1>
          <p style={{ font: "var(--type-body)", color: "var(--color-text-muted)", margin: "0 0 var(--space-5)" }}>Operator access to the command console.</p>
          {err ? (
            <div style={{ marginBottom: "var(--space-4)" }}>
              <Banner tone="danger" icon={<Icon name="alert" size={16} />}>Enter your email and password to continue.</Banner>
            </div>
          ) : null}
          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            <Field label="Work email" htmlFor="email">
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@tenant" />
            </Field>
            <Field label="Password" htmlFor="pw">
              <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
            </Field>
            <Button variant="primary" type="submit" style={{ width: "100%", marginTop: "var(--space-2)" }}>Sign in</Button>
          </div>
        </div>
        <p style={{ textAlign: "center", font: "var(--type-caption)", color: "var(--color-text-muted)", marginTop: "var(--space-5)" }}>
          Protected platform · all activity is audited
        </p>
      </form>
    </div>
  );
}

Object.assign(window, { SignIn });
