import Link from "next/link";
import type { ReactNode } from "react";

import {
  type DocumentationHeading,
  type DocumentationPage,
  primaryNavigation,
} from "@/lib/content";

function NavigationLinks({ currentPage }: Readonly<{ currentPage: DocumentationPage }>) {
  return (
    <ul data-docs="navigation-list">
      {primaryNavigation.map((destination) => {
        const isExternal = "external" in destination && destination.external;
        const isCurrent =
          !isExternal &&
          (currentPage.href === destination.href ||
            currentPage.href.startsWith(`${destination.href}/`));

        return (
          <li key={destination.label}>
            {isExternal ? (
              <a data-docs="navigation-link" href={destination.href}>
                <span>{destination.label}</span>
                <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <Link
                aria-current={isCurrent ? "page" : undefined}
                data-docs="navigation-link"
                href={destination.href}
              >
                {destination.label}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function TableOfContents({ headings }: Readonly<{ headings: readonly DocumentationHeading[] }>) {
  return (
    <nav aria-label="On this page" data-docs="table-of-contents">
      <div data-docs="table-of-contents-title">On this page</div>
      <ol>
        {headings.map((heading) => (
          <li data-depth={heading.depth} key={heading.id}>
            <a href={`#${heading.id}`}>{heading.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

type DocsShellProps = Readonly<{
  children: ReactNode;
  currentPage: DocumentationPage;
}>;

export function DocsShell({ children, currentPage }: DocsShellProps) {
  return (
    <>
      <a data-docs="skip-link" href="#main-content">
        Skip to content
      </a>
      <header data-docs="site-header">
        <Link data-docs="wordmark" href="/">
          <span aria-hidden="true" data-docs="wordmark-mark">
            M
          </span>
          <span>
            <strong>MFD</strong>
            <span>Design System</span>
          </span>
        </Link>
        <span data-docs="release-label">0.1.0 release documentation</span>
      </header>

      <details data-docs="mobile-navigation">
        <summary>Browse docs</summary>
        <nav aria-label="Mobile documentation">
          <NavigationLinks currentPage={currentPage} />
        </nav>
      </details>

      <div data-docs="layout">
        <aside data-docs="desktop-navigation">
          <nav aria-label="Documentation">
            <div data-docs="navigation-kicker">Documentation</div>
            <NavigationLinks currentPage={currentPage} />
          </nav>
        </aside>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <aside data-docs="toc-column">
          <TableOfContents headings={currentPage.headings} />
        </aside>
      </div>
    </>
  );
}
