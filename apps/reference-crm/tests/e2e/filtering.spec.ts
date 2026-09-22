import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";

const resolvedThemeContexts = ["atlas", "bloom"].flatMap((brand) =>
  ["light", "dark"].flatMap((colorScheme) =>
    ["comfortable", "compact"].map((density) => ({ brand, colorScheme, density })),
  ),
);

async function signIn(page: Page) {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();
}

async function applyTheme(page: Page, theme: (typeof resolvedThemeContexts)[number]) {
  await page.locator("html").evaluate((element, nextTheme) => {
    element.dataset.brand = nextTheme.brand;
    element.dataset.colorScheme = nextTheme.colorScheme;
    element.dataset.density = nextTheme.density;
  }, theme);
}

test("loads combined Client filters directly from the canonical URL", async ({ page }) => {
  await signIn(page);
  await page.goto("/clients?q=northstar&status=active");

  await expect(page.getByRole("searchbox", { name: "Search clients" })).toHaveValue("northstar");
  await expect(
    page.getByRole("combobox", { name: "Filter by relationship status" }),
  ).toContainText("Active");
  await expect(page.getByRole("cell", { exact: true, name: "Northstar Studio" })).toBeVisible();
  await expect(page.getByRole("cell", { exact: true, name: "Lumen Works" })).toBeHidden();
  await expect(
    page.getByText("1 client found matching “northstar” and with active relationship status", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/clients\?q=northstar&status=active$/);
});

test("changes status immediately, combines it with search, and clears both criteria atomically", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/clients");

  const statusFilter = page.getByRole("combobox", { name: "Filter by relationship status" });
  await statusFilter.click();
  await page.getByRole("option", { name: "Inactive" }).click();
  await expect(page).toHaveURL(/\/clients\?status=inactive$/);
  await expect(page.getByRole("cell", { exact: true, name: "Lumen Works" })).toBeVisible();
  await expect(page.getByRole("cell", { exact: true, name: "Northstar Studio" })).toBeHidden();

  const search = page.getByRole("searchbox", { name: "Search clients" });
  await search.fill("lumen");
  await expect(page).toHaveURL(/\/clients\?status=inactive&q=lumen$/);
  await expect(page.getByRole("cell", { exact: true, name: "Lumen Works" })).toBeVisible();

  await page.getByRole("button", { name: "Clear filters" }).first().click();
  await expect(page).toHaveURL(/\/clients$/);
  await expect(search).toHaveValue("");
  await expect(page.getByRole("table", { name: "Clients" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeFocused();
});

test("canonicalizes an unsupported status without discarding a valid search", async ({ page }) => {
  await signIn(page);
  await page.goto("/clients?q=juniper&status=archived");

  await expect(page).toHaveURL(/\/clients\?q=juniper$/);
  await expect(page.getByRole("searchbox", { name: "Search clients" })).toHaveValue("juniper");
  await expect(page.getByRole("cell", { exact: true, name: "Juniper & Field" })).toBeVisible();
});

test("explains a status-only empty result and provides filter recovery", async ({ page }) => {
  await signIn(page);
  await page.goto("/clients?demoState=empty&status=inactive");

  await expect(page.getByRole("heading", { name: "No clients found" })).toBeVisible();
  await expect(
    page.getByText("No inactive clients found. Try another relationship status.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Clear filters" }).last()).toBeVisible();
});

test("keeps the Filter Bar usable at a 320px viewport", async ({ page }) => {
  await signIn(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/clients?q=juniper&status=active");

  await expect(page.getByRole("searchbox", { name: "Search clients" })).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Filter by relationship status" }),
  ).toBeVisible();
  await expect(page.getByRole("cell", { exact: true, name: "Juniper & Field" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    .toBe(true);
});

test("keeps the newest filtered result when an older filtered request resolves later", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/clients?demoState=slow-search&q=northstar&status=active");
  await expect(page.getByRole("cell", { exact: true, name: "Northstar Studio" })).toBeVisible();

  const statusFilter = page.getByRole("combobox", { name: "Filter by relationship status" });
  await statusFilter.click();
  await page.getByRole("option", { name: "Inactive" }).click();
  await expect(page).toHaveURL(/\/clients\?demoState=slow-search&q=northstar&status=inactive$/);
  await expect(page.getByRole("heading", { name: "No clients found" })).toBeVisible();
  await expect(page.getByText(/with an inactive relationship status/)).toBeVisible();
  await expect(page.getByRole("cell", { exact: true, name: "Northstar Studio" })).toBeHidden();
});

test("keeps combined filtering accessible in every resolved theme context", async ({
  makeAxeBuilder,
  page,
}) => {
  await signIn(page);

  for (const theme of resolvedThemeContexts) {
    await page.goto("/clients?q=juniper&status=active");
    await expect(page.getByRole("cell", { exact: true, name: "Juniper & Field" })).toBeVisible();
    await applyTheme(page, theme);

    const scan = await makeAxeBuilder().include(".clients-page").analyze();
    expect(scan.violations).toEqual([]);

    await page.reload();
    await expect(page.getByRole("searchbox", { name: "Search clients" })).toHaveValue("juniper");
    await expect(
      page.getByRole("combobox", { name: "Filter by relationship status" }),
    ).toContainText("Active");
    await expect(page.getByRole("cell", { exact: true, name: "Juniper & Field" })).toBeVisible();
  }
});
