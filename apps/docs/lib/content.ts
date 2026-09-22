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

const publicComponentHeadings = [
  { depth: 2, id: "installation", label: "Installation" },
  { depth: 2, id: "purpose", label: "Purpose" },
  { depth: 2, id: "examples", label: "Examples" },
  { depth: 2, id: "anatomy", label: "Anatomy" },
  { depth: 2, id: "api", label: "API" },
  { depth: 2, id: "states", label: "States" },
  { depth: 2, id: "accessibility", label: "Accessibility" },
  { depth: 2, id: "keyboard-behavior", label: "Keyboard behavior" },
  { depth: 2, id: "figma-specification", label: "Figma specification" },
  { depth: 2, id: "content-guidance", label: "Content guidance" },
  { depth: 2, id: "related-patterns", label: "Related patterns" },
] as const satisfies readonly DocumentationHeading[];

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
      { depth: 2, id: "installation", label: "Installation" },
      { depth: 2, id: "purpose", label: "Purpose" },
      { depth: 2, id: "examples", label: "Examples" },
      { depth: 2, id: "anatomy", label: "Anatomy" },
      { depth: 2, id: "api", label: "API" },
      { depth: 2, id: "states", label: "States" },
      { depth: 2, id: "accessibility", label: "Accessibility" },
      { depth: 2, id: "keyboard-behavior", label: "Keyboard behavior" },
      { depth: 2, id: "content-guidance", label: "Content guidance" },
      { depth: 2, id: "related-patterns", label: "Related patterns" },
    ],
    load: () => import("../content/components/registry-sample.mdx"),
  },
  {
    slug: "components/button",
    href: "/components/button",
    source: "components/button.mdx",
    title: "Button",
    description:
      "Action control with explicit variants, density-aware sizes, and loading behavior.",
    section: "Components",
    headings: publicComponentHeadings,
    load: () => import("../content/components/button.mdx"),
  },
  {
    slug: "components/icon",
    href: "/components/icon",
    source: "components/icon.mdx",
    title: "Icon and Icon Button",
    description: "Approved iconography and contextual icon-only actions.",
    section: "Components",
    headings: publicComponentHeadings,
    load: () => import("../content/components/icon.mdx"),
  },
  {
    slug: "components/link",
    href: "/components/link",
    source: "components/link.mdx",
    title: "Link",
    description: "Native inline and standalone navigation with visible focus behavior.",
    section: "Components",
    headings: publicComponentHeadings,
    load: () => import("../content/components/link.mdx"),
  },
  {
    slug: "components/breadcrumb",
    href: "/components/breadcrumb",
    source: "components/breadcrumb.mdx",
    title: "Breadcrumb",
    description: "Ordered location hierarchy with an explicit current item.",
    section: "Components",
    headings: publicComponentHeadings,
    load: () => import("../content/components/breadcrumb.mdx"),
  },
  {
    slug: "components/page-header",
    href: "/components/page-header",
    source: "components/page-header.mdx",
    title: "Page Header",
    description: "Structural page title with breadcrumb, description, and responsive actions.",
    section: "Components",
    headings: publicComponentHeadings,
    load: () => import("../content/components/page-header.mdx"),
  },
  {
    slug: "components/alert",
    href: "/components/alert",
    source: "components/alert.mdx",
    title: "Alert",
    description: "Persistent recovery feedback with deliberate live-region semantics.",
    section: "Components",
    headings: publicComponentHeadings,
    load: () => import("../content/components/alert.mdx"),
  },
  {
    slug: "components/badge",
    href: "/components/badge",
    source: "components/badge.mdx",
    title: "Badge",
    description: "Non-interactive status label with semantic tones.",
    section: "Components",
    headings: publicComponentHeadings,
    load: () => import("../content/components/badge.mdx"),
  },
  {
    slug: "components/empty-state",
    href: "/components/empty-state",
    source: "components/empty-state.mdx",
    title: "Empty State",
    description: "A compositional explanation and next step for absent content.",
    section: "Components",
    headings: publicComponentHeadings,
    load: () => import("../content/components/empty-state.mdx"),
  },
  {
    slug: "components/table",
    href: "/components/table",
    source: "components/table.mdx",
    title: "Table",
    description: "Native semantic table primitives for ordinary product data.",
    section: "Components",
    headings: publicComponentHeadings,
    load: () => import("../content/components/table.mdx"),
  },
  {
    slug: "components/field",
    href: "/components/field",
    source: "components/field.mdx",
    title: "Field",
    description: "Accessible labels, descriptions, errors, and control relationships.",
    section: "Components",
    headings: publicComponentHeadings,
    load: () => import("../content/components/field.mdx"),
  },
  {
    slug: "components/input",
    href: "/components/input",
    source: "components/input.mdx",
    title: "Input",
    description: "Density-aware native single-line form control.",
    section: "Components",
    headings: publicComponentHeadings,
    load: () => import("../content/components/input.mdx"),
  },
  {
    slug: "components/textarea",
    href: "/components/textarea",
    source: "components/textarea.mdx",
    title: "Textarea",
    description: "Density-aware native multiline form control.",
    section: "Components",
    headings: publicComponentHeadings,
    load: () => import("../content/components/textarea.mdx"),
  },
  {
    slug: "components/dialog",
    href: "/components/dialog",
    source: "components/dialog.mdx",
    title: "Dialog",
    description: "Modal composition with responsive full-screen presentation.",
    section: "Components",
    headings: publicComponentHeadings,
    load: () => import("../content/components/dialog.mdx"),
  },
  {
    slug: "components/alert-dialog",
    href: "/components/alert-dialog",
    source: "components/alert-dialog.mdx",
    title: "Alert Dialog",
    description: "Consequential confirmation with safe focus and pending protection.",
    section: "Components",
    headings: publicComponentHeadings,
    load: () => import("../content/components/alert-dialog.mdx"),
  },
  {
    slug: "components/toast",
    href: "/components/toast",
    source: "components/toast.mdx",
    title: "Toast",
    description: "Polite, brief acknowledgement through the MFD feedback adapter.",
    section: "Components",
    headings: publicComponentHeadings,
    load: () => import("../content/components/toast.mdx"),
  },
  {
    slug: "components/select",
    href: "/components/select",
    source: "components/select.mdx",
    title: "Select",
    description: "Keyboard-accessible single-value selection with pending behavior.",
    section: "Components",
    headings: publicComponentHeadings,
    load: () => import("../content/components/select.mdx"),
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
      { depth: 2, id: "010-add-client", label: "0.1.0 — Add Client" },
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
