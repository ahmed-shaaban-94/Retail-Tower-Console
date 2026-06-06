/**
 * Overview landing (the shell index route). Extracted from AppShell's inline
 * default so it can be the `/` index element alongside the RF-2 nested routes
 * (T009). Reads scope from RF-1's provider; renders no authorization opinion.
 */
import { useActiveContextValue } from "@/context/ActiveContextProvider";

export function Overview(): React.JSX.Element {
  const { context } = useActiveContextValue();
  return (
    <>
      <h1 className="content__title">Overview</h1>
      <p className="content__sub">
        {context?.active_tenant?.name}
        {context?.active_store ? ` · ${context.active_store.name}` : ""}
      </p>
    </>
  );
}
