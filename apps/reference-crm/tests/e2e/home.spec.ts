import { expect, test } from "./fixtures";

test("protects CRM routes and returns to the requested page after demo sign in", async ({
  page,
}) => {
  await page.goto("/clients?view=all");

  await expect(page).toHaveURL(/\/sign-in\?returnTo=%2Fclients%3Fview%3Dall$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Welcome to Reference CRM" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Continue as demo manager" }).click();

  await expect(page).toHaveURL(/\/clients\?view=all$/);
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();
});

test("exposes the authenticated shell and deterministic client table", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();
  expect(await page.context().cookies()).toContainEqual(
    expect.objectContaining({ httpOnly: true, name: "mfd-demo-session", sameSite: "Lax" }),
  );
  await page.goto("/clients");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.getByRole("link", { name: "Skip to content" }).press("Enter");

  await expect(page.locator("#main-content")).toBeFocused();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.getByText("Alex Morgan — Account Manager")).toBeVisible();
  await expect(page.getByText("Demo mode", { exact: true })).toBeVisible();
  await expect(page.getByRole("table", { name: "Clients" })).toBeVisible();
  await expect(page.getByRole("cell", { exact: true, name: "Northstar Studio" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Added" })).toBeVisible();
});

test("signs out and protects the session again", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();

  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto("/clients");
  await expect(page).toHaveURL(/\/sign-in\?returnTo=%2Fclients$/);
});

test("renders loading, empty, and persistent error states accessibly", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();

  await page.goto("/clients?demoState=empty");
  await expect(page.getByRole("status").filter({ hasText: "Loading clients" })).toBeAttached();
  await expect(page.getByRole("heading", { name: "No clients yet" })).toBeVisible();

  await page.goto("/clients?demoState=error");
  await expect(page.locator(".mfd-alert[role='alert']")).toContainText(
    "Clients could not be loaded",
  );
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});

test("resets locally persisted demo data and survives narrow reflow", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();
  await page.evaluate(() => localStorage.setItem("mfd-demo-clients", "[]"));
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/clients");

  await expect(page.getByRole("heading", { name: "No clients yet" })).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset demo data" }).click();

  await expect(page.getByRole("cell", { exact: true, name: "Northstar Studio" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Added" })).toBeHidden();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  await page.reload();
  await expect(page.getByRole("cell", { exact: true, name: "Northstar Studio" })).toBeVisible();
});

test("has no automatically detectable WCAG A or AA violations", async ({
  page,
  makeAxeBuilder,
}) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();

  const scan = await makeAxeBuilder().analyze();

  expect(scan.violations).toEqual([]);
});
