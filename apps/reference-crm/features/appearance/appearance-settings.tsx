"use client";

import { useState } from "react";
import { type ThemeAxis, type ThemePreferences, useTheme } from "@/components/theme/theme-provider";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  RadioCard,
  RadioGroup,
  RadioGroupIndicator,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { ThemePreview } from "./theme-preview";

const brandOptions = [
  {
    value: "atlas",
    label: "Atlas",
    description: "Technical, precise, and restrained.",
    preview: "A",
  },
  { value: "bloom", label: "Bloom", description: "Friendly, soft, and expressive.", preview: "B" },
] as const satisfies ReadonlyArray<{
  value: ThemePreferences["brand"];
  label: string;
  description: string;
  preview: string;
}>;

const colorSchemeOptions = [
  { value: "system", label: "System", description: "Follow the operating-system preference." },
  { value: "light", label: "Light", description: "Use the light semantic palette." },
  { value: "dark", label: "Dark", description: "Use the dark semantic palette." },
] as const satisfies ReadonlyArray<{
  value: ThemePreferences["colorScheme"];
  label: string;
  description: string;
}>;

const densityOptions = [
  {
    value: "comfortable",
    label: "Comfortable",
    description: "More breathing room for everyday work.",
  },
  { value: "compact", label: "Compact", description: "Tighter coordinated spacing and controls." },
] as const satisfies ReadonlyArray<{
  value: ThemePreferences["density"];
  label: string;
  description: string;
}>;

function updateValue(
  setPreference: ReturnType<typeof useTheme>["setPreference"],
  axis: ThemeAxis,
  value: string,
) {
  void setPreference(axis, value as ThemePreferences[ThemeAxis]);
}

export function AppearanceSettings() {
  const {
    errors,
    isResetPending,
    pendingAxes,
    preferences,
    resetError,
    resetPreferences,
    retryPreference,
    retryReset,
    setPreference,
  } = useTheme();
  const [resetAnnouncement, setResetAnnouncement] = useState("");
  const failedAxes = Object.keys(errors) as ThemeAxis[];

  async function handleReset() {
    setResetAnnouncement("");
    if (await resetPreferences()) {
      setResetAnnouncement("Appearance reset to the default settings.");
    }
  }

  return (
    <div
      aria-busy={isResetPending || undefined}
      className="appearance-settings"
      data-reset-pending={isResetPending || undefined}
    >
      {failedAxes.map((axis) => {
        const error = errors[axis];
        if (!error) {
          return null;
        }
        return (
          <Alert key={axis} live>
            <AlertTitle>Appearance could not be saved</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
            <AlertAction>
              <Button
                disabled={isResetPending}
                loading={pendingAxes.has(axis)}
                onClick={() => void retryPreference(axis)}
                variant="outline"
              >
                Try again
              </Button>
            </AlertAction>
          </Alert>
        );
      })}

      <fieldset className="appearance-settings__fieldset" disabled={isResetPending}>
        <legend>Brand</legend>
        <p className="appearance-settings__description">
          Demo-only tenant context. This does not edit a production brand.
        </p>
        <RadioGroup.Root
          aria-label="Brand"
          loading={isResetPending || pendingAxes.has("brand")}
          onValueChange={(value) => updateValue(setPreference, "brand", String(value))}
          value={preferences.brand}
        >
          {brandOptions.map((option) => (
            <RadioCard
              description={option.description}
              key={option.value}
              preview={option.preview}
              value={option.value}
            >
              {option.label}
            </RadioCard>
          ))}
        </RadioGroup.Root>
      </fieldset>

      <fieldset className="appearance-settings__fieldset" disabled={isResetPending}>
        <legend>Color scheme</legend>
        <p className="appearance-settings__description">
          System remains the stored preference and follows OS changes.
        </p>
        <RadioGroup.Root
          aria-label="Color scheme"
          loading={isResetPending || pendingAxes.has("colorScheme")}
          onValueChange={(value) => updateValue(setPreference, "colorScheme", String(value))}
          value={preferences.colorScheme}
        >
          {colorSchemeOptions.map((option) => (
            <label className="appearance-settings__radio" key={option.value}>
              <RadioGroupItem value={option.value}>
                <RadioGroupIndicator />
              </RadioGroupItem>
              <span>
                <span className="appearance-settings__radio-label">{option.label}</span>
                <span className="appearance-settings__radio-description">{option.description}</span>
              </span>
            </label>
          ))}
        </RadioGroup.Root>
      </fieldset>

      <fieldset className="appearance-settings__fieldset" disabled={isResetPending}>
        <legend>Density</legend>
        <p className="appearance-settings__description">
          Density changes coordinated dimensions without changing component meaning or behavior.
        </p>
        <RadioGroup.Root
          aria-label="Density"
          loading={isResetPending || pendingAxes.has("density")}
          onValueChange={(value) => updateValue(setPreference, "density", String(value))}
          value={preferences.density}
        >
          {densityOptions.map((option) => (
            <label className="appearance-settings__radio" key={option.value}>
              <RadioGroupItem value={option.value}>
                <RadioGroupIndicator />
              </RadioGroupItem>
              <span>
                <span className="appearance-settings__radio-label">{option.label}</span>
                <span className="appearance-settings__radio-description">{option.description}</span>
              </span>
            </label>
          ))}
        </RadioGroup.Root>
      </fieldset>

      <ThemePreview preferences={preferences} />

      {resetError ? (
        <Alert live>
          <AlertTitle>Appearance could not be reset</AlertTitle>
          <AlertDescription>{resetError.message}</AlertDescription>
          <AlertAction>
            <Button
              disabled={pendingAxes.size > 0}
              loading={isResetPending}
              onClick={() => void retryReset()}
              variant="outline"
            >
              Try again
            </Button>
          </AlertAction>
        </Alert>
      ) : null}

      <div className="appearance-settings__actions">
        <Button
          disabled={pendingAxes.size > 0}
          loading={isResetPending}
          loadingLabel="Resetting appearance"
          onClick={() => void handleReset()}
          variant="outline"
        >
          Reset appearance
        </Button>
      </div>
      <p aria-live="polite" className="visually-hidden" role="status">
        {resetAnnouncement}
      </p>
    </div>
  );
}
