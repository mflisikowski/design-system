import { describe, expect, it } from "vitest";

import { verifyCleanInstallFixtures } from "../scripts/verify-clean-install.mjs";

describe("registry clean installation", () => {
  it("installs the snapshot into new-project and existing-project fixtures", async () => {
    const results = await verifyCleanInstallFixtures();

    expect(results).toEqual([
      { fixture: "new-project", preservedExistingFile: false },
      { fixture: "existing-project", preservedExistingFile: true },
    ]);
  }, 120_000);
});
