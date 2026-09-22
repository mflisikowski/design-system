"use server";

import { cookies } from "next/headers";

import { shouldUseSecureCookies } from "@/lib/cookie-security";
import {
  getThemeCookieName,
  isThemePreferenceAxis,
  isThemePreferenceValue,
  type ThemePreferences,
} from "@/lib/theme-preferences";

function cookieOptions() {
  return {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax" as const,
    secure: shouldUseSecureCookies(),
  };
}

export async function persistThemePreference(axis: string, value: string) {
  if (!isThemePreferenceAxis(axis) || !isThemePreferenceValue(axis, value)) {
    throw new Error("The theme preference is invalid.");
  }

  const cookieStore = await cookies();
  cookieStore.set(getThemeCookieName(axis), value, cookieOptions());
}

export async function persistThemePreferences(preferences: ThemePreferences) {
  const cookieStore = await cookies();

  const axes = ["brand", "colorScheme", "density"] as const;
  for (const axis of axes) {
    const value = preferences[axis];
    if (!isThemePreferenceValue(axis, value)) {
      throw new Error("The theme preferences are invalid.");
    }
  }
  for (const axis of axes) {
    const value = preferences[axis];
    cookieStore.set(getThemeCookieName(axis), value, cookieOptions());
  }
}

export type PersistThemePreference = (
  axis: keyof ThemePreferences,
  value: ThemePreferences[keyof ThemePreferences],
) => Promise<void>;

export type PersistThemePreferences = (preferences: ThemePreferences) => Promise<void>;
