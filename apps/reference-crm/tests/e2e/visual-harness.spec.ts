import { expect, type Page, test } from "@playwright/test";

type ScreenshotTheme = {
  brand: "atlas" | "bloom";
  colorScheme: "light" | "dark";
  density: "comfortable" | "compact";
};

test.beforeEach(({ browserName }) => {
  test.skip(browserName !== "chromium", "Visual regression baselines use Chromium only.");
  test.skip(process.platform !== "linux", "Visual regression runs in pinned Linux Chromium.");
});

async function waitForStableFonts(page: Page) {
  await page.evaluate(() => document.fonts.ready);
}

async function applyScreenshotTheme(page: Page, theme: ScreenshotTheme) {
  await page.locator("html").evaluate((root, nextTheme) => {
    root.dataset.brand = nextTheme.brand;
    root.dataset.colorScheme = nextTheme.colorScheme;
    root.dataset.density = nextTheme.density;
  }, theme);
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

test("captures the key screen in both pull-request themes", async ({ page }) => {
  await page.goto("/");
  await waitForStableFonts(page);

  await applyScreenshotTheme(page, {
    brand: "atlas",
    colorScheme: "light",
    density: "comfortable",
  });
  await expect(page).toHaveScreenshot("home-atlas-light-comfortable.png");

  await applyScreenshotTheme(page, {
    brand: "bloom",
    colorScheme: "dark",
    density: "compact",
  });
  await expect(page).toHaveScreenshot("home-bloom-dark-compact.png");
});
