/**
 * RF-2 nested route registration (T009). These routes mount inside the
 * protected layout route (`/` → ProtectedArea → AppShell → <Outlet/>), so they
 * sit behind RF-1's context gate with no new public route. They are added
 * incrementally as each surface is built under TDD:
 *   - tenant surfaces (SF-T1/T2/T3) — Phase 3
 *   - store surfaces (SF-S1/S2/S3) — Phase 4
 *
 * Kept as a single fragment so the route registration is one reviewable seam,
 * not scattered edits across App.tsx per surface.
 */
import { Fragment } from "react";

// Surface routes are appended here per phase. Until the first surface lands the
// fragment is empty, but the layout/Outlet/nav wiring (T009/T010) is live so the
// shell renders the Overview index and the Tenants/Stores nav links resolve once
// their routes are registered below.
export const rf2Routes = <Fragment />;
