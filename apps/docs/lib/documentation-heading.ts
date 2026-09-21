import { createElement, type HTMLAttributes } from "react";

import { headingId } from "./heading-id";

type DocumentationHeadingProps = HTMLAttributes<HTMLHeadingElement> & Readonly<{ level: 2 | 3 }>;

function DocumentationHeading({ children, level, ...props }: DocumentationHeadingProps) {
  const label = typeof children === "string" ? children : "";
  const id = headingId(label);
  return createElement(
    level === 2 ? "h2" : "h3",
    { id, ...props },
    createElement(
      "a",
      {
        "aria-hidden": "true",
        "data-docs": "heading-anchor",
        href: `#${id}`,
        tabIndex: -1,
      },
      "#",
    ),
    children,
  );
}

export function DocumentationH2(props: HTMLAttributes<HTMLHeadingElement>) {
  return createElement(DocumentationHeading, { level: 2, ...props });
}

export function DocumentationH3(props: HTMLAttributes<HTMLHeadingElement>) {
  return createElement(DocumentationHeading, { level: 3, ...props });
}
