import { type Page, expect, test } from "@playwright/test";

/**
 * 017 payer-accounts E2E (VG-2). Active tenant → payer table; create drawer →
 * 201 → close + list refetch shows the new payer. No active tenant → scope
 * prompt (list wrapper never reached). Mocked DP2 (C-5).
 */
const user = {
  id: "u1",
  email: "amal@northstar.eg",
  display_name: "Amal Saleh",
  is_platform_admin: true,
};

async function mockBase(page: Page, ctx: unknown): Promise<void> {
  await page.route("**/api/v1/**", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );
  await page.route("**/api/v1/context/me", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ctx) }),
  );
}

const withTenant = {
  user,
  active_tenant: { id: "t1", name: "Northstar Retail" },
  active_store: null,
  active_role_code: "tenant_admin",
  memberships: [{ tenant_id: "t1", tenant_name: "Northstar Retail", role_code: "tenant_admin" }],
};

function payer(over: Record<string, unknown> = {}) {
  return {
    payerRef: "p1",
    category: "insurer",
    displayName: "MedCover Insurance",
    externalRef: "INS-99",
    status: "active",
    storeId: null,
    version: 0,
    ...over,
  };
}

test("S1: active tenant → payer table renders", async ({ page }) => {
  await mockBase(page, withTenant);
  await page.route("**/api/v1/settlement/payer-accounts**", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ items: [payer()], nextCursor: null }),
    }),
  );

  await page.goto("/payer-accounts");
  await expect(page.getByRole("heading", { name: "Payer accounts" })).toBeVisible();
  await expect(page.getByRole("cell", { name: /MedCover Insurance/ })).toBeVisible();
});

test("S2: create drawer → 201 → drawer closes and the new payer appears", async ({ page }) => {
  await mockBase(page, withTenant);
  let created = false;
  await page.route("**/api/v1/settlement/payer-accounts**", (r) => {
    if (r.request().method() === "POST") {
      created = true;
      return r.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(payer({ payerRef: "p2", displayName: "Acme Corp", category: "corporate" })),
      });
    }
    return r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: created ? [payer({ payerRef: "p2", displayName: "Acme Corp", category: "corporate" })] : [],
        nextCursor: null,
      }),
    });
  });

  await page.goto("/payer-accounts");
  // Empty-state Create primary opens the drawer (the page's own button, before
  // the drawer mounts a second "Create payer" submit).
  await page.getByRole("button", { name: /create payer/i }).click();
  const drawer = page.getByRole("dialog");
  await expect(page.getByRole("heading", { name: /create payer account/i })).toBeVisible();
  await page.getByLabel(/display name/i).fill("Acme Corp");
  await page.getByLabel(/category/i).selectOption("corporate");
  // Submit from WITHIN the drawer (disambiguate from the list's Create button).
  await drawer.getByRole("button", { name: /create payer/i }).click();

  // Drawer closes (heading gone) and the refetched list shows the new payer.
  await expect(page.getByRole("heading", { name: /create payer account/i })).toBeHidden();
  await expect(page.getByRole("cell", { name: /Acme Corp/ })).toBeVisible();
});

test("S3: no active tenant → RF-1 scope gate; list wrapper never called", async ({ page }) => {
  // ProtectedArea intercepts no-active-tenant app-wide → the RF-1 scope gate
  // renders BEFORE the /payer-accounts route mounts, so the payer list wrapper
  // is never reached. (PayerList's own scope prompt is component-level
  // defense-in-depth, not the app path here.)
  let listed = false;
  // Has a membership but no ACTIVE tenant selected → ScopeGate (membershipCount>0;
  // membershipCount===0 would route to NoAccess instead).
  await mockBase(page, {
    user,
    active_tenant: null,
    active_store: null,
    active_role_code: null,
    memberships: [{ tenant_id: "t1", tenant_name: "Northstar Retail", role_code: "tenant_admin" }],
  });
  await page.route("**/api/v1/settlement/payer-accounts**", (r) => {
    listed = true;
    return r.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  await page.goto("/payer-accounts");
  await expect(page.getByRole("heading", { name: /select your context/i })).toBeVisible();
  expect(listed).toBe(false);
});
