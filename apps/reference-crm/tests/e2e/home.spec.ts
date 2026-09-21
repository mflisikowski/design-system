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
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();
  expect(await page.context().cookies()).toContainEqual(
    expect.objectContaining({
      httpOnly: true,
      name: "mfd-demo-session",
      sameSite: "Lax",
      secure: true,
    }),
  );
  await expect(page.getByRole("table", { name: "Clients" })).toBeVisible();

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

  await page.getByRole("button", { name: "More actions for Northstar Studio" }).click();
  await expect(page.getByRole("menu", { name: "Actions for Northstar Studio" })).toBeVisible();
  await page.getByRole("menuitem", { name: "Copy email address" }).click();
  const copyStatus = page.getByRole("status");
  await expect(copyStatus).toHaveText("Email address copied for Northstar Studio");
  const firstAnnouncementId = await copyStatus.getAttribute("data-announcement-id");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "jamie.chen@northstar.example",
  );
  await expect(
    page.getByRole("button", { name: "More actions for Northstar Studio" }),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menu", { name: "Actions for Northstar Studio" })).toBeVisible();
  await page.getByRole("menuitem", { name: "Copy email address" }).click();
  await expect(copyStatus).not.toHaveAttribute("data-announcement-id", firstAnnouncementId ?? "");
  await expect(copyStatus).toHaveText("Email address copied for Northstar Studio");

  await expect(page.getByRole("link", { name: "Settings" })).toHaveAttribute(
    "href",
    "/settings/appearance",
  );
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

test("validates and adds a client with success feedback and restored focus", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();

  const addClient = page.getByRole("button", { name: "Add client" });
  await addClient.click();

  await expect(page.getByRole("dialog", { name: "Add client" })).toBeVisible();
  const organizationName = page.getByRole("textbox", { name: "Organization name" });
  await expect(organizationName).toBeFocused();
  await expect(page.getByText("Organization name must have at least 2 characters.")).toBeHidden();

  await page.getByRole("button", { name: "Save client" }).click();

  await expect(organizationName).toBeFocused();
  await expect(page.getByText("Organization name must have at least 2 characters.")).toBeVisible();
  await expect(page.getByText("Contact name must have at least 2 characters.")).toBeVisible();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();

  await organizationName.fill("Aurora Works");
  await expect(page.getByText("Organization name must have at least 2 characters.")).toBeHidden();
  const contactName = page.getByRole("textbox", { name: "Contact name" });
  await page.getByRole("button", { name: "Save client" }).click();
  await expect(contactName).toBeFocused();
  await contactName.fill("Maya Ortiz");
  await page.getByRole("textbox", { name: "Contact email" }).fill("maya@aurora.example");
  await page.getByRole("textbox", { name: "Contact phone" }).fill("+48 555 010 202");
  await page
    .getByRole("textbox", { name: "Notes" })
    .fill("Introduced at the autumn planning session.");
  await page.getByRole("button", { name: "Save client" }).click();

  await expect(page.getByRole("button", { name: "Saving client" })).toBeDisabled();
  await expect(page.getByRole("dialog", { name: "Add client" })).toBeHidden();
  await expect(page.getByRole("cell", { exact: true, name: "Aurora Works" })).toBeVisible();
  await expect(page.getByText("Client added", { exact: true })).toBeVisible();
  await expect(addClient).toBeFocused();

  const firstClient = page.getByRole("row").nth(1).getByRole("cell").first();
  await expect(firstClient).toHaveText("Aurora Works");
  await page.reload();
  await expect(page.getByRole("cell", { exact: true, name: "Aurora Works" })).toBeVisible();
});

test("keeps a newly created client visible from the explicit empty demo state", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();
  await page.goto("/clients?demoState=empty");
  await expect(page.getByRole("heading", { name: "No clients yet" })).toBeVisible();

  await page.getByRole("button", { name: "Add client" }).click();
  await page.getByRole("textbox", { name: "Organization name" }).fill("Clearwater Studio");
  await page.getByRole("textbox", { name: "Contact name" }).fill("Sofia Novak");
  await page.getByRole("textbox", { name: "Contact email" }).fill("sofia@clearwater.example");
  await page.getByRole("button", { name: "Save client" }).click();

  await expect(page.getByRole("cell", { exact: true, name: "Clearwater Studio" })).toBeVisible();
});

test("presents Add Client full screen at 320px without accessibility violations", async ({
  page,
  makeAxeBuilder,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();

  await page.getByRole("button", { name: "Add client" }).click();
  const dialog = page.getByRole("dialog", { name: "Add client" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS("border-radius", "0px");
  await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
  expect(await dialog.boundingBox()).toMatchObject({ x: 0, y: 0, width: 320, height: 800 });

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBe(dimensions.viewportWidth);
  expect((await makeAxeBuilder().analyze()).violations).toEqual([]);
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
