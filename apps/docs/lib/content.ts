import type { ComponentType } from "react";

export type DocumentationDestination = Readonly<{
  label: string;
  href: string;
  external?: boolean;
}>;

export type DocumentationHeading = Readonly<{
  depth: 2 | 3;
  id: string;
  label: string;
}>;

type MdxModule = Readonly<{
  default: ComponentType;
}>;

export type DocumentationPage = Readonly<{
  slug: string;
  href: string;
  source: string;
  title: string;
  description: string;
  section: string;
  headings: readonly DocumentationHeading[];
  load: () => Promise<MdxModule>;
}>;

const referenceCrmUrl =
  process.env.NEXT_PUBLIC_REFERENCE_CRM_URL ?? "https://crm.design-system.mflisikowski.dev";

export const primaryNavigation = [
  { label: "Foundations", href: "/foundations" },
  { label: "Components", href: "/components" },
  { label: "Patterns", href: "/patterns" },
  { label: "Themes", href: "/themes" },
  { label: "Changelog", href: "/changelog" },
  { label: "Reference CRM", href: referenceCrmUrl, external: true },
] as const satisfies readonly DocumentationDestination[];

export const documentationPages = [
  {
    slug: "",
    href: "/",
    source: "introduction.mdx",
    title: "Build consistent product interfaces",
    description:
      "MFD Design System is the shared contract for accessible, white-label React applications.",
    section: "Introduction",
    headings: [
      { depth: 2, id: "principles", label: "Principles" },
      { depth: 2, id: "sources-of-truth", label: "Sources of truth" },
      { depth: 2, id: "start-exploring", label: "Start exploring" },
    ],
    load: () => import("../content/introduction.mdx"),
  },
  {
    slug: "foundations",
    href: "/foundations",
    source: "foundations.mdx",
    title: "Foundations",
    description:
      "The token, typography, spacing, motion, and accessibility contracts below every component.",
    section: "Foundations",
    headings: [
      { depth: 2, id: "token-architecture", label: "Token architecture" },
      { depth: 2, id: "independent-theme-axes", label: "Independent theme axes" },
      { depth: 2, id: "current-status", label: "Current status" },
    ],
    load: () => import("../content/foundations.mdx"),
  },
  {
    slug: "components",
    href: "/components",
    source: "components.mdx",
    title: "Components",
    description:
      "MFD-owned APIs and behavior, distributed as editable source through the registry.",
    section: "Components",
    headings: [
      { depth: 2, id: "ownership", label: "Ownership" },
      { depth: 2, id: "documentation-contract", label: "Documentation contract" },
      { depth: 2, id: "available-components", label: "Available components" },
    ],
    load: () => import("../content/components.mdx"),
  },
  {
    slug: "components/registry-sample",
    href: "/components/registry-sample",
    source: "components/registry-sample.mdx",
    title: "Registry Sample",
    description:
      "The canonical distribution proof for an MFD registry component and its dependencies.",
    section: "Components",
    headings: [
      { depth: 2, id: "preview", label: "Preview" },
      { depth: 2, id: "installation", label: "Installation" },
      { depth: 2, id: "api", label: "API" },
      { depth: 2, id: "accessibility", label: "Accessibility" },
      { depth: 2, id: "keyboard-behavior", label: "Keyboard behavior" },
    ],
    load: () => import("../content/components/registry-sample.mdx"),
  },
  {
    slug: "patterns",
    href: "/patterns",
    source: "patterns.mdx",
    title: "Patterns",
    description:
      "Validated compositions that solve recurring product tasks without hiding domain behavior.",
    section: "Patterns",
    headings: [
      { depth: 2, id: "validated-flows", label: "Validated flows" },
      { depth: 2, id: "composition-boundary", label: "Composition boundary" },
      { depth: 2, id: "planned-patterns", label: "Planned patterns" },
    ],
    load: () => import("../content/patterns.mdx"),
  },
  {
    slug: "themes",
    href: "/themes",
    source: "themes.mdx",
    title: "Themes",
    description:
      "Brand, color scheme, and density remain independent across every supported interface.",
    section: "Themes",
    headings: [
      { depth: 2, id: "independent-axes", label: "Independent axes" },
      { depth: 2, id: "supported-contexts", label: "Supported contexts" },
      { depth: 2, id: "production-boundary", label: "Production boundary" },
    ],
    load: () => import("../content/themes.mdx"),
  },
  {
    slug: "changelog",
    href: "/changelog",
    source: "changelog.mdx",
    title: "Changelog",
    description:
      "Release notes, migration guidance, and explicit maturity transitions for public contracts.",
    section: "Changelog",
    headings: [
      { depth: 2, id: "unreleased", label: "Unreleased" },
      { depth: 2, id: "release-model", label: "Release model" },
      { depth: 2, id: "maturity-transitions", label: "Maturity transitions" },
    ],
    load: () => import("../content/changelog.mdx"),
  },
] as const satisfies readonly DocumentationPage[];

export function getDocumentationPage(slug: string) {
  return documentationPages.find((page) => page.slug === slug);
}
