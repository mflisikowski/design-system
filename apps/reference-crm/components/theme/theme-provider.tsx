"use client";

import type {
  ColorSchemePreference,
  ThemeBrand,
  ThemeDensity,
  ThemePreferences,
} from "@mflisikowski/tokens/runtime";
import { themeDefaults } from "@mflisikowski/tokens/runtime";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState } from "react";

import type { PersistThemePreference, PersistThemePreferences } from "@/app/actions/theme";

type ThemeAxis = keyof ThemePreferences;

type ThemePreferenceError = Readonly<{
  axis: ThemeAxis;
  value: ThemePreferences[ThemeAxis];
  message: string;
}>;

type ThemeResetError = Readonly<{
  value: ThemePreferences;
  message: string;
}>;

type ThemeContextValue = Readonly<{
  preferences: ThemePreferences;
  pendingAxes: ReadonlySet<ThemeAxis>;
  errors: Readonly<Partial<Record<ThemeAxis, ThemePreferenceError>>>;
  isResetPending: boolean;
  resetError?: ThemeResetError;
  setPreference: (axis: ThemeAxis, value: ThemePreferences[ThemeAxis]) => Promise<boolean>;
  retryPreference: (axis: ThemeAxis) => Promise<boolean>;
  resetPreferences: () => Promise<boolean>;
  retryReset: () => Promise<boolean>;
}>;

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemePreferences(preferences: ThemePreferences, suppressTransitions = true) {
  const root = document.documentElement;
  if (suppressTransitions) {
    root.dataset.themeTransitioning = "true";
    window.requestAnimationFrame(() => {
      delete root.dataset.themeTransitioning;
    });
  }
  root.dataset.brand = preferences.brand;
  root.dataset.colorScheme = preferences.colorScheme;
  root.dataset.density = preferences.density;
}

export type ThemeProviderProps = Readonly<{
  children: ReactNode;
  initialPreferences: ThemePreferences;
  persistPreference?: PersistThemePreference;
  persistPreferences?: PersistThemePreferences;
}>;

export function ThemeProvider({
  children,
  initialPreferences,
  persistPreference,
  persistPreferences,
}: ThemeProviderProps) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [pendingAxes, setPendingAxes] = useState<ReadonlySet<ThemeAxis>>(new Set());
  const [errors, setErrors] = useState<Readonly<Partial<Record<ThemeAxis, ThemePreferenceError>>>>(
    {},
  );
  const [isResetPending, setIsResetPending] = useState(false);
  const [resetError, setResetError] = useState<ThemeResetError>();
  const preferencesRef = useRef(preferences);
  const confirmedPreferencesRef = useRef(initialPreferences);
  const pendingAxesRef = useRef<Set<ThemeAxis>>(new Set());
  const resetPendingRef = useRef(false);
  const requestIds = useRef<Record<ThemeAxis, number>>({
    brand: 0,
    colorScheme: 0,
    density: 0,
  });
  const resetRequestId = useRef(0);
  const retryValues = useRef<Partial<Record<ThemeAxis, ThemePreferences[ThemeAxis]>>>({});

  useLayoutEffect(() => {
    applyThemePreferences(preferences, false);
  }, [preferences]);

  const setPreference = useCallback<ThemeContextValue["setPreference"]>(
    async (axis, value) => {
      if (resetPendingRef.current) {
        return false;
      }

      const requestId = requestIds.current[axis] + 1;
      requestIds.current[axis] = requestId;
      const previous = confirmedPreferencesRef.current[axis];
      const nextPreferences = { ...preferencesRef.current, [axis]: value } as ThemePreferences;
      preferencesRef.current = nextPreferences;
      applyThemePreferences(nextPreferences);
      setPreferences(nextPreferences);
      pendingAxesRef.current = new Set([...pendingAxesRef.current, axis]);
      setPendingAxes(pendingAxesRef.current);
      setErrors((current) => ({ ...current, [axis]: undefined }));

      try {
        await persistPreference?.(axis, value);
        if (requestIds.current[axis] === requestId) {
          confirmedPreferencesRef.current = {
            ...confirmedPreferencesRef.current,
            [axis]: value,
          } as ThemePreferences;
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
          const next = new Set(pendingAxesRef.current);
          next.delete(axis);
          pendingAxesRef.current = next;
          setPendingAxes(next);
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

  const resetPreferences = useCallback<ThemeContextValue["resetPreferences"]>(async () => {
    if (resetPendingRef.current || pendingAxesRef.current.size > 0) {
      return false;
    }

    const requestId = resetRequestId.current + 1;
    resetRequestId.current = requestId;
    const confirmedBeforeReset = confirmedPreferencesRef.current;
    const nextPreferences = { ...themeDefaults };

    resetPendingRef.current = true;
    setIsResetPending(true);
    setResetError(undefined);
    preferencesRef.current = nextPreferences;
    applyThemePreferences(nextPreferences);
    setPreferences(nextPreferences);

    try {
      await persistPreferences?.(nextPreferences);
      if (resetRequestId.current === requestId) {
        confirmedPreferencesRef.current = nextPreferences;
        retryValues.current = {};
        setErrors({});
      }
      return true;
    } catch {
      if (resetRequestId.current !== requestId) {
        return false;
      }
      preferencesRef.current = confirmedBeforeReset;
      applyThemePreferences(confirmedBeforeReset);
      setPreferences(confirmedBeforeReset);
      setResetError({
        value: nextPreferences,
        message: "Appearance could not be reset. Try again.",
      });
      return false;
    } finally {
      if (resetRequestId.current === requestId) {
        resetPendingRef.current = false;
        setIsResetPending(false);
      }
    }
  }, [persistPreferences]);

  const retryReset = useCallback<ThemeContextValue["retryReset"]>(() => {
    if (!resetError) {
      return Promise.resolve(false);
    }
    return resetPreferences();
  }, [resetError, resetPreferences]);

  const value: ThemeContextValue = {
    errors,
    isResetPending,
    pendingAxes,
    preferences,
    retryPreference,
    resetError,
    resetPreferences,
    retryReset,
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
