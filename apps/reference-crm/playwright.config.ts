import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3001";

// WebKit does not retain Secure cookies on the HTTP loopback origin used by the local harness.
// The production deployment remains Secure; only this explicit HTTP test boundary is relaxed.
if (baseURL.startsWith("http://")) {
  process.env.MFD_E2E_INSECURE_HTTP_COOKIES = "1";
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  timeout: process.env.CI ? 60_000 : 30_000,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  updateSnapshots: "none",
  snapshotPathTemplate: "{testDir}/__screenshots__/linux-chromium/{testFilePath}/{arg}{ext}",
  use: {
    baseURL,
    colorScheme: "light",
    locale: "en-US",
    reducedMotion: "reduce",
    timezoneId: "UTC",
    trace: "retain-on-failure",
  },
  expect: {
    timeout: process.env.CI ? 15_000 : 5_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
    },
  },
  webServer:
    process.env.PLAYWRIGHT_NO_WEBSERVER === "1"
      ? undefined
      : {
          command: "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3001",
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          stdout: "pipe",
          stderr: "pipe",
          timeout: 120_000,
        },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
