import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@mflisikowski/tokens/css";
import { themeDefaults } from "@mflisikowski/tokens/runtime";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://design-system.mflisikowski.dev"),
  title: {
    default: "MFD Design System",
    template: "%s · MFD Design System",
  },
  description: "Documentation and registry for MFD Design System.",
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
