import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { persistThemePreference, persistThemePreferences } from "@/app/actions/theme";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "@mflisikowski/tokens/css";
import { getThemePreferencesFromCookies, themePreferenceCookies } from "@/lib/theme-preferences";

import "./globals.css";

export const metadata: Metadata = {
  title: "MFD Reference CRM",
  description: "Reference application for MFD Design System.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = await cookies();
  const themePreferences = getThemePreferencesFromCookies({
    [themePreferenceCookies.brand]: cookieStore.get(themePreferenceCookies.brand)?.value,
    [themePreferenceCookies.colorScheme]: cookieStore.get(themePreferenceCookies.colorScheme)
      ?.value,
    [themePreferenceCookies.density]: cookieStore.get(themePreferenceCookies.density)?.value,
  });

  return (
    <html
      lang="en"
      data-brand={themePreferences.brand}
      data-color-scheme={themePreferences.colorScheme}
      data-density={themePreferences.density}
    >
      <body>
        <ThemeProvider
          initialPreferences={themePreferences}
          persistPreference={persistThemePreference}
          persistPreferences={persistThemePreferences}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
