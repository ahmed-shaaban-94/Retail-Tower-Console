import { type Page, expect, test } from "@playwright/test";

/**
 * RF-5 member list E2E (VG-2, S1/S3). Active tenant → graph table; no active
 * tenant → RF-1 scope gate (listMembers never reached). Mocked DP2 (C-5).
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

test("S1: member graph renders identity / role / store-access / state", async ({ page }) => {
  await mockBase(page, {
    user,
    active_tenant: { id: "t1", name: "Northstar Retail" },
    active_store: null,
    active_role_code: "tenant_admin",
    memberships: [{ tenant_id: "t1", tenant_name: "Northstar Retail", role_code: "tenant_admin" }],
  });
  await page.route("**/api/v1/tenants/t1/members", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          membership_id: "m1",
          user: { id: "u1", email: "amal@northstar.eg", display_name: "Amal Saleh" },
          role_code: "tenant_admin",
          store_access_kind: "all",
          accessible_store_ids: [],
          revoked_at: null,
        },
        {
          membership_id: "m2",
          user: { id: "u2", email: "omar@northstar.eg", display_name: "Omar Khaled" },
          role_code: "store_manager",
          store_access_kind: "specific",
          accessible_store_ids: ["s1", "s2"],
          revoked_at: "2026-06-01T00:00:00Z",
        },
      ]),
    }),
  );

  await page.goto("/operators");
  await expect(page.getByRole("heading", { name: "Operators" })).toBeVisible();
  await expect(page.getByRole("cell", { name: /Amal Saleh/ })).toBeVisible();
  // "tenant_admin" also appears in the topbar role; scope to the role-column badge.
  await expect(page.getByRole("cell", { name: "store_manager" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "All stores" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "2 stores" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Revoked" })).toBeVisible();
});

test("S3: no active tenant → RF-1 scope gate; listMembers never called", async ({ page }) => {
  let called = false;
  await mockBase(page, {
    user,
    active_tenant: null,
    active_store: null,
    memberships: [
      { tenant_id: "t1", tenant_name: "Northstar Retail", role_code: "platform_admin" },
      { tenant_id: "t2", tenant_name: "Helios Markets", role_code: "platform_admin" },
    ],
  });
  await page.route("**/api/v1/tenants/*/members", (r) => {
    called = true;
    return r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  await page.goto("/operators");
  await expect(page.getByRole("heading", { name: /select your context/i })).toBeVisible();
  expect(called).toBe(false);
});

test("T031 a11y: a member row is keyboard-focusable and Enter opens the edit drawer", async ({
  page,
}) => {
  await mockBase(page, {
    user,
    active_tenant: { id: "t1", name: "Northstar Retail" },
    active_store: null,
    active_role_code: "tenant_admin",
    memberships: [{ tenant_id: "t1", tenant_name: "Northstar Retail", role_code: "tenant_admin" }],
  });
  await page.route("**/api/v1/tenants/t1/members", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          membership_id: "m2",
          user: { id: "u2", email: "omar@northstar.eg", display_name: "Omar Khaled" },
          role_code: "store_manager",
          store_access_kind: "all",
          accessible_store_ids: [],
          revoked_at: null,
        },
      ]),
    }),
  );

  await page.goto("/operators");
  const row = page.getByRole("row").filter({ hasText: "Omar Khaled" });
  await row.focus();
  await expect(row).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: /edit member/i })).toBeVisible();
});
