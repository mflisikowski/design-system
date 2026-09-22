import {
  type ColorSchemePreference,
  type ThemeBrand,
  type ThemeDensity,
  type ThemePreferences,
  themeDefaults,
} from "@mflisikowski/tokens/runtime";

export const themePreferenceCookies = {
  brand: "mfd-demo-brand",
  colorScheme: "mfd-color-scheme",
  density: "mfd-density",
} as const;

export const defaultThemePreferences: ThemePreferences = themeDefaults;

const brands = new Set<ThemeBrand>(["atlas", "bloom"]);
const colorSchemes = new Set<ColorSchemePreference>(["system", "light", "dark"]);
const densities = new Set<ThemeDensity>(["comfortable", "compact"]);

function valueOrDefault<T extends string>(
  value: string | undefined,
  values: ReadonlySet<T>,
  fallback: T,
): T {
  return value && values.has(value as T) ? (value as T) : fallback;
}

export function getThemePreferencesFromCookies(
  values: Readonly<Record<string, string | undefined>>,
): ThemePreferences {
  return {
    brand: valueOrDefault(
      values[themePreferenceCookies.brand],
      brands,
      defaultThemePreferences.brand,
    ),
    colorScheme: valueOrDefault(
      values[themePreferenceCookies.colorScheme],
      colorSchemes,
      defaultThemePreferences.colorScheme,
    ),
    density: valueOrDefault(
      values[themePreferenceCookies.density],
      densities,
      defaultThemePreferences.density,
    ),
  };
}

export function isThemePreferenceAxis(value: string): value is keyof ThemePreferences {
  return value === "brand" || value === "colorScheme" || value === "density";
}

export function isThemePreferenceValue(
  axis: keyof ThemePreferences,
  value: string,
): value is ThemePreferences[typeof axis] {
  if (axis === "brand") {
    return brands.has(value as ThemeBrand);
  }
  if (axis === "colorScheme") {
    return colorSchemes.has(value as ColorSchemePreference);
  }
  return densities.has(value as ThemeDensity);
}

export function getThemeCookieName(axis: keyof ThemePreferences) {
  return themePreferenceCookies[axis];
}

export type { ColorSchemePreference, ThemeBrand, ThemeDensity, ThemePreferences };
