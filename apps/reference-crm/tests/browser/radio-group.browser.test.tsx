import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { ThemeProvider, useTheme } from "@/components/theme/theme-provider";
import {
  RadioCard,
  RadioGroup,
  RadioGroupIndicator,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { AppearanceSettings } from "@/features/appearance/appearance-settings";
import "@mflisikowski/tokens/css";

function ConcurrentThemeHarness() {
  const { preferences, setPreference } = useTheme();

  return (
    <>
      <output>{`${preferences.brand}/${preferences.density}`}</output>
      <button
        onClick={() => {
          void setPreference("brand", "bloom");
          void setPreference("density", "compact");
        }}
        type="button"
      >
        Change theme
      </button>
    </>
  );
}

function SameAxisThemeHarness() {
  const { preferences, setPreference } = useTheme();

  return (
    <>
      <output>{preferences.colorScheme}</output>
      <button
        onClick={() => {
          void setPreference("colorScheme", "dark");
          void setPreference("colorScheme", "light");
        }}
        type="button"
      >
        Change color scheme twice
      </button>
    </>
  );
}

function ResetThemeHarness() {
  const { isResetPending, preferences, resetError, resetPreferences, retryReset } = useTheme();

  return (
    <>
      <output aria-label="theme">
        {`${preferences.brand}/${preferences.colorScheme}/${preferences.density}`}
      </output>
      <output aria-label="reset state">{isResetPending ? "pending" : "idle"}</output>
      <button onClick={() => void resetPreferences()} type="button">
        Reset appearance
      </button>
      {resetError ? (
        <>
          <p>{resetError.message}</p>
          <button onClick={() => void retryReset()} type="button">
            Retry reset
          </button>
        </>
      ) : null}
    </>
  );
}

test("radio group preserves one-value semantics and keyboard selection", async () => {
  document.documentElement.dataset.brand = "atlas";
  document.documentElement.dataset.colorScheme = "light";
  document.documentElement.dataset.density = "comfortable";

  render(
    <RadioGroup.Root aria-label="Color scheme" defaultValue="system">
      <label htmlFor="test-color-scheme-system">
        <RadioGroupItem id="test-color-scheme-system" value="system">
          <RadioGroupIndicator />
        </RadioGroupItem>
        System
      </label>
      <RadioCard description="Always use the light palette." value="light">
        Light
      </RadioCard>
      <RadioCard description="Always use the dark palette." value="dark">
        Dark
      </RadioCard>
    </RadioGroup.Root>,
  );

  const group = page.getByRole("radiogroup", { name: "Color scheme" });
  const system = page.getByRole("radio", { name: "System" });
  const light = page.getByRole("radio", { name: "Light Always use the light palette." });

  await expect.element(group).toBeInTheDocument();
  await expect.element(system).toHaveAttribute("aria-checked", "true");
  const systemBox = document.querySelector<HTMLElement>('[role="radio"]')?.getBoundingClientRect();
  expect(systemBox).toBeDefined();
  expect(systemBox?.width).toBeGreaterThanOrEqual(44);
  expect(systemBox?.height).toBeGreaterThanOrEqual(44);
  await system.click();
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(light).toHaveAttribute("aria-checked", "true");
  await expect.element(light).toHaveFocus();
  await userEvent.keyboard("{Space}");
  await expect.element(light).toHaveAttribute("aria-checked", "true");
});

test("radio group maps orientation to arrow-key behavior", async () => {
  render(
    <RadioGroup.Root aria-label="Brand" defaultValue="atlas" orientation="horizontal">
      <RadioGroupItem value="atlas">Atlas</RadioGroupItem>
      <RadioGroupItem value="bloom">Bloom</RadioGroupItem>
    </RadioGroup.Root>,
  );

  const atlas = page.getByRole("radio", { name: "Atlas" });
  const bloom = page.getByRole("radio", { name: "Bloom" });

  await atlas.click();
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(atlas).toHaveAttribute("aria-checked", "true");
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(bloom).toHaveAttribute("aria-checked", "true");
  await expect.element(bloom).toHaveFocus();
});

test("appearance radios keep the effective 44px touch target in compact density", async () => {
  document.documentElement.dataset.brand = "bloom";
  document.documentElement.dataset.colorScheme = "dark";
  document.documentElement.dataset.density = "compact";

  render(
    <ThemeProvider initialPreferences={{ brand: "bloom", colorScheme: "dark", density: "compact" }}>
      <AppearanceSettings />
    </ThemeProvider>,
  );

  await expect.element(page.getByRole("radio", { name: /Atlas/ })).toBeInTheDocument();

  const radioBoxes = [...document.querySelectorAll<HTMLElement>('[role="radio"]')].map((radio) => {
    const { height, width } = radio.getBoundingClientRect();
    return { height, width };
  });

  expect(radioBoxes).toHaveLength(7);
  expect(radioBoxes.every(({ height, width }) => height >= 44 && width >= 44)).toBe(true);
});

test("theme rollback preserves another axis that is still saving", async () => {
  let rejectBrand: (() => void) | undefined;
  let resolveDensity: (() => void) | undefined;
  const persistPreference = async (axis: "brand" | "colorScheme" | "density") => {
    if (axis === "brand") {
      await new Promise<void>((_, reject) => {
        rejectBrand = () => reject(new Error("brand save failed"));
      });
      return;
    }
    if (axis === "density") {
      await new Promise<void>((resolve) => {
        resolveDensity = resolve;
      });
    }
  };

  render(
    <ThemeProvider
      initialPreferences={{ brand: "atlas", colorScheme: "system", density: "comfortable" }}
      persistPreference={persistPreference}
    >
      <ConcurrentThemeHarness />
    </ThemeProvider>,
  );

  await page.getByRole("button", { name: "Change theme" }).click();
  await expect.element(page.getByText("bloom/compact")).toBeInTheDocument();
  rejectBrand?.();
  await expect.element(page.getByText("atlas/compact")).toBeInTheDocument();
  resolveDensity?.();
});

test("theme rollback ignores stale saves for the same axis", async () => {
  let rejectDark: (() => void) | undefined;
  let resolveLight: (() => void) | undefined;
  const persistPreference = async (_axis: "brand" | "colorScheme" | "density", value: string) => {
    if (value === "dark") {
      await new Promise<void>((_, reject) => {
        rejectDark = () => reject(new Error("dark save failed"));
      });
      return;
    }
    await new Promise<void>((resolve) => {
      resolveLight = resolve;
    });
  };

  render(
    <ThemeProvider
      initialPreferences={{ brand: "atlas", colorScheme: "system", density: "comfortable" }}
      persistPreference={persistPreference}
    >
      <SameAxisThemeHarness />
    </ThemeProvider>,
  );

  await page.getByRole("button", { name: "Change color scheme twice" }).click();
  await expect.element(page.getByText("light")).toBeInTheDocument();
  rejectDark?.();
  await expect.element(page.getByText("light")).toBeInTheDocument();
  resolveLight?.();
});

test("reset persists the default tuple as one operation", async () => {
  let resolveReset: (() => void) | undefined;
  const persisted: Array<{
    brand: "atlas" | "bloom";
    colorScheme: "system" | "light" | "dark";
    density: "comfortable" | "compact";
  }> = [];

  const persistPreferences = async (preferences: (typeof persisted)[number]) => {
    persisted.push(preferences);
    await new Promise<void>((resolve) => {
      resolveReset = resolve;
    });
  };

  render(
    <ThemeProvider
      initialPreferences={{ brand: "bloom", colorScheme: "dark", density: "compact" }}
      persistPreferences={persistPreferences}
    >
      <ResetThemeHarness />
    </ThemeProvider>,
  );

  await page.getByRole("button", { name: "Reset appearance" }).click();
  await expect
    .element(page.getByRole("status", { name: "theme" }))
    .toHaveTextContent("atlas/system/comfortable");
  await expect
    .element(page.getByRole("status", { name: "reset state" }))
    .toHaveTextContent("pending");
  expect(persisted).toEqual([{ brand: "atlas", colorScheme: "system", density: "comfortable" }]);

  resolveReset?.();
  await expect.element(page.getByRole("status", { name: "reset state" })).toHaveTextContent("idle");
});

test("reset restores the last confirmed tuple and retries after failure", async () => {
  let rejectReset: (() => void) | undefined;
  let shouldFail = true;
  const persistPreferences = async () => {
    if (shouldFail) {
      shouldFail = false;
      await new Promise<void>((_, reject) => {
        rejectReset = () => reject(new Error("reset failed"));
      });
    }
  };

  render(
    <ThemeProvider
      initialPreferences={{ brand: "bloom", colorScheme: "dark", density: "compact" }}
      persistPreferences={persistPreferences}
    >
      <ResetThemeHarness />
    </ThemeProvider>,
  );

  await page.getByRole("button", { name: "Reset appearance" }).click();
  rejectReset?.();
  await expect
    .element(page.getByRole("status", { name: "theme" }))
    .toHaveTextContent("bloom/dark/compact");
  await expect
    .element(page.getByText("Appearance could not be reset. Try again."))
    .toBeInTheDocument();

  await page.getByRole("button", { name: "Retry reset" }).click();
  await expect
    .element(page.getByRole("status", { name: "theme" }))
    .toHaveTextContent("atlas/system/comfortable");
});

test("reset cannot race an individual axis save", async () => {
  let resolveBrand: (() => void) | undefined;
  let resetCalls = 0;
  const persistPreference = async () => {
    await new Promise<void>((resolve) => {
      resolveBrand = resolve;
    });
  };
  const persistPreferences = async () => {
    resetCalls += 1;
  };

  render(
    <ThemeProvider
      initialPreferences={{ brand: "atlas", colorScheme: "system", density: "comfortable" }}
      persistPreference={persistPreference}
      persistPreferences={persistPreferences}
    >
      <ConcurrentThemeHarness />
      <ResetThemeHarness />
    </ThemeProvider>,
  );

  await page.getByRole("button", { name: "Change theme" }).click();
  await page.getByRole("button", { name: "Reset appearance" }).click();
  expect(resetCalls).toBe(0);
  await expect.element(page.getByRole("status", { name: "reset state" })).toHaveTextContent("idle");

  resolveBrand?.();
});

test("an individual save only makes its own radio group busy and keeps focus", async () => {
  let resolveBrand: (() => void) | undefined;
  const persistPreference = async (axis: "brand" | "colorScheme" | "density") => {
    if (axis === "brand") {
      await new Promise<void>((resolve) => {
        resolveBrand = resolve;
      });
    }
  };

  render(
    <ThemeProvider
      initialPreferences={{ brand: "atlas", colorScheme: "system", density: "comfortable" }}
      persistPreference={persistPreference}
    >
      <AppearanceSettings />
    </ThemeProvider>,
  );

  const bloom = page.getByRole("radio", { name: /Bloom/ });
  await bloom.click();
  await expect.element(bloom).toHaveFocus();
  await expect
    .element(page.getByRole("radiogroup", { name: "Brand" }))
    .toHaveAttribute("aria-busy", "true");
  await expect
    .element(page.getByRole("radiogroup", { name: "Color scheme" }))
    .not.toHaveAttribute("aria-busy", "true");
  await expect
    .element(page.getByRole("radiogroup", { name: "Density" }))
    .not.toHaveAttribute("aria-busy", "true");

  resolveBrand?.();
});

test("an individual save exposes a persistent retry target without a toast", async () => {
  let shouldFail = true;
  const persistPreference = async (axis: "brand" | "colorScheme" | "density") => {
    if (axis === "brand" && shouldFail) {
      shouldFail = false;
      throw new Error("brand save failed");
    }
  };

  render(
    <ThemeProvider
      initialPreferences={{ brand: "atlas", colorScheme: "system", density: "comfortable" }}
      persistPreference={persistPreference}
    >
      <AppearanceSettings />
    </ThemeProvider>,
  );

  await page.getByRole("radio", { name: /Bloom/ }).click();
  await expect
    .element(page.getByRole("radio", { name: /Atlas/ }))
    .toHaveAttribute("aria-checked", "true");
  await expect
    .element(page.getByRole("heading", { name: "Appearance could not be saved" }))
    .toBeInTheDocument();
  await page.getByRole("button", { name: "Try again" }).click();
  await expect
    .element(page.getByRole("radio", { name: /Bloom/ }))
    .toHaveAttribute("aria-checked", "true");
  await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
});
