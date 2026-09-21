import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

import { DocumentationH2, DocumentationH3 } from "./lib/documentation-heading";

function DocumentationLink({
  children,
  href = "",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

const defaultComponents = {
  a: DocumentationLink,
  h2: DocumentationH2,
  h3: DocumentationH3,
} satisfies MDXComponents;

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...defaultComponents, ...components };
}
