import { StoreDetail } from "@/stores/StoreDetail";
import { StoreFormRoute } from "@/stores/StoreFormRoute";
import { StoreList } from "@/stores/StoreList";
import { TenantDetail } from "@/tenants/TenantDetail";
import { TenantFormRoute } from "@/tenants/TenantFormRoute";
import { TenantList } from "@/tenants/TenantList";
/**
 * RF-2 nested route registration (T009). These routes mount inside the
 * protected layout route (`/` → ProtectedArea → AppShell → <Outlet/>), so they
 * sit behind RF-1's context gate with no new public route. Added incrementally
 * as each surface lands under TDD:
 *   - tenant surfaces (SF-T1/T2/T3) — Phase 3  ✓
 *   - store surfaces (SF-S1/S2/S3) — Phase 4  ✓
 *
 * Kept as a single fragment so route registration is one reviewable seam, not
 * scattered edits across App.tsx per surface.
 */
import { Route } from "react-router";

export const rf2Routes = (
  <>
    <Route path="tenants" element={<TenantList />} />
    <Route path="tenants/new" element={<TenantFormRoute mode="create" />} />
    <Route path="tenants/:tenantId" element={<TenantDetail />} />
    <Route path="tenants/:tenantId/edit" element={<TenantFormRoute mode="edit" />} />
    <Route path="stores" element={<StoreList />} />
    <Route path="stores/new" element={<StoreFormRoute mode="create" />} />
    <Route path="stores/:storeId" element={<StoreDetail />} />
    <Route path="stores/:storeId/edit" element={<StoreFormRoute mode="edit" />} />
  </>
);
