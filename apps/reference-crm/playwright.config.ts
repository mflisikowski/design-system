import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:3001";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
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
          command: "node node_modules/next/dist/bin/next start --hostname localhost --port 3001",
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
