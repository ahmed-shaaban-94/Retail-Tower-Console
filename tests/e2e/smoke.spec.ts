import { expect, test } from "@playwright/test";

/**
 * E2E toolchain smoke test (A-12). Proves the BUILT SPA serves and boots
 * in a real browser (D-4 / C-1). The RF-1 root lands on /signin when no
 * session context resolves (C-5: no live backend).
 */
test("built SPA boots and renders the sign-in surface", async ({ page }) => {
  // No backend: context call fails, protected area stays empty; /signin is public.
  await page.goto("/signin");
  await expect(page.getByText("Retail Tower OS")).toBeVisible();
  await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
});
