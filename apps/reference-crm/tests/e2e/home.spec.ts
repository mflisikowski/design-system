import { expect, test } from "./fixtures";

test("loads the Reference CRM through the running application", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "MFD Reference CRM" })).toBeVisible();
});

test("has no automatically detectable WCAG A or AA violations", async ({
  page,
  makeAxeBuilder,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "MFD Reference CRM" })).toBeVisible();

  const scan = await makeAxeBuilder().analyze();

  expect(scan.violations).toEqual([]);
});
