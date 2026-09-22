import { expect, test } from "./fixtures";

const resolvedThemeContexts = ["atlas", "bloom"].flatMap((brand) =>
  ["light", "dark"].flatMap((colorScheme) =>
    ["comfortable", "compact"].map((density) => ({ brand, colorScheme, density })),
  ),
);

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

test("exposes the authenticated shell and deterministic client table", async ({
  browserName,
  page,
}) => {
  if (browserName === "chromium") {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  }
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();
  expect(await page.context().cookies()).toContainEqual(
    expect.objectContaining({
      httpOnly: true,
      name: "mfd-demo-session",
      sameSite: "Lax",
      secure: process.env.MFD_E2E_INSECURE_HTTP_COOKIES !== "1",
    }),
  );
  await expect(page.getByRole("table", { name: "Clients" })).toBeVisible();

  await page.goto("/clients");
  await expect(page.getByRole("table", { name: "Clients" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
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
  if (browserName === "chromium") {
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "jamie.chen@northstar.example",
    );
  }
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

test("changes appearance axes independently and preserves them before hydration", async ({
  page,
}) => {
  const hydrationDiagnostics: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /hydration|mismatch/i.test(message.text())) {
      hydrationDiagnostics.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    if (/hydration|mismatch/i.test(error.message)) {
      hydrationDiagnostics.push(error.message);
    }
  });

  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();
  const initialResponse = await page.goto("/settings/appearance");
  const initialServerHtml = await initialResponse?.text();
  expect(initialServerHtml).toContain('data-brand="atlas"');
  expect(initialServerHtml).toContain('data-color-scheme="system"');
  expect(initialServerHtml).toContain('data-density="comfortable"');

  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-brand", "atlas");
  await expect(root).toHaveAttribute("data-color-scheme", "system");
  await expect(root).toHaveAttribute("data-density", "comfortable");
  const mainContent = await page.locator("#main-content").elementHandle();

  const bloom = page.getByRole("radio", { name: /Bloom/ });
  await bloom.click();
  await expect(root).toHaveAttribute("data-brand", "bloom");
  await expect(bloom).toBeFocused();
  expect(
    await mainContent?.evaluate((element) => element === document.querySelector("#main-content")),
  ).toBe(true);

  const dark = page.getByRole("radio", { name: /Dark/ });
  await dark.click();
  await expect(dark).toBeChecked();
  await expect(root).toHaveAttribute("data-color-scheme", "dark");
  const compact = page.getByRole("radio", { name: /Compact/ });
  await compact.click();
  await expect(compact).toBeChecked();
  await expect(root).toHaveAttribute("data-density", "compact");
  await expect(root).toHaveAttribute("data-brand", "bloom");
  for (const name of ["Brand", "Color scheme", "Density"]) {
    await expect(page.getByRole("radiogroup", { name })).not.toHaveAttribute("aria-busy", "true");
  }

  const reloadResponse = await page.reload();
  const serverHtml = await reloadResponse?.text();
  expect(serverHtml).toContain('data-brand="bloom"');
  expect(serverHtml).toContain('data-color-scheme="dark"');
  expect(serverHtml).toContain('data-density="compact"');
  await expect(page.getByRole("heading", { level: 1, name: "Appearance" })).toBeVisible();
  await expect(root).toHaveAttribute("data-brand", "bloom");
  await expect(root).toHaveAttribute("data-color-scheme", "dark");
  await expect(root).toHaveAttribute("data-density", "compact");
  expect(hydrationDiagnostics).toEqual([]);
});

test("keeps appearance radio targets at least 44px at 320px in compact density", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();
  await page.goto("/settings/appearance");
  await page.getByRole("radio", { name: /Compact/ }).click();

  const radioBoxes = await page.locator('[role="radio"]').evaluateAll((radios) =>
    radios.map((radio) => {
      const { height, width } = radio.getBoundingClientRect();
      return { height, width };
    }),
  );

  expect(radioBoxes).toHaveLength(7);
  expect(radioBoxes.every(({ height, width }) => height >= 44 && width >= 44)).toBe(true);
});

test("falls back independently for invalid appearance cookies", async ({ page }) => {
  await page.goto("/sign-in");
  const baseURL = new URL(page.url());
  await page.context().addCookies([
    { name: "mfd-demo-brand", value: "invalid", url: baseURL.origin },
    { name: "mfd-color-scheme", value: "dark", url: baseURL.origin },
    { name: "mfd-density", value: "invalid", url: baseURL.origin },
  ]);

  await page.reload();
  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-brand", "atlas");
  await expect(root).toHaveAttribute("data-color-scheme", "dark");
  await expect(root).toHaveAttribute("data-density", "comfortable");
});

test("resets appearance as one operation and follows system color changes", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();
  await page.goto("/settings/appearance");

  await page.getByRole("radio", { name: /Bloom/ }).click();
  await page.getByRole("radio", { name: /Dark/ }).click();
  await page.getByRole("radio", { name: /Compact/ }).click();

  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-brand", "bloom");
  await expect(root).toHaveAttribute("data-color-scheme", "dark");
  await expect(root).toHaveAttribute("data-density", "compact");

  const reset = page.getByRole("button", { name: "Reset appearance" });
  await reset.click();
  await expect(root).toHaveAttribute("data-brand", "atlas");
  await expect(root).toHaveAttribute("data-color-scheme", "system");
  await expect(root).toHaveAttribute("data-density", "comfortable");
  await expect(page.getByRole("status")).toHaveText("Appearance reset to the default settings.");
  await expect(reset).toBeFocused();

  await page.emulateMedia({ colorScheme: "dark" });
  await expect(root).toHaveAttribute("data-color-scheme", "system");
  await expect(root).toHaveCSS("color-scheme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(root).toHaveCSS("color-scheme", "light");

  const reloadResponse = await page.reload();
  const serverHtml = await reloadResponse?.text();
  expect(serverHtml).toContain('data-brand="atlas"');
  expect(serverHtml).toContain('data-color-scheme="system"');
  expect(serverHtml).toContain('data-density="comfortable"');
});

test("opens the same client details state from the table and a direct URL", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("cell", { exact: true, name: "Northstar Studio" })).toBeVisible();

  const clientLink = page.getByRole("link", { name: "Northstar Studio", exact: true });
  await expect(clientLink).toHaveAttribute("href", "/clients/client_northstar");
  await clientLink.click();

  await expect(page).toHaveURL(/\/clients\/client_northstar$/);
  await expect(page.getByRole("heading", { level: 1, name: "Northstar Studio" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Clients" }),
  ).toHaveAttribute("href", "/clients");
  await expect(page.getByText("Jamie Chen", { exact: true })).toBeVisible();
  await expect(page.getByText("jamie.chen@northstar.example", { exact: true })).toBeVisible();

  await page.goto("/clients/client_northstar");
  await expect(page.getByRole("heading", { level: 1, name: "Northstar Studio" })).toBeVisible();
  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb).toContainText("Clients");
  await expect(breadcrumb).toContainText("Northstar Studio");
});

test("returns to a directly requested client detail page after demo sign in", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/clients/client_northstar");

  await expect(page).toHaveURL(/\/sign-in\?returnTo=%2Fclients%2Fclient_northstar$/);
  await page.getByRole("button", { name: "Continue as demo manager" }).click();

  await expect(page).toHaveURL(/\/clients\/client_northstar$/);
  await expect(page.getByRole("heading", { level: 1, name: "Northstar Studio" })).toBeVisible();
});

test("shows an accessible not found state with a safe return path", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();
  await page.goto("/clients/client_missing");

  await expect(page.getByRole("heading", { level: 1, name: "Client not found" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "We could not find that client" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to clients" })).toHaveAttribute(
    "href",
    "/clients",
  );
  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb).toContainText("Clients");
  await expect(breadcrumb).toContainText("Client not found");
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
  await expect(page.getByRole("heading", { name: "No clients yet" })).toBeVisible({
    timeout: 15_000,
  });

  await page.goto("/clients?demoState=error");
  await expect(page.locator(".mfd-alert[role='alert']")).toContainText(
    "Clients could not be loaded",
  );
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});

test("searches clients through a canonical URL and restores the complete list", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();

  await page.goto("/clients?q=juniper");
  const search = page.getByRole("searchbox", { name: "Search clients" });
  await expect(search).toHaveValue("juniper");
  await expect(page.getByRole("cell", { exact: true, name: "Juniper & Field" })).toBeVisible();
  await expect(page.getByRole("cell", { exact: true, name: "Northstar Studio" })).toBeHidden();
  await expect(page.getByText("1 client found matching “juniper”", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(page).toHaveURL(/\/clients$/);
  await expect(search).toHaveValue("");
  await expect(page.getByRole("cell", { exact: true, name: "Northstar Studio" })).toBeVisible();
  await expect(page.getByText("3 clients found", { exact: true })).toBeVisible();
});

test("debounces search, submits immediately, and exposes a no-results recovery", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();

  await page.goto("/clients");
  await expect(page.getByRole("table", { name: "Clients" })).toBeVisible();
  const search = page.getByRole("searchbox", { name: "Search clients" });
  await search.fill("lumen");
  await expect(page).toHaveURL(/\/clients$/);
  await search.press("Enter");
  await expect(page).toHaveURL(/\/clients\?q=lumen$/);
  await expect(page.getByRole("cell", { exact: true, name: "Lumen Works" })).toBeVisible();

  await search.fill("does-not-exist");
  await expect(page).toHaveURL(/\/clients\?q=lumen$/);
  await expect(page).toHaveURL(/\/clients\?q=does-not-exist$/, { timeout: 2_000 });
  await expect(page.getByRole("heading", { name: "No clients found" })).toBeVisible();
  await expect(
    page.getByText("No clients match “does-not-exist”.", { exact: false }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Clear search" }).last().click();
  await expect(page).toHaveURL(/\/clients$/);
  await expect(page.getByRole("table", { name: "Clients" })).toBeVisible();
});

test("keeps the newest search result when an older request resolves later", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();
  await page.goto("/clients?demoState=slow-search");
  await expect(page.getByRole("table", { name: "Clients" })).toBeVisible();

  const search = page.getByRole("searchbox", { name: "Search clients" });
  await search.fill("northstar");
  await expect(page).toHaveURL(/\/clients\?demoState=slow-search&q=northstar$/);
  await search.fill("juniper");
  await expect(page).toHaveURL(/\/clients\?demoState=slow-search&q=juniper$/);
  await expect(page.getByRole("cell", { exact: true, name: "Juniper & Field" })).toBeVisible();
  await expect(page.getByRole("cell", { exact: true, name: "Northstar Studio" })).toBeHidden();
});

test("retains successful rows and the canonical query after a search failure", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();
  await page.goto("/clients?demoState=error-search");
  await expect(page.getByRole("cell", { exact: true, name: "Northstar Studio" })).toBeVisible();

  const search = page.getByRole("searchbox", { name: "Search clients" });
  await search.fill("failure");
  await expect(page).toHaveURL(/\/clients\?demoState=error-search&q=failure$/);
  await expect(page.locator(".mfd-alert[role='alert']")).toContainText(
    "last successful results have been preserved",
  );
  await expect(page.getByRole("cell", { exact: true, name: "Northstar Studio" })).toBeVisible();
  await expect(search).toHaveValue("failure");
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

  await expect(page.getByRole("button", { name: "Saving client" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
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

test("protects dirty Add Client values from every dismissal path", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();

  const addClient = page.getByRole("button", { name: "Add client" });
  await addClient.click();
  const organizationName = page.getByRole("textbox", { name: "Organization name" });
  await organizationName.fill("Protected Studio");

  const cancel = page.getByRole("button", { name: "Cancel" });
  await cancel.click();
  const confirmation = page.getByRole("alertdialog", { name: "Discard changes?" });
  await expect(confirmation).toBeVisible();
  await expect(page.getByRole("button", { name: "Keep editing" })).toBeFocused();
  await page.getByRole("button", { name: "Keep editing" }).click();
  await expect(organizationName).toHaveValue("Protected Studio");
  await expect(cancel).toBeFocused();

  await page.locator(".mfd-dialog__viewport").click({ position: { x: 4, y: 4 } });
  await expect(confirmation).toBeVisible();
  await page.getByRole("button", { name: "Keep editing" }).click();
  await expect(organizationName).toHaveValue("Protected Studio");

  await page.getByRole("button", { name: "Close" }).click();
  await expect(confirmation).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(confirmation).toBeHidden();
  await expect(page.getByRole("button", { name: "Close" })).toBeFocused();

  await organizationName.focus();
  await page.keyboard.press("Escape");
  await expect(confirmation).toBeVisible();
  await page.getByRole("button", { name: "Discard changes" }).click();
  await expect(page.getByRole("dialog", { name: "Add client" })).toBeHidden();
  await expect(addClient).toBeFocused();
});

test("closes a pristine Add Client dialog through every dismissal path", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();

  const addClient = page.getByRole("button", { name: "Add client" });
  const dialog = page.getByRole("dialog", { name: "Add client" });

  await addClient.click();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(addClient).toBeFocused();

  await addClient.click();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();
  await expect(addClient).toBeFocused();

  await addClient.click();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(addClient).toBeFocused();

  await addClient.click();
  await page.locator(".mfd-dialog__viewport").click({ position: { x: 4, y: 4 } });
  await expect(dialog).toBeHidden();
  await expect(addClient).toBeFocused();
});

test("maps duplicate contact email errors without losing Add Client values", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();

  await page.getByRole("button", { name: "Add client" }).click();
  await page.getByRole("textbox", { name: "Organization name" }).fill("Another Northstar");
  await page.getByRole("textbox", { name: "Contact name" }).fill("Jamie Chen");
  const contactEmail = page.getByRole("textbox", { name: "Contact email" });
  await contactEmail.fill("JAMIE.CHEN@NORTHSTAR.EXAMPLE");
  await page.getByRole("textbox", { name: "Notes" }).fill("Preserve this note.");
  await page.getByRole("button", { name: "Save client" }).click();

  await expect(contactEmail).toBeFocused();
  await expect(contactEmail).toHaveValue("JAMIE.CHEN@NORTHSTAR.EXAMPLE");
  await expect(contactEmail).toHaveAccessibleDescription(
    "A client with this contact email already exists.",
  );
  await expect(page.getByRole("textbox", { name: "Notes" })).toHaveValue("Preserve this note.");
  await expect(page.getByRole("dialog", { name: "Add client" })).toBeVisible();
  await expect(page.getByText("Client added", { exact: true })).toBeHidden();
});

test("recovers from a server failure through the persistent Add Client alert", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();
  await page.goto("/clients?demoCreateState=error-once");
  await expect(page.getByRole("cell", { exact: true, name: "Northstar Studio" })).toBeVisible();

  await page.getByRole("button", { name: "Add client" }).click();
  await page.getByRole("textbox", { name: "Organization name" }).fill("Recovery Studio");
  await page.getByRole("textbox", { name: "Contact name" }).fill("Robin Stone");
  await page.getByRole("textbox", { name: "Contact email" }).fill("robin@recovery.example");
  const saveClient = page.getByRole("button", { name: "Save client" });
  await saveClient.click();

  const failure = page.getByRole("alert").filter({ hasText: "Client could not be saved" });
  await expect(failure).toContainText("The client could not be saved. Try again.");
  await expect(saveClient).toBeFocused();
  await expect(page.getByRole("textbox", { name: "Organization name" })).toHaveValue(
    "Recovery Studio",
  );

  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("dialog", { name: "Add client" })).toBeHidden();
  await expect(page.getByRole("cell", { exact: true, name: "Recovery Studio" })).toBeVisible();
  await expect(page.getByText("Client added", { exact: true })).toBeVisible();
});

test("blocks duplicate actions and every dismissal while Add Client is pending", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue as demo manager" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();
  await page.goto("/clients?demoCreateState=slow");
  await expect(page.getByRole("cell", { exact: true, name: "Northstar Studio" })).toBeVisible();

  await page.getByRole("button", { name: "Add client" }).click();
  await page.getByRole("textbox", { name: "Organization name" }).fill("Patient Studio");
  await page.getByRole("textbox", { name: "Contact name" }).fill("Pat Quinn");
  await page.getByRole("textbox", { name: "Contact email" }).fill("pat@patient.example");
  await page.getByRole("button", { name: "Save client" }).click();

  const dialog = page.getByRole("dialog", { name: "Add client" });
  await expect(dialog.locator("form")).toHaveAttribute("aria-busy", "true");
  await expect(page.getByRole("button", { name: "Saving client" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await expect(page.getByRole("button", { name: "Saving client" })).toBeFocused();
  await expect(page.getByRole("textbox", { name: "Organization name" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Cancel" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Close" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();

  await expect(dialog).toBeHidden();
  await expect(page.getByRole("cell", { exact: true, name: "Patient Studio" })).toHaveCount(1);
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

  const longOrganizationName = "A".repeat(100);
  const longContactName = "B".repeat(100);
  const longEmail = `${"contact".repeat(8)}@${"client".repeat(8)}.example`;
  await page.getByRole("textbox", { name: "Organization name" }).fill(longOrganizationName);
  await page.getByRole("textbox", { name: "Contact name" }).fill(longContactName);
  await page.getByRole("textbox", { name: "Contact email" }).fill(longEmail);
  await expect(page.getByRole("textbox", { name: "Organization name" })).toHaveValue(
    longOrganizationName,
  );
  await expect(page.getByRole("textbox", { name: "Contact name" })).toHaveValue(longContactName);
  await expect(page.getByRole("textbox", { name: "Contact email" })).toHaveValue(longEmail);

  for (const target of [
    page.getByRole("button", { name: "Close" }),
    page.getByRole("button", { name: "Cancel" }),
    page.getByRole("button", { name: "Save client" }),
  ]) {
    const box = await target.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }

  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(
    true,
  );
  await expect(dialog).toHaveCSS("transition-duration", "0s");

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBe(dimensions.viewportWidth);
  const scan = await makeAxeBuilder().exclude("[data-base-ui-focus-guard]").analyze();
  expect(scan.violations).toEqual([]);
});

test("keeps Add Client usable at 200% zoom and with touch input", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    baseURL: String(testInfo.project.use.baseURL),
    colorScheme: "light",
    hasTouch: true,
    locale: "en-US",
    reducedMotion: "reduce",
    timezoneId: "UTC",
    viewport: { width: 640, height: 800 },
  });
  const touchPage = await context.newPage();

  await touchPage.goto("/sign-in");
  await touchPage.getByRole("button", { name: "Continue as demo manager" }).tap();
  await expect(touchPage.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();

  await touchPage.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  await touchPage.getByRole("button", { name: "Add client" }).tap();

  const dialog = touchPage.getByRole("dialog", { name: "Add client" });
  const organizationName = touchPage.getByRole("textbox", { name: "Organization name" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toBeFocused();
  await expect(organizationName).not.toBeFocused();

  const dimensions = await touchPage.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBe(dimensions.viewportWidth);

  await touchPage.getByRole("button", { name: "Close" }).tap();
  await expect(dialog).toBeHidden();
  await expect(touchPage.getByRole("button", { name: "Add client" })).toBeFocused();
  await context.close();
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

for (const { brand, colorScheme, density } of resolvedThemeContexts) {
  test(`keeps Add Client keyboard recovery stable in ${brand} ${colorScheme} ${density}`, async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await page.getByRole("button", { name: "Continue as demo manager" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Clients" })).toBeVisible();
    await page.locator("html").evaluate(
      (element, theme) => {
        element.dataset.brand = theme.brand;
        element.dataset.colorScheme = theme.colorScheme;
        element.dataset.density = theme.density;
      },
      { brand, colorScheme, density },
    );

    const addClient = page.getByRole("button", { name: "Add client" });
    await addClient.focus();
    await page.keyboard.press("Enter");
    const organizationName = page.getByRole("textbox", { name: "Organization name" });
    await organizationName.fill("Theme Matrix Studio");
    await organizationName.focus();
    await page.keyboard.press("Escape");

    const confirmation = page.getByRole("alertdialog", { name: "Discard changes?" });
    await expect(confirmation).toBeVisible();
    await expect(page.getByRole("button", { name: "Keep editing" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(confirmation).toBeHidden();
    await expect(organizationName).toBeFocused();
    await expect(organizationName).toHaveValue("Theme Matrix Studio");

    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Discard changes" }).click();
    await expect(addClient).toBeFocused();
  });
}
