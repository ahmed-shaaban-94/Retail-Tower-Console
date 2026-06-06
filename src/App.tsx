import { ActiveContextProvider } from "@/context/ActiveContextProvider";
import { createQueryClient } from "@/lib/query";
import { Overview } from "@/shell/Overview";
import { ProtectedArea } from "@/shell/ProtectedArea";
import { SignInRoute } from "@/shell/SignInRoute";
import { rf2Routes } from "@/shell/rf2Routes";
/**
 * RF-1 application root, extended by RF-2 (T009). Composes the providers and the
 * public/protected boundary (R3-1): `/signin` is public (SF-1); everything else
 * is a PROTECTED LAYOUT route whose element (ProtectedArea) renders the
 * gate-or-shell from the server-resolved context, with the routed surface
 * mounting in the shell's <Outlet/>.
 *
 * The route guard reacts to backend truth only (FR-003-004): a 401 on the
 * CONTEXT fetch is caught by RF-1's per-call interceptor and redirects to
 * /signin (S5). RF-2's own operation 401s do NOT route through sign-out — store
 * surfaces pre-gate on the active tenant (OQ-4). The console carries no
 * authorization opinion about routes; RF-2 routes sit inside the same gate.
 */
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "@/styles/tokens.css";
import "@/styles/controls.css";

const queryClient = createQueryClient();

export function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ActiveContextProvider>
          <Routes>
            <Route path="/signin" element={<SignInRoute />} />
            <Route path="/" element={<ProtectedArea />}>
              <Route index element={<Overview />} />
              {rf2Routes}
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ActiveContextProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
