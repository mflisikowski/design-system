import { type ComponentType, createElement, type HTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DocumentationH2, DocumentationH3 } from "./documentation-heading";

describe("documentation MDX headings", () => {
  it.each([
    ["h2", "API", "api"],
    ["h3", "New project", "new-project"],
  ] as const)("renders %s with a stable fragment target", (element, label, id) => {
    const Heading = (element === "h2" ? DocumentationH2 : DocumentationH3) as ComponentType<
      HTMLAttributes<HTMLHeadingElement>
    >;
    const markup = renderToStaticMarkup(createElement(Heading, null, label));

    expect(markup).toContain(`id="${id}"`);
    expect(markup).toContain(`href="#${id}"`);
  });
});
