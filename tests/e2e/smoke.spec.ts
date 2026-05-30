import { expect, test } from "@playwright/test";

/**
 * E2E toolchain smoke test (A-12). Proves the BUILT SPA serves and boots
 * in a real browser (D-4 / C-1) — not that any Data-Pulse-2 flow works
 * (C-5: no live backend). The Playwright webServer builds + previews the
 * production bundle (see playwright.config.ts).
 */
test("built SPA boots and renders the shell", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /retail tower console/i })).toBeVisible();
});
