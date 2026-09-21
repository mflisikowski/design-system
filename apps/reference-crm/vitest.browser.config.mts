import path from "node:path";
import { fileURLToPath } from "node:url";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const appDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  optimizeDeps: {
    include: [
      "@base-ui/react/alert-dialog",
      "lucide-react",
      "react",
      "react-dom/client",
      "react/jsx-dev-runtime",
      "react/jsx-runtime",
      "vitest-browser-react",
    ],
  },
  resolve: {
    alias: {
      "@": appDirectory,
    },
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
