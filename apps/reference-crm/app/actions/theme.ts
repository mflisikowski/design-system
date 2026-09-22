"use server";

import { cookies } from "next/headers";

import {
  getThemeCookieName,
  isThemePreferenceAxis,
  isThemePreferenceValue,
  type ThemePreferences,
} from "@/lib/theme-preferences";

export async function persistThemePreference(axis: string, value: string) {
  if (!isThemePreferenceAxis(axis) || !isThemePreferenceValue(axis, value)) {
    throw new Error("The theme preference is invalid.");
  }

  const cookieStore = await cookies();
  cookieStore.set(getThemeCookieName(axis), value, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export type PersistThemePreference = (
  axis: keyof ThemePreferences,
  value: ThemePreferences[keyof ThemePreferences],
) => Promise<void>;
