import { useState } from "react";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { testHarnessPath } from "../msw/handlers";

function BrowserHarnessProbe() {
  const [status, setStatus] = useState("idle");

  async function exerciseBrowserBehavior() {
    const response = await fetch(testHarnessPath);
    const result = (await response.json()) as { status: string };
    setStatus(result.status);
  }

  return (
    <div>
      <button type="button" onClick={exerciseBrowserBehavior}>
        Exercise browser behavior
      </button>
      <output aria-live="polite">{status}</output>
    </div>
  );
}

test("observes component behavior through a real browser", async () => {
  render(<BrowserHarnessProbe />);

  await page.getByRole("button", { name: "Exercise browser behavior" }).click();

  await expect.element(page.getByRole("status")).toHaveTextContent("ready");
});
