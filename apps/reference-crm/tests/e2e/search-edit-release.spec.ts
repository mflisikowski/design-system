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

test("keeps canonical Client search accessible in every browser and resolved theme context", async ({
  makeAxeBuilder,
  page,
}) => {
  await signIn(page);

  for (const theme of resolvedThemeContexts) {
    await page.goto("/clients?q=juniper");
    await expect(page.getByRole("searchbox", { name: "Search clients" })).toHaveValue("juniper");
    await expect(page.getByRole("cell", { exact: true, name: "Juniper & Field" })).toBeVisible();
    await applyTheme(page, theme);

    const search = page.getByRole("searchbox", { name: "Search clients" });
    await expect(search).toHaveValue("juniper");
    await expect(page).toHaveURL(/\/clients\?q=juniper$/);
    await expect(page.getByRole("region", { name: "Client results" })).not.toHaveAttribute(
      "aria-busy",
      "true",
    );

    const scan = await makeAxeBuilder().include(".clients-page").analyze();
    expect(scan.violations).toEqual([]);

    await page.reload();
    await expect(page.getByRole("searchbox", { name: "Search clients" })).toHaveValue("juniper");
    await expect(page.getByRole("cell", { exact: true, name: "Juniper & Field" })).toBeVisible();
  }
});

test("keeps Client editing accessible and preserves its confirmed contract in every theme context", async ({
  makeAxeBuilder,
  page,
}) => {
  await signIn(page);

  for (const theme of resolvedThemeContexts) {
    await page.goto("/clients/client_northstar");
    await expect(page.getByRole("heading", { level: 1, name: "Northstar Studio" })).toBeVisible();
    await applyTheme(page, theme);

    await page.getByRole("button", { name: "Edit client" }).click();
    const dialog = page.getByRole("dialog", { name: "Edit client" });
    const organizationName = page.getByRole("textbox", { name: "Organization name" });
    await expect(dialog).toBeVisible();
    await expect(organizationName).toHaveValue("Northstar Studio");
    await expect(page.getByRole("button", { name: "Save changes" })).toBeDisabled();

    const scan = await makeAxeBuilder().exclude("[data-base-ui-focus-guard]").analyze();
    expect(scan.violations).toEqual([]);

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: "Edit client" })).toBeFocused();
  }
});
