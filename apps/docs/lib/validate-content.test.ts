import { describe, expect, it } from "vitest";

import { validateDocumentation, validateDocumentationSnapshot } from "./validate-content";

describe("documentation structure validation", () => {
  it("accepts the checked-in documentation sources", () => {
    expect(validateDocumentation()).toEqual([]);
  });

  it("rejects duplicate slugs", () => {
    const issues = validateDocumentationSnapshot({
      pages: [
        { slug: "foundations", href: "/foundations", source: "first.mdx", headings: [] },
        { slug: "foundations", href: "/foundations-copy", source: "second.mdx", headings: [] },
      ],
      files: {
        "first.mdx": "## First\n",
        "second.mdx": "## Second\n",
      },
    });

    expect(issues).toContain("Duplicate documentation slug: foundations");
  });

  it("rejects malformed slugs and hrefs that do not match them", () => {
    const issues = validateDocumentationSnapshot({
      pages: [
        {
          slug: "Bad Slug",
          href: "/different-path",
          source: "bad-slug.mdx",
          headings: [],
        },
      ],
      files: { "bad-slug.mdx": "" },
    });

    expect(issues).toContain("Invalid documentation slug: Bad Slug");
    expect(issues).toContain(
      "Documentation href does not match slug Bad Slug: expected /Bad Slug, received /different-path",
    );
  });

  it("rejects missing manifest targets and unlisted MDX files", () => {
    const issues = validateDocumentationSnapshot({
      pages: [{ slug: "foundations", href: "/foundations", source: "missing.mdx", headings: [] }],
      files: {
        "unlisted.mdx": "## Unlisted\n",
      },
    });

    expect(issues).toEqual([
      "Missing manifest target: missing.mdx",
      "Unlisted documentation file: unlisted.mdx",
    ]);
  });

  it("rejects internal links that do not resolve through the manifest", () => {
    const issues = validateDocumentationSnapshot({
      pages: [{ slug: "", href: "/", source: "introduction.mdx", headings: [] }],
      files: {
        "introduction.mdx": "See [the missing component](/components/missing).\n",
      },
    });

    expect(issues).toContain("Broken internal link in introduction.mdx: /components/missing");
  });

  it("rejects unresolved fragments in root-relative, relative, and same-page links", () => {
    const issues = validateDocumentationSnapshot({
      pages: [
        {
          slug: "components",
          href: "/components",
          source: "components.mdx",
          headings: [{ depth: 2, id: "available", label: "Available" }],
        },
        {
          slug: "components/registry-sample",
          href: "/components/registry-sample",
          source: "components/registry-sample.mdx",
          headings: [{ depth: 2, id: "api", label: "API" }],
        },
      ],
      files: {
        "components.mdx": [
          "## Available",
          "[Valid](/components/registry-sample#api)",
          "[Missing root fragment](/components/registry-sample#missing)",
          "[Missing relative fragment](components/registry-sample#missing)",
          "[Missing local fragment](#missing)",
        ].join("\n"),
        "components/registry-sample.mdx": "## API\n",
      },
    });

    expect(issues).toContain(
      "Broken internal link in components.mdx: /components/registry-sample#missing",
    );
    expect(issues).toContain(
      "Broken internal link in components.mdx: components/registry-sample#missing",
    );
    expect(issues).toContain("Broken internal link in components.mdx: #missing");
    expect(issues).not.toContain(
      "Broken internal link in components.mdx: /components/registry-sample#api",
    );
  });

  it("rejects heading levels that skip the documentation hierarchy", () => {
    const issues = validateDocumentationSnapshot({
      pages: [
        {
          slug: "foundations",
          href: "/foundations",
          source: "foundations.mdx",
          headings: [{ depth: 2, id: "overview", label: "Overview" }],
        },
      ],
      files: {
        "foundations.mdx": "## Overview\n\n#### Skipped level\n",
      },
    });

    expect(issues).toContain("Invalid heading hierarchy in foundations.mdx at line 3: h2 to h4");
  });

  it("keeps the local table of contents aligned with authored headings", () => {
    const issues = validateDocumentationSnapshot({
      pages: [
        {
          slug: "themes",
          href: "/themes",
          source: "themes.mdx",
          headings: [{ depth: 2, id: "manifest-heading", label: "Manifest heading" }],
        },
      ],
      files: {
        "themes.mdx": "## Authored heading\n",
      },
    });

    expect(issues).toContain("Manifest headings do not match themes.mdx");
  });
});
