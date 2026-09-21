import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { AnchorHTMLAttributes, HTMLAttributes } from "react";

import { headingId } from "./lib/heading-id";

function DocumentationHeading({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const label = typeof children === "string" ? children : "";
  return (
    <h2 id={headingId(label)} {...props}>
      <a aria-hidden="true" data-docs="heading-anchor" href={`#${headingId(label)}`} tabIndex={-1}>
        #
      </a>
      {children}
    </h2>
  );
}

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
  h2: DocumentationHeading,
} satisfies MDXComponents;

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...defaultComponents, ...components };
}
