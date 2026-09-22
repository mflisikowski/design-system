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

test("loads Client and Projects independently and preserves the project states", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/clients/client_northstar?demoProjectState=empty");

  await expect(page.getByRole("heading", { level: 1, name: "Northstar Studio" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "No projects yet" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add project" })).toBeVisible();

  await page.goto("/clients/client_northstar?demoProjectState=error");
  await expect(page.getByRole("heading", { level: 1, name: "Northstar Studio" })).toBeVisible();
  await expect(page.locator(".mfd-alert[role='alert']")).toContainText(
    "Projects could not be loaded",
  );
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});

test("validates, adds, persists, and restores focus for a project", async ({ page }) => {
  await signIn(page);
  await page.goto("/clients/client_northstar");
  await expect(page.getByRole("table", { name: "Projects" })).toBeVisible();

  const addProject = page.getByRole("button", { name: "Add project" });
  await addProject.click();
  await expect(page.getByRole("dialog", { name: "Add project" })).toBeVisible();
  const projectName = page.getByRole("textbox", { name: "Project name" });
  await expect(projectName).toBeFocused();
  await page.getByRole("button", { name: "Save project" }).click();
  await expect(projectName).toBeFocused();
  await expect(page.getByText("Project name must have at least 2 characters.")).toBeVisible();

  await projectName.fill("Aurora rollout");
  await page
    .getByRole("textbox", { name: "Description" })
    .fill("Coordinate the first release for the client team.");
  await expect(page.getByRole("combobox", { name: "Status" })).toHaveValue("planned");
  await page.getByRole("button", { name: "Save project" }).click();

  await expect(page.getByRole("dialog", { name: "Add project" })).toBeHidden();
  await expect(page.getByText("Aurora rollout", { exact: true })).toBeVisible();
  await expect(page.getByText("Project added", { exact: true })).toBeVisible();
  await expect(addProject).toBeFocused();
  await expect(page.getByRole("row").nth(1)).toContainText("Aurora rollout");

  await page.reload();
  await expect(page.getByText("Aurora rollout", { exact: true })).toBeVisible();
});

test("keeps the project form open through a server failure and retry", async ({ page }) => {
  await signIn(page);
  await page.goto("/clients/client_northstar?demoProjectCreateState=error-once");
  await expect(page.getByRole("table", { name: "Projects" })).toBeVisible();

  await page.getByRole("button", { name: "Add project" }).click();
  await page.getByRole("textbox", { name: "Project name" }).fill("Recovery rollout");
  await page.getByRole("button", { name: "Save project" }).click();

  await expect(page.getByRole("dialog", { name: "Add project" })).toBeVisible();
  await expect(page.locator(".mfd-alert[role='alert']")).toContainText(
    "Project could not be saved",
  );
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("Recovery rollout", { exact: true })).toBeVisible();
  await expect(page.getByText("Project added", { exact: true })).toBeVisible();
});

test("keeps the project table usable at a narrow viewport", async ({ page }) => {
  await signIn(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/clients/client_northstar");

  await expect(page.getByRole("table", { name: "Projects" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Updated" })).toBeHidden();
  await expect(page.getByRole("columnheader", { name: "Project" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test("changes project status with keyboard feedback and keeps the failure recoverable", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/clients/client_northstar");

  const status = page.getByRole("combobox", { name: "Status for Website refresh" });
  await status.click();
  await expect(page.getByRole("option", { name: "Planned" })).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");

  await expect(page.getByText("Project status updated", { exact: true })).toBeVisible();
  await expect(status).toContainText("On hold");

  await page.goto("/clients/client_northstar?demoProjectStatusState=error-once");
  const retryableStatus = page.getByRole("combobox", { name: "Status for Website refresh" });
  await retryableStatus.click();
  await page.getByRole("option", { name: "Completed" }).click();

  await expect(page.locator(".mfd-alert[role='alert']")).toContainText(
    "Project status could not be updated",
  );
  await expect(retryableStatus).toContainText("On hold");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("Project status updated", { exact: true })).toBeVisible();
  await expect(retryableStatus).toContainText("Completed");
});

for (const { brand, colorScheme, density } of resolvedThemeContexts) {
  test(`keeps every Project Status accessible in ${brand} ${colorScheme} ${density}`, async ({
    page,
    makeAxeBuilder,
  }) => {
    await signIn(page);
    await page.goto("/clients/client_northstar");
    await expect(page.getByRole("table", { name: "Projects" })).toBeVisible();

    await page.locator("html").evaluate(
      (element, theme) => {
        element.dataset.brand = theme.brand;
        element.dataset.colorScheme = theme.colorScheme;
        element.dataset.density = theme.density;
      },
      { brand, colorScheme, density },
    );

    await expect(page.getByRole("combobox", { name: "Status for Website refresh" })).toContainText(
      "Active",
    );
    await expect(page.getByRole("combobox", { name: "Status for Brand system" })).toContainText(
      "Completed",
    );

    const status = page.getByRole("combobox", { name: "Status for Website refresh" });
    await status.click();
    for (const label of ["Planned", "Active", "On hold", "Completed"]) {
      await expect(page.getByRole("option", { name: label, exact: true })).toBeVisible();
    }
    await page.keyboard.press("Escape");

    const scan = await makeAxeBuilder().include(".projects-section").analyze();
    expect(scan.violations).toEqual([]);
  });
}
