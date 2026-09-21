import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocumentationPage } from "@/components/docs/docs-page";
import { documentationPages, getDocumentationPage } from "@/lib/content";

type DocumentationRouteProps = Readonly<{
  params: Promise<{ slug: string[] }>;
}>;

export const dynamicParams = false;

export function generateStaticParams() {
  return documentationPages
    .filter((page) => page.slug.length > 0)
    .map((page) => ({ slug: page.slug.split("/") }));
}

export async function generateMetadata({ params }: DocumentationRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getDocumentationPage(slug.join("/"));

  if (!page) {
    return {};
  }

  return {
    title: page.title,
    description: page.description,
  };
}

export default async function DocumentationRoute({ params }: DocumentationRouteProps) {
  const { slug } = await params;
  const page = getDocumentationPage(slug.join("/"));

  if (!page) {
    notFound();
  }

  return <DocumentationPage page={page} />;
}
