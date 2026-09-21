import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  optimizeDeps: {
    include: ["react", "react-dom/client", "react/jsx-dev-runtime", "react/jsx-runtime"],
  },
  oxc: {
    jsx: {
      runtime: "automatic",
    },
  },
  test: {
    api: {
      host: "127.0.0.1",
      strictPort: true,
    },
    include: ["tests/browser/**/*.browser.test.tsx"],
    setupFiles: ["./tests/browser/setup.ts"],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }, { browser: "firefox" }, { browser: "webkit" }],
    },
  },
});
