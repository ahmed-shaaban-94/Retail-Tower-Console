import { AuditSearch } from "@/audit/AuditSearch";
/**
 * RF-6 nested route registration (T009). Mounts inside the protected layout
 * route (`/` → ProtectedArea → AppShell → <Outlet/>), behind RF-1's context
 * gate (FR-006-005). The `<Outlet/>` already exists from slice 004, so this is
 * pure additive route registration. One reviewable seam per slice.
 */
import { Route } from "react-router";

export const rf6Routes = <Route path="audit" element={<AuditSearch />} />;
