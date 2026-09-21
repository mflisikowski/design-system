import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { documentationPages } from "./content";
import { headingId } from "./heading-id";

type ValidationPage = Readonly<{
  slug: string;
  href: string;
  source: string;
  headings: readonly Readonly<{ depth: 2 | 3; id: string; label: string }>[];
}>;

type DocumentationSnapshot = Readonly<{
  pages: readonly ValidationPage[];
  files: Readonly<Record<string, string>>;
}>;

function readMdxFiles(directory: string, root = directory): Record<string, string> {
  if (!existsSync(directory)) {
    return {};
  }

  const files: Record<string, string> = {};
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      Object.assign(files, readMdxFiles(entryPath, root));
    } else if (entry.name.endsWith(".mdx")) {
      const source = relative(root, entryPath).split(sep).join("/");
      files[source] = readFileSync(entryPath, "utf8");
    }
  }
  return files;
}

export function validateDocumentation() {
  const moduleDirectory = dirname(fileURLToPath(import.meta.url));
  const contentDirectory = join(moduleDirectory, "../content");
  return validateDocumentationSnapshot({
    pages: documentationPages,
    files: readMdxFiles(contentDirectory),
  });
}

export function validateDocumentationSnapshot({ pages, files }: DocumentationSnapshot) {
  const issues: string[] = [];
  const slugs = new Set<string>();
  const manifestSources = new Set(pages.map((page) => page.source));
  const manifestPagesByRoute = new Map(pages.map((page) => [page.href, page]));

  for (const page of pages) {
    if (
      page.slug !== "" &&
      !/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(page.slug)
    ) {
      issues.push(`Invalid documentation slug: ${page.slug}`);
    }

    const expectedHref = page.slug === "" ? "/" : `/${page.slug}`;
    if (page.href !== expectedHref) {
      issues.push(
        `Documentation href does not match slug ${page.slug}: expected ${expectedHref}, received ${page.href}`,
      );
    }

    if (slugs.has(page.slug)) {
      issues.push(`Duplicate documentation slug: ${page.slug}`);
    }
    slugs.add(page.slug);

    if (!(page.source in files)) {
      issues.push(`Missing manifest target: ${page.source}`);
    }
  }

  for (const source of Object.keys(files).sort()) {
    if (!manifestSources.has(source)) {
      issues.push(`Unlisted documentation file: ${source}`);
    }

    const sourcePage = pages.find((page) => page.source === source);
    const internalLinkPattern = /(?:\]\(|href=["'])([^)"'\s]+)/g;
    for (const match of files[source]?.matchAll(internalLinkPattern) ?? []) {
      const href = match[1];
      if (!href || /^(?:[a-z]+:|\/\/)/i.test(href)) {
        continue;
      }

      const resolved = new URL(href, `https://docs.example${sourcePage?.href ?? "/"}`);
      const targetPage = manifestPagesByRoute.get(resolved.pathname);
      const fragment = decodeURIComponent(resolved.hash.slice(1));
      const fragmentExists =
        fragment === "" || targetPage?.headings.some((heading) => heading.id === fragment);

      if (!targetPage || !fragmentExists) {
        issues.push(`Broken internal link in ${source}: ${href}`);
      }
    }

    let previousDepth = 1;
    const authoredHeadings: { depth: number; id: string; label: string }[] = [];
    const lines = files[source]?.split("\n") ?? [];
    for (const [index, line] of lines.entries()) {
      const headingMatch = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
      if (!headingMatch) {
        continue;
      }

      const depth = headingMatch[1]?.length ?? 1;
      const label = headingMatch[2]?.replace(/[`*_]/g, "").trim() ?? "";
      authoredHeadings.push({ depth, id: headingId(label), label });
      if (depth - previousDepth > 1) {
        issues.push(
          `Invalid heading hierarchy in ${source} at line ${index + 1}: h${previousDepth} to h${depth}`,
        );
      }
      previousDepth = depth;
    }

    const manifestPage = pages.find((page) => page.source === source);
    if (
      manifestPage &&
      JSON.stringify(authoredHeadings) !== JSON.stringify(manifestPage.headings)
    ) {
      issues.push(`Manifest headings do not match ${source}`);
    }
  }

  return issues;
}
