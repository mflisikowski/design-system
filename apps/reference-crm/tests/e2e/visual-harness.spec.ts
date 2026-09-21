import { expect, type Page, test } from "@playwright/test";

test.beforeEach(({ browserName }) => {
  test.skip(browserName !== "chromium", "Visual regression baselines use Chromium only.");
  test.skip(process.platform !== "linux", "Visual regression runs in pinned Linux Chromium.");
});

async function waitForStableFonts(page: Page) {
  await page.evaluate(() => document.fonts.ready);
}

test("compares an exact deterministic Chromium screenshot", async ({ page }) => {
  await page.setViewportSize({ width: 64, height: 64 });
  await page.setContent(`
    <style>
      html, body { margin: 0; }
      [data-visual-harness] {
        background: repeating-conic-gradient(CanvasText 0 25%, Canvas 0 50%) 0 / 32px 32px;
        height: 64px;
        width: 64px;
      }
    </style>
    <div data-visual-harness></div>
  `);

  await expect(page.locator("[data-visual-harness]")).toHaveScreenshot("visual-harness.png");
});

test("captures representative component states in the pull-request theme matrix", async ({
  page,
}) => {
  await page.goto("/theme-fixture");
  await waitForStableFonts(page);

  await expect(page.locator('[data-theme-context="atlas-light-comfortable"]')).toHaveScreenshot(
    "theme-atlas-light-comfortable.png",
  );
  await expect(page.locator('[data-theme-context="bloom-dark-compact"]')).toHaveScreenshot(
    "theme-bloom-dark-compact.png",
  );
});

test("captures the Clients key screen in the pull-request theme matrix", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("cell", { exact: true, name: "Northstar Studio" })).toBeVisible();
  await waitForStableFonts(page);

  await expect(page).toHaveScreenshot("clients-atlas-light-comfortable.png", {
    fullPage: true,
  });

  await page.locator("html").evaluate((element) => {
    element.dataset.brand = "bloom";
    element.dataset.colorScheme = "dark";
    element.dataset.density = "compact";
  });

  await expect(page).toHaveScreenshot("clients-bloom-dark-compact.png", {
    fullPage: true,
  });
});
