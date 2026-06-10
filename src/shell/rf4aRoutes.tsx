import { UnknownItemList } from "@/unknown-items/UnknownItemList";
/**
 * RF-4a nested route registration (T009). Mounts inside the protected layout
 * route (`/` → ProtectedArea → AppShell → <Outlet/>), so it sits behind RF-1's
 * context gate with no new public route — mirroring rf2Routes / rf6Routes.
 *
 * The review queue is a single route; inspect + dismiss are in-surface
 * (drawer + confirm), not separate routes, so the queue stays the one reviewable
 * seam for this slice. RF-4b (link / create-product) is a later slice and adds
 * no route here.
 */
import { Route } from "react-router";

export const rf4aRoutes = <Route path="unknown-items" element={<UnknownItemList />} />;
