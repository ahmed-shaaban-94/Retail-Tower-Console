import { type Page, expect, test } from "@playwright/test";

/**
 * RF-2 store soft-delete E2E (VG-2, Scenario S8). Soft-delete behind the inline
 * confirm that names the store, then re-fetch the list and route back. Mocked
 * DP2 (C-5).
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

async function mockBase(page: Page): Promise<void> {
  await page.route("**/api/v1/**", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );
  await page.route("**/api/v1/context/me", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ctx) }),
  );
}

test("S8: soft-delete a store behind a confirm, then return to the list", async ({ page }) => {
  await mockBase(page);
  await page.route("**/api/v1/stores", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: "s1", code: "CFC", name: "Cairo Festival City", is_active: true },
      ]),
    }),
  );
  await page.route("**/api/v1/stores/s1", (r) => {
    if (r.request().method() === "DELETE") {
      return r.fulfill({ status: 204, body: "" });
    }
    return r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: "s1", code: "CFC", name: "Cairo Festival City", is_active: true }),
    });
  });

  await page.goto("/stores/s1");
  await expect(page.getByRole("heading", { name: "Cairo Festival City" })).toBeVisible();
  await page.getByRole("button", { name: /soft-delete/i }).click();

  // inline confirm names the store
  const confirm = page.getByRole("region", { name: /confirm: soft-delete/i });
  await expect(confirm).toContainText("Cairo Festival City");
  await confirm.getByRole("button", { name: /soft-delete/i }).click();

  // routed back to the store list
  await expect(page.getByRole("heading", { name: "Stores" })).toBeVisible();
});
