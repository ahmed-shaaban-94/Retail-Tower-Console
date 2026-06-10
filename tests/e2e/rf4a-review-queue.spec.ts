import { type Page, expect, test } from "@playwright/test";

/**
 * RF-4a unknown-items review-queue E2E (VG-2). Scoped queue → rows; inspect
 * drawer renders the ReviewQueueItem detail read-only; dismiss behind a confirm
 * resolves the item; 403 forbidden → not-permitted banner with request_id.
 * Mocked DP2 (no live backend).
 */

const ctx = {
  user: {
    id: "u1",
    email: "amal@northstar.eg",
    display_name: "Amal Saleh",
    is_platform_admin: true,
  },
  active_tenant: { id: "t1", name: "Northstar Retail" },
  active_store: null,
  active_role_code: "tenant_admin",
  memberships: [{ tenant_id: "t1", tenant_name: "Northstar Retail", role_code: "tenant_admin" }],
};

const item = {
  id: "u1",
  tenant_id: "t1",
  store_id: "s1",
  identifier_type: "barcode",
  identifier_value: "5012345678900",
  source_system: null,
  resolution_status: "pending",
  resolution_action: null,
  resolved_at: null,
  resolved_by: null,
  encountered_at: "2026-06-10T10:00:00Z",
};

async function mockContext(page: Page): Promise<void> {
  await page.route("**/api/v1/**", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );
  await page.route("**/api/v1/context/me", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ctx) }),
  );
}

test("S1: scoped queue renders the pending rows", async ({ page }) => {
  await mockContext(page);
  await page.route("**/api/v1/catalog/unknown-items?*", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ items: [item], next_cursor: null }),
    }),
  );

  await page.goto("/unknown-items");
  await expect(page.getByText("5012345678900")).toBeVisible();
  await expect(page.getByText("barcode")).toBeVisible();
});

test("S2: inspect drawer renders the ReviewQueueItem detail read-only", async ({ page }) => {
  await mockContext(page);
  await page.route("**/api/v1/catalog/unknown-items?*", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ items: [item], next_cursor: null }),
    }),
  );
  await page.route("**/api/v1/catalog/unknown-items/u1", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(item) }),
  );

  await page.goto("/unknown-items");
  await page.getByText("5012345678900").click();
  const drawer = page.getByRole("dialog", { name: /unknown item/i });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("5012345678900")).toBeVisible();
  // a pending item offers Dismiss; no link / create-product affordance (RF-4b out)
  await expect(drawer.getByRole("button", { name: /dismiss/i })).toBeVisible();
  await expect(drawer.getByRole("button", { name: /link|create product|reopen/i })).toHaveCount(0);
});

test("S3: dismiss behind a confirm resolves the item", async ({ page }) => {
  await mockContext(page);
  await page.route("**/api/v1/catalog/unknown-items?*", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ items: [item], next_cursor: null }),
    }),
  );
  await page.route("**/api/v1/catalog/unknown-items/u1", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(item) }),
  );
  await page.route("**/api/v1/catalog/unknown-items/u1/dismiss", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...item,
        resolution_status: "dismissed",
        resolution_action: "dismissed",
      }),
    }),
  );

  await page.goto("/unknown-items");
  await page.getByText("5012345678900").click();
  const drawer = page.getByRole("dialog", { name: /unknown item/i });
  await drawer.getByRole("button", { name: /^dismiss$/i }).click();
  // confirm step appears (its copy is unique to the confirm affordance), then confirm
  await expect(drawer.getByText(/can be restored by an administrator/i)).toBeVisible();
  await drawer.getByRole("button", { name: /^dismiss$/i }).click();
  // drawer closes on success
  await expect(drawer).toHaveCount(0);
});

test("S4: 403 forbidden → not-permitted banner with request_id", async ({ page }) => {
  await mockContext(page);
  await page.route("**/api/v1/catalog/unknown-items?*", (r) =>
    r.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({ error: { code: "forbidden", request_id: "req-403" } }),
    }),
  );

  await page.goto("/unknown-items");
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByText(/permission/i)).toBeVisible();
  await expect(page.getByText(/req-403/)).toBeVisible();
});
