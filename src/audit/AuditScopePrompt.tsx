/**
 * Audit scope prompt — shown when no active tenant (the RF-1 scope gate normally
 * precedes this; defensive). A precondition, not an error. Named *Like to avoid
 * implying it is the RF-5 OperatorScopePrompt.
 */
import "../shell/surface.css";

export function OperatorScopePromptLike(): React.JSX.Element {
  return (
    <div className="surface">
      <header className="surface__head">
        <div>
          <h1 className="content__title">Audit</h1>
        </div>
      </header>
      <p className="scope-prompt">
        Select a tenant to search its audit activity. Use the tenant selector in the scope bar above
        to choose where you are working.
      </p>
    </div>
  );
}
