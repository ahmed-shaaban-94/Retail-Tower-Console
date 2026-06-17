import { Route } from "react-router";
import { ReceivableList } from "@/receivables/ReceivableList";
/**
 * 018 receivables route registration. Mounts inside the protected layout
 * (`/` → ProtectedArea → AppShell → <Outlet/>), behind RF-1's context gate.
 * Pure additive route registration. Mirrors 017's payerRoutes.
 */
export const receivableRoutes = <Route path="receivables" element={<ReceivableList />} />;
