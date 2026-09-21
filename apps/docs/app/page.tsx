import { notFound } from "next/navigation";

import { DocumentationPage } from "@/components/docs/docs-page";
import { getDocumentationPage } from "@/lib/content";

export default function HomePage() {
  const page = getDocumentationPage("");
  if (!page) {
    notFound();
  }

  return <DocumentationPage page={page} />;
}
