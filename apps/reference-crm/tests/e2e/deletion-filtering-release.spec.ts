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

test("keeps the no-cascade Client deletion guard accessible in every release context", async ({
  makeAxeBuilder,
  page,
}) => {
  await signIn(page);

  for (const theme of resolvedThemeContexts) {
    await page.goto("/clients/client_northstar");
    await expect(page.getByRole("table", { name: "Projects" })).toBeVisible();
    await applyTheme(page, theme);

    await page.getByRole("button", { name: "Delete client" }).click();

    await expect(page.getByRole("alertdialog", { name: "Delete Northstar Studio?" })).toBeHidden();
    await expect(
      page.getByRole("alert").filter({ hasText: "Client cannot be deleted yet" }),
    ).toContainText("2 Projects still belong to Northstar Studio");
    await expect(page.getByText("Website refresh", { exact: true })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Status for Website refresh" })).toContainText(
      "Active",
    );

    const scan = await makeAxeBuilder().include(".client-details-page").analyze();
    expect(scan.violations).toEqual([]);
  }
});

test("keeps combined relationship filtering canonical and accessible in every release context", async ({
  makeAxeBuilder,
  page,
}) => {
  await signIn(page);

  for (const theme of resolvedThemeContexts) {
    await page.goto("/clients?q=juniper&status=active");
    await expect(page.getByRole("searchbox", { name: "Search clients" })).toHaveValue("juniper");
    await expect(
      page.getByRole("combobox", { name: "Filter by relationship status" }),
    ).toContainText("Active");
    await expect(page.getByRole("cell", { exact: true, name: "Juniper & Field" })).toBeVisible();
    await expect(page.getByRole("cell", { exact: true, name: "Lumen Works" })).toBeHidden();
    await applyTheme(page, theme);

    await expect(page).toHaveURL(/\/clients\?q=juniper&status=active$/);
    await expect(
      page.getByText("1 client found matching “juniper” and with active relationship status", {
        exact: true,
      }),
    ).toBeVisible();

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
