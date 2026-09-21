import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@mflisikowski/tokens/css";
import { themeDefaults } from "@mflisikowski/tokens/runtime";

import "./globals.css";

export const metadata: Metadata = {
  title: "MFD Reference CRM",
  description: "Reference application for MFD Design System.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      data-brand={themeDefaults.brand}
      data-color-scheme={themeDefaults.colorScheme}
      data-density={themeDefaults.density}
    >
      <body>{children}</body>
    </html>
  );
}
