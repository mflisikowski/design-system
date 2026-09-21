import { expect, test } from "./fixtures";

test("renders every local documentation destination and a real 404", async ({ page }) => {
  const destinations = [
    ["/", "Build consistent product interfaces"],
    ["/foundations", "Foundations"],
    ["/components", "Components"],
    ["/components/registry-sample", "Registry Sample"],
    ["/patterns", "Patterns"],
    ["/themes", "Themes"],
    ["/changelog", "Changelog"],
  ] as const;

  for (const [href, heading] of destinations) {
    await page.goto(href);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  }

  const response = await page.goto("/not-in-the-manifest");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
});

test("passes an automated accessibility audit on the component page", async ({
  page,
  makeAxeBuilder,
}) => {
  await page.goto("/components/registry-sample");
  await expect(page.getByRole("heading", { level: 1, name: "Registry Sample" })).toBeVisible();

  const scan = await makeAxeBuilder().analyze();

  expect(scan.violations).toEqual([]);
});

test("keeps copy focus stable and announces completion", async ({ page }) => {
  await page.goto("/components/registry-sample");
  const copy = page.locator('[data-docs="copy-command"]').first();

  await copy.focus();
  await copy.click();

  await expect(copy).toBeFocused();
  await expect(copy).toHaveText("Copied");
});

test("reflows at 320 CSS pixels without page-level horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/components/registry-sample");

  await expect(page.getByText("Browse docs")).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));

  expect(dimensions.documentWidth).toBe(dimensions.viewportWidth);
});

test("supports a 200% browser-zoom-equivalent viewport", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await page.goto("/components/registry-sample");

  await expect(page.getByRole("heading", { level: 1, name: "Registry Sample" })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));

  expect(dimensions.documentWidth).toBe(dimensions.viewportWidth);
});
