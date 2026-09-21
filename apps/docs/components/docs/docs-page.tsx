import Link from "next/link";

import type { DocumentationPage as DocumentationPageEntry } from "@/lib/content";

import { DocsShell } from "./docs-shell";

function Breadcrumb({ page }: Readonly<{ page: DocumentationPageEntry }>) {
  if (!page.slug.includes("/")) {
    return null;
  }

  const parentHref = `/${page.slug.split("/")[0]}`;

  return (
    <nav aria-label="Breadcrumb" data-docs="breadcrumb">
      <ol>
        <li>
          <Link href={parentHref}>{page.section}</Link>
        </li>
        <li aria-current="page">{page.title}</li>
      </ol>
    </nav>
  );
}

export async function DocumentationPage({ page }: Readonly<{ page: DocumentationPageEntry }>) {
  const { default: Content } = await page.load();

  return (
    <DocsShell currentPage={page}>
      <article data-docs="content">
        <Breadcrumb page={page} />
        <header data-docs="page-header">
          <div data-docs="page-header-section">{page.section}</div>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
        </header>
        <Content />
      </article>
    </DocsShell>
  );
}
