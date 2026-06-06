/**
 * RF-1 application root. Composes the providers and the public/protected route
 * boundary (R3-1): `/signin` is public (SF-1); everything else is protected and
 * renders the gate-or-shell from the server-resolved context (SF-2/SF-3).
 *
 * The route guard reacts to backend truth only (FR-003-004): a 401 anywhere is
 * caught by the auth interceptor, which clears the cache and redirects to
 * /signin (S5). The console carries no authorization opinion about routes.
 */
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ActiveContextProvider } from "@/context/ActiveContextProvider";
import { createQueryClient } from "@/lib/query";
import { ProtectedArea } from "@/shell/ProtectedArea";
import { SignInRoute } from "@/shell/SignInRoute";
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
            <Route path="/" element={<ProtectedArea />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ActiveContextProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
