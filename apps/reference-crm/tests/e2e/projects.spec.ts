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

test("deletes a project safely, persists the result, and restores focus to the next action", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/clients/client_northstar");

  const deleteWebsite = page.getByRole("button", { name: "Delete Website refresh" });
  await deleteWebsite.click();
  const confirmation = page.getByRole("alertdialog", { name: "Delete Website refresh?" });
  await expect(confirmation).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancel" })).toBeFocused();

  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(confirmation).toBeHidden();
  await expect(deleteWebsite).toBeFocused();

  await deleteWebsite.click();
  await page.getByRole("button", { name: "Delete project" }).click();
  await expect(page.getByText("Website refresh", { exact: true })).toBeHidden();
  await expect(page.getByText("Brand system", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete Brand system" })).toBeFocused();
  await expect(page.getByText("Project deleted", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText("Website refresh", { exact: true })).toBeHidden();
  await expect(page.getByText("Brand system", { exact: true })).toBeVisible();

  const deleteBrand = page.getByRole("button", { name: "Delete Brand system" });
  await deleteBrand.click();
  await page.getByRole("button", { name: "Delete project" }).click();
  const addProject = page.getByRole("button", { name: "Add project" });
  await expect(page.getByRole("heading", { name: "No projects yet" })).toBeVisible();
  await expect(addProject).toBeFocused();
});

test("keeps project deletion open through infrastructure failure and retry", async ({ page }) => {
  await signIn(page);
  await page.goto("/clients/client_northstar?demoProjectDeleteState=error-once");

  await page.getByRole("button", { name: "Delete Website refresh" }).click();
  await page.getByRole("button", { name: "Delete project" }).click();

  const confirmation = page.getByRole("alertdialog", { name: "Delete Website refresh?" });
  await expect(confirmation).toBeVisible();
  await expect(confirmation).toContainText("Project could not be deleted");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(confirmation).toBeHidden();
  await expect(page.getByText("Website refresh", { exact: true })).toBeHidden();
});

test("removes a stale project confirmation and focuses the surviving fallback", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/clients/client_northstar?demoProjectDeleteState=not-found");

  await page.getByRole("button", { name: "Delete Website refresh" }).click();
  await page.getByRole("button", { name: "Delete project" }).click();

  await expect(page.getByRole("alertdialog", { name: "Delete Website refresh?" })).toBeHidden();
  await expect(page.getByText("Website refresh", { exact: true })).toBeHidden();
  await expect(page.getByRole("button", { name: "Delete Brand system" })).toBeFocused();
  await expect(page.getByRole("heading", { name: "Project is no longer available" })).toBeVisible();
});

test("blocks Client deletion while Projects exist and explains the dependency", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/clients/client_northstar");
  await expect(page.getByRole("table", { name: "Projects" })).toBeVisible();

  await page.getByRole("button", { name: "Delete client" }).click();

  await expect(page.getByRole("alertdialog", { name: "Delete Northstar Studio?" })).toBeHidden();
  await expect(
    page.getByRole("alert").filter({ hasText: "Client cannot be deleted yet" }),
  ).toContainText("2 Projects still belong to Northstar Studio");
  await expect(page.getByRole("heading", { level: 1, name: "Northstar Studio" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Northstar Studio" })).toBeVisible();
  await expect(page.getByText("Website refresh", { exact: true })).toBeVisible();
});

test("deletes an empty Client only after Projects are removed and focuses the list heading", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/clients/client_northstar");
  await expect(page.getByRole("table", { name: "Projects" })).toBeVisible();

  for (const projectName of ["Website refresh", "Brand system"]) {
    const deleteProject = page.getByRole("button", { name: `Delete ${projectName}` });
    await deleteProject.click();
    const confirmation = page.getByRole("alertdialog", { name: `Delete ${projectName}?` });
    await expect(confirmation).toBeVisible();
    await page.getByRole("button", { name: "Delete project" }).click();
    await expect(page.getByText(projectName, { exact: true })).toBeHidden();
  }

  const deleteClient = page.getByRole("button", { name: "Delete client" });
  await deleteClient.click();
  const confirmation = page.getByRole("alertdialog", { name: "Delete Northstar Studio?" });
  await expect(confirmation).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancel" })).toBeFocused();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(confirmation).toBeHidden();
  await expect(deleteClient).toBeFocused();

  await deleteClient.click();
  await page.getByRole("button", { name: "Delete client" }).last().click();

  await expect(page).toHaveURL(/\/clients$/);
  const clientsHeading = page.getByRole("heading", { level: 1, name: "Clients" });
  await expect(clientsHeading).toBeFocused();
  await expect(page.getByText("Client deleted", { exact: true })).toBeAttached();
  await expect(page.getByRole("cell", { exact: true, name: "Northstar Studio" })).toBeHidden();

  await page.reload();
  await expect(page.getByRole("cell", { exact: true, name: "Northstar Studio" })).toBeHidden();
});

test("keeps Client deletion open through failure and handles a stale Client", async ({ page }) => {
  await signIn(page);
  await page.goto("/clients/client_lumen?demoClientDeleteState=error-once");
  await expect(page.getByRole("heading", { level: 1, name: "Lumen Works" })).toBeVisible();

  await page.getByRole("button", { name: "Delete client" }).click();
  const confirmation = page.getByRole("alertdialog", { name: "Delete Lumen Works?" });
  await page.getByRole("button", { name: "Delete client" }).last().click();
  await expect(confirmation).toContainText("Client could not be deleted");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page).toHaveURL(/\/clients$/);
  await expect(page.getByText("Client deleted", { exact: true })).toBeAttached();

  await page.goto("/clients");
  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await expect(page.getByRole("cell", { exact: true, name: "Lumen Works" })).toBeVisible();

  await page.goto("/clients/client_lumen?demoClientDeleteState=not-found");
  await expect(page.getByRole("heading", { level: 1, name: "Lumen Works" })).toBeVisible();
  await page.getByRole("button", { name: "Delete client" }).click();
  await page.getByRole("button", { name: "Delete client" }).last().click();
  await expect(page).toHaveURL(/\/clients$/);
  await expect(page.getByText("Client is no longer available", { exact: true })).toBeAttached();
});

test("closes an unsafe Client confirmation when a Project appears on the server", async ({
  page,
}) => {
  await signIn(page);
  await page.goto(
    "/clients/client_lumen?demoProjectState=empty&demoClientDeleteState=has-projects",
  );
  await expect(page.getByRole("heading", { level: 1, name: "Lumen Works" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "No projects yet" })).toBeVisible();

  await page.getByRole("button", { name: "Delete client" }).click();
  await page.getByRole("button", { name: "Delete client" }).last().click();

  await expect(page.getByRole("alertdialog", { name: "Delete Lumen Works?" })).toBeHidden();
  await expect(
    page.getByRole("alert").filter({ hasText: "Client cannot be deleted yet" }),
  ).toContainText("1 Project still belongs to Lumen Works");
  await expect(page.getByRole("heading", { level: 1, name: "Lumen Works" })).toBeVisible();
});

test("protects every Client deletion dismissal path while pending", async ({ page }) => {
  await signIn(page);
  await page.goto("/clients/client_lumen?demoClientDeleteState=slow");
  await expect(page.getByRole("heading", { level: 1, name: "Lumen Works" })).toBeVisible();

  await page.getByRole("button", { name: "Delete client" }).click();
  const confirmation = page.getByRole("alertdialog", { name: "Delete Lumen Works?" });
  await page.getByRole("button", { name: "Delete client" }).last().click();
  await expect(confirmation).toHaveAttribute("aria-busy", "true");
  await expect(page.getByRole("button", { name: "Cancel" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Deleting client" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await page.keyboard.press("Escape");
  await expect(confirmation).toBeVisible();
  await page.locator(".mfd-alert-dialog__backdrop").click({ force: true });
  await expect(confirmation).toBeVisible();
  await expect(page).toHaveURL(/\/clients\/.+/);
});

test("blocks every project deletion dismissal path while pending", async ({ page }) => {
  await signIn(page);
  await page.goto("/clients/client_northstar?demoProjectDeleteState=slow");

  await page.getByRole("button", { name: "Delete Website refresh" }).click();
  await page.getByRole("button", { name: "Delete project" }).click();

  const confirmation = page.getByRole("alertdialog", { name: "Delete Website refresh?" });
  await expect(confirmation).toHaveAttribute("aria-busy", "true");
  await expect(page.getByRole("button", { name: "Cancel" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Deleting project" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await page.keyboard.press("Escape");
  await expect(confirmation).toBeVisible();
  await page.locator(".mfd-alert-dialog__backdrop").click({ force: true });
  await expect(confirmation).toBeVisible();

  await expect(page.getByText("Website refresh", { exact: true })).toBeHidden();
});

for (const { brand, colorScheme, density } of resolvedThemeContexts) {
  test(`keeps blocked Client deletion accessible in ${brand} ${colorScheme} ${density}`, async ({
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

    await page.getByRole("button", { name: "Delete client" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Client cannot be deleted yet" }),
    ).toBeVisible();
    const scan = await makeAxeBuilder().include(".client-details-page").analyze();
    expect(scan.violations).toEqual([]);
  });

  test(`keeps Project deletion accessible in ${brand} ${colorScheme} ${density}`, async ({
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

    const deleteWebsite = page.getByRole("button", { name: "Delete Website refresh" });
    await deleteWebsite.click();
    const confirmation = page.getByRole("alertdialog", { name: "Delete Website refresh?" });
    await expect(confirmation).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeFocused();
    const scan = await makeAxeBuilder().include("[role='alertdialog']").analyze();
    expect(scan.violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(confirmation).toBeHidden();
    await expect(deleteWebsite).toBeFocused();
  });

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
