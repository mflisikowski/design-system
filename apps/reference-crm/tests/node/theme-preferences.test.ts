import { describe, expect, it } from "vitest";

import {
  defaultThemePreferences,
  getThemePreferencesFromCookies,
  themePreferenceCookies,
} from "@/lib/theme-preferences";

describe("theme preference cookie boundary", () => {
  it("falls back independently when cookie values are absent or invalid", () => {
    expect(
      getThemePreferencesFromCookies({
        [themePreferenceCookies.brand]: "not-a-brand",
        [themePreferenceCookies.colorScheme]: "dark",
      }),
    ).toEqual({
      brand: defaultThemePreferences.brand,
      colorScheme: "dark",
      density: defaultThemePreferences.density,
    });
  });

  it("preserves every validated axis before hydration", () => {
    expect(
      getThemePreferencesFromCookies({
        [themePreferenceCookies.brand]: "bloom",
        [themePreferenceCookies.colorScheme]: "system",
        [themePreferenceCookies.density]: "compact",
      }),
    ).toEqual({ brand: "bloom", colorScheme: "system", density: "compact" });
  });
});
