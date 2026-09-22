"use client";

import type {
  ColorSchemePreference,
  ThemeBrand,
  ThemeDensity,
  ThemePreferences,
} from "@mflisikowski/tokens/runtime";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState } from "react";

import type { PersistThemePreference } from "@/app/actions/theme";

type ThemeAxis = keyof ThemePreferences;

type ThemePreferenceError = Readonly<{
  axis: ThemeAxis;
  value: ThemePreferences[ThemeAxis];
  message: string;
}>;

type ThemeContextValue = Readonly<{
  preferences: ThemePreferences;
  pendingAxes: ReadonlySet<ThemeAxis>;
  errors: Readonly<Partial<Record<ThemeAxis, ThemePreferenceError>>>;
  setPreference: (axis: ThemeAxis, value: ThemePreferences[ThemeAxis]) => Promise<boolean>;
  retryPreference: (axis: ThemeAxis) => Promise<boolean>;
}>;

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemePreferences(preferences: ThemePreferences) {
  const root = document.documentElement;
  root.dataset.brand = preferences.brand;
  root.dataset.colorScheme = preferences.colorScheme;
  root.dataset.density = preferences.density;
}

export type ThemeProviderProps = Readonly<{
  children: ReactNode;
  initialPreferences: ThemePreferences;
  persistPreference?: PersistThemePreference;
}>;

export function ThemeProvider({
  children,
  initialPreferences,
  persistPreference,
}: ThemeProviderProps) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [pendingAxes, setPendingAxes] = useState<ReadonlySet<ThemeAxis>>(new Set());
  const [errors, setErrors] = useState<Readonly<Partial<Record<ThemeAxis, ThemePreferenceError>>>>(
    {},
  );
  const preferencesRef = useRef(preferences);
  const requestIds = useRef<Record<ThemeAxis, number>>({
    brand: 0,
    colorScheme: 0,
    density: 0,
  });
  const retryValues = useRef<Partial<Record<ThemeAxis, ThemePreferences[ThemeAxis]>>>({});

  useLayoutEffect(() => {
    applyThemePreferences(preferences);
  }, [preferences]);

  const setPreference = useCallback<ThemeContextValue["setPreference"]>(
    async (axis, value) => {
      const requestId = requestIds.current[axis] + 1;
      requestIds.current[axis] = requestId;
      const previous = preferencesRef.current[axis];
      const nextPreferences = { ...preferencesRef.current, [axis]: value } as ThemePreferences;
      preferencesRef.current = nextPreferences;
      applyThemePreferences(nextPreferences);
      setPreferences(nextPreferences);
      setPendingAxes((current) => new Set([...current, axis]));
      setErrors((current) => ({ ...current, [axis]: undefined }));

      try {
        await persistPreference?.(axis, value);
        if (requestIds.current[axis] === requestId) {
          retryValues.current[axis] = undefined;
        }
        return true;
      } catch {
        if (requestIds.current[axis] !== requestId) {
          return false;
        }
        const restoredPreferences = {
          ...preferencesRef.current,
          [axis]: previous,
        } as ThemePreferences;
        preferencesRef.current = restoredPreferences;
        applyThemePreferences(restoredPreferences);
        setPreferences(restoredPreferences);
        retryValues.current[axis] = value;
        setErrors((current) => ({
          ...current,
          [axis]: {
            axis,
            value,
            message: "This preference could not be saved. Try again.",
          },
        }));
        return false;
      } finally {
        if (requestIds.current[axis] === requestId) {
          setPendingAxes((current) => {
            const next = new Set(current);
            next.delete(axis);
            return next;
          });
        }
      }
    },
    [persistPreference],
  );

  const retryPreference = useCallback<ThemeContextValue["retryPreference"]>(
    (axis) => {
      const value = retryValues.current[axis];
      if (value === undefined) {
        return Promise.resolve(false);
      }
      return setPreference(axis, value);
    },
    [setPreference],
  );

  const value: ThemeContextValue = {
    errors,
    pendingAxes,
    preferences,
    retryPreference,
    setPreference,
  };

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }
  return context;
}

export type { ColorSchemePreference, ThemeAxis, ThemeBrand, ThemeDensity, ThemePreferences };
