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

test("radio group preserves one-value semantics and keyboard selection", async () => {
  document.documentElement.dataset.brand = "atlas";
  document.documentElement.dataset.colorScheme = "light";
  document.documentElement.dataset.density = "comfortable";

  render(
    <RadioGroup.Root aria-label="Color scheme" defaultValue="system">
      <label>
        <RadioGroupItem value="system">
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
