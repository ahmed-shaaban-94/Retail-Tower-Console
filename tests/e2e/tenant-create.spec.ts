import { type Page, expect, test } from "@playwright/test";

/**
 * RF-2 tenant onboard E2E (VG-2, Scenario S2). Create flow + the 409 slug
 * conflict rendered inline (OQ-9). Mocked DP2 (C-5).
 */

const resolvedContext = {
  user: {
    id: "u1",
    email: "amal@northstar.eg",
    display_name: "Amal Saleh",
    is_platform_admin: true,
  },
  active_tenant: { id: "t1", name: "Northstar Retail" },
  active_store: null,
  active_role_code: "platform_admin",
  memberships: [{ tenant_id: "t1", tenant_name: "Northstar Retail", role_code: "platform_admin" }],
};

async function mockBase(page: Page): Promise<void> {
  await page.route("**/api/v1/**", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );
  await page.route("**/api/v1/context/me", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(resolvedContext),
    }),
  );
}

test("S2: create a tenant routes to its detail on success", async ({ page }) => {
  await mockBase(page);
  await page.route("**/api/v1/tenants", (r) => {
    if (r.request().method() === "POST") {
      return r.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "t9", slug: "acme", name: "Acme Corp", status: "active" }),
      });
    }
    return r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
  await page.route("**/api/v1/tenants/t9", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: "t9", slug: "acme", name: "Acme Corp", status: "active" }),
    }),
  );

  await page.goto("/tenants/new");
  await page.getByLabel(/slug/i).fill("acme");
  await page.getByLabel(/name/i).fill("Acme Corp");
  await page.getByRole("button", { name: /create tenant/i }).click();

  await expect(page.getByRole("heading", { name: "Acme Corp" })).toBeVisible();
});

test("S2: duplicate slug renders an inline conflict on the slug field, no route change", async ({
  page,
}) => {
  await mockBase(page);
  await page.route("**/api/v1/tenants", (r) => {
    if (r.request().method() === "POST") {
      return r.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "conflict", request_id: "req-409" } }),
      });
    }
    return r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  await page.goto("/tenants/new");
  await page.getByLabel(/slug/i).fill("taken");
  await page.getByLabel(/name/i).fill("Dup Co");
  await page.getByRole("button", { name: /create tenant/i }).click();

  await expect(page.getByText(/slug is already in use/i)).toBeVisible();
  await expect(page.getByLabel(/slug/i)).toHaveAttribute("aria-invalid", "true");
  await expect(page).toHaveURL(/\/tenants\/new$/);
});
