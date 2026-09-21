import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  checkExceptionRepository,
  compareExceptionBaseline,
  inspectLintExceptions,
} from "../src/exceptions.mjs";

describe("MFD lint exceptions", () => {
  it("accepts one justified next-line suppression and reports it for counting", () => {
    const result = inspectLintExceptions(
      `// oxlint-disable-next-line shadcn/no-inline-styles -- MFD exception: Runtime token values drive this visual fixture.\n<div style={style} />;`,
      "fixture.tsx",
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.exceptions).toEqual([
      {
        file: "fixture.tsx",
        line: 1,
        reason: "Runtime token values drive this visual fixture.",
        rule: "shadcn/no-inline-styles",
      },
    ]);
  });

  it.each([
    [
      "file-wide suppression",
      "/* oxlint-disable shadcn/no-inline-styles -- MFD exception: Too broad. */",
      "Use oxlint-disable-next-line",
    ],
    [
      "multiple rules",
      "// oxlint-disable-next-line shadcn/no-inline-styles, shadcn/no-raw-colors -- MFD exception: Too broad.",
      "exactly one shadcn rule",
    ],
    ["missing reason", "// oxlint-disable-next-line shadcn/no-inline-styles", "inline reason"],
    [
      "generic reason",
      "// oxlint-disable-next-line shadcn/no-inline-styles -- MFD exception: needed",
      "specific reason",
    ],
  ])("rejects a %s", (_name, source, message) => {
    const result = inspectLintExceptions(source, "fixture.tsx");

    expect(result.exceptions).toEqual([]);
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0].message).toContain(message);
  });

  it("requires every counted exception to match the reviewed baseline", () => {
    const exception = {
      file: "app/fixture.tsx",
      line: 3,
      reason: "Runtime token values drive this visual fixture.",
      rule: "shadcn/no-inline-styles",
    };
    const baseline = [
      {
        count: 1,
        file: exception.file,
        reason: exception.reason,
        rule: exception.rule,
      },
    ];

    expect(compareExceptionBaseline([exception], baseline)).toEqual({
      diagnostics: [],
      total: 1,
    });
    expect(compareExceptionBaseline([exception, exception], baseline)).toMatchObject({
      diagnostics: [expect.objectContaining({ message: expect.stringContaining("unreviewed") })],
      total: 2,
    });
    expect(compareExceptionBaseline([], baseline)).toMatchObject({
      diagnostics: [expect.objectContaining({ message: expect.stringContaining("stale") })],
      total: 0,
    });
  });

  it("scans source files and rejects exception growth beyond the repository baseline", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "mfd-lint-exceptions-"));
    const reason = "Runtime token values drive this visual fixture.";

    try {
      await mkdir(path.join(root, "app"));
      await writeFile(
        path.join(root, "app/fixture.tsx"),
        `// oxlint-disable-next-line shadcn/no-inline-styles -- MFD exception: ${reason}\n<div style={style} />;`,
      );
      await writeFile(
        path.join(root, ".mfd-lint-exceptions.json"),
        `${JSON.stringify(
          {
            exceptions: [
              {
                count: 1,
                file: "app/fixture.tsx",
                reason,
                rule: "shadcn/no-inline-styles",
              },
            ],
          },
          null,
          2,
        )}\n`,
      );

      await expect(checkExceptionRepository(root)).resolves.toMatchObject({
        diagnostics: [],
        total: 1,
      });

      await writeFile(
        path.join(root, "app/extra.tsx"),
        `// oxlint-disable-next-line shadcn/no-inline-styles -- MFD exception: ${reason}\n<div style={style} />;`,
      );
      await expect(checkExceptionRepository(root)).resolves.toMatchObject({
        diagnostics: [expect.objectContaining({ message: expect.stringContaining("unreviewed") })],
        total: 2,
      });
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });
});
