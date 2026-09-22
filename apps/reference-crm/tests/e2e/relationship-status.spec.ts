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

test("changes Client relationship status independently and persists it after refresh", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/clients/client_northstar");

  const relationshipStatus = page.getByRole("combobox", {
    name: "Relationship status for Northstar Studio",
  });
  await expect(relationshipStatus).toContainText("Active");
  await relationshipStatus.click();
  await page.getByRole("option", { name: "Inactive", exact: true }).click();

  await expect(page.getByText("Client status updated", { exact: true })).toBeAttached();
  await expect(relationshipStatus).toContainText("Inactive");
  await expect(
    page.getByRole("combobox", { name: "Status for Website refresh" }),
  ).toContainText("Active");

  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Relationship status for Northstar Studio" }),
  ).toContainText("Inactive");
});

test("keeps the confirmed relationship status and control recoverable after failure", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/clients/client_northstar?demoStatusState=error-once");

  const relationshipStatus = page.getByRole("combobox", {
    name: "Relationship status for Northstar Studio",
  });
  await relationshipStatus.click();
  await page.getByRole("option", { name: "Inactive", exact: true }).click();

  await expect(page.getByRole("alert").filter({ hasText: "Client status could not be updated" }))
    .toBeVisible();
  await expect(relationshipStatus).toContainText("Active");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("Client status updated", { exact: true })).toBeAttached();
  await expect(relationshipStatus).toContainText("Inactive");
});

test("keeps only the relationship status control pending", async ({ page }) => {
  await signIn(page);
  await page.goto("/clients/client_northstar?demoStatusState=slow");

  const relationshipStatus = page.getByRole("combobox", {
    name: "Relationship status for Northstar Studio",
  });
  await relationshipStatus.click();
  await page.getByRole("option", { name: "Inactive", exact: true }).click();

  await expect(relationshipStatus).toHaveAttribute("aria-busy", "true");
  await expect(relationshipStatus).toContainText("Active");
  await expect(
    page.getByRole("combobox", { name: "Status for Website refresh" }),
  ).toBeEnabled();
  await expect(relationshipStatus).toContainText("Inactive", { timeout: 3000 });
});

test("supports keyboard selection, current-value no-op, and focus retention", async ({ page }) => {
  await signIn(page);
  await page.goto("/clients/client_northstar");

  let statusRequests = 0;
  page.on("request", (request) => {
    if (request.method() === "PATCH" && request.url().includes("/api/clients/client_northstar")) {
      statusRequests += 1;
    }
  });

  const relationshipStatus = page.getByRole("combobox", {
    name: "Relationship status for Northstar Studio",
  });
  await relationshipStatus.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("option", { name: "Active", exact: true })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(relationshipStatus).toBeFocused();
  expect(statusRequests).toBe(0);

  await page.keyboard.press("Enter");
  const inactiveOption = page.getByRole("option", { name: "Inactive", exact: true });
  await inactiveOption.focus();
  await inactiveOption.press("Enter");
  await expect(relationshipStatus).toContainText("Inactive");
  await expect(relationshipStatus).toBeFocused();
  expect(statusRequests).toBe(1);
});

test("reflows relationship status at 320px, 200% zoom, and RTL", async ({ page }) => {
  await signIn(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/clients/client_northstar");
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });

  await expect(
    page.getByRole("combobox", { name: "Relationship status for Northstar Studio" }),
  ).toBeVisible();
  const narrowDimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(narrowDimensions.documentWidth).toBe(narrowDimensions.viewportWidth);

  await page.setViewportSize({ width: 640, height: 800 });
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  const zoomDimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(zoomDimensions.documentWidth).toBe(zoomDimensions.viewportWidth);
});

for (const { brand, colorScheme, density } of resolvedThemeContexts) {
  test(`keeps Client relationship status accessible in ${brand} ${colorScheme} ${density}`, async ({
    page,
    makeAxeBuilder,
  }) => {
    await signIn(page);
    await page.goto("/clients/client_northstar");
    await page.locator("html").evaluate(
      (element, theme) => {
        element.dataset.brand = theme.brand;
        element.dataset.colorScheme = theme.colorScheme;
        element.dataset.density = theme.density;
      },
      { brand, colorScheme, density },
    );

    const relationshipStatus = page.getByRole("combobox", {
      name: "Relationship status for Northstar Studio",
    });
    await expect(relationshipStatus).toContainText("Active");
    await expect(relationshipStatus.locator("[data-tone='success']")).toHaveText("Active");
    const scan = await makeAxeBuilder().include(".client-details-page").analyze();
    expect(scan.violations).toEqual([]);

    await page.goto("/clients/client_lumen");
    const inactiveRelationshipStatus = page.getByRole("combobox", {
      name: "Relationship status for Lumen Works",
    });
    await expect(inactiveRelationshipStatus).toContainText("Inactive");
    await expect(inactiveRelationshipStatus.locator("[data-tone='neutral']")).toHaveText(
      "Inactive",
    );
  });
}
