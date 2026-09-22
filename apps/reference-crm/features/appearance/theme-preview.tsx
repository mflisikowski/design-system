"use client";

import type { ThemePreferences } from "@/components/theme/theme-provider";

import "./theme-preview.css";

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

type ThemePreviewProps = Readonly<{
  preferences: ThemePreferences;
}>;

export function ThemePreview({ preferences }: ThemePreviewProps) {
  const summary = `${titleCase(preferences.brand)} · ${titleCase(preferences.colorScheme)} · ${titleCase(preferences.density)}`;

  return (
    <section className="theme-preview" aria-labelledby="theme-preview-title">
      <div aria-hidden="true" className="theme-preview__sample">
        <div className="theme-preview__sample-header">
          <span className="theme-preview__mark" />
          <span className="theme-preview__line theme-preview__line--short" />
        </div>
        <div className="theme-preview__surface">
          <span className="theme-preview__line theme-preview__line--long" />
          <span className="theme-preview__line" />
          <div className="theme-preview__controls">
            <span className="theme-preview__control" />
            <span className="theme-preview__button">Action</span>
            <span className="theme-preview__status">Ready</span>
          </div>
        </div>
      </div>
      <div className="theme-preview__summary">
        <h2 id="theme-preview-title">Active appearance</h2>
        <p>{summary}</p>
      </div>
    </section>
  );
}
