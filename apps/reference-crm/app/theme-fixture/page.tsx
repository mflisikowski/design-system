import {
  type ContrastPair,
  contrastPairs,
  resolvedThemeContexts,
} from "@mflisikowski/tokens/runtime";

import styles from "./theme-fixture.module.css";

function titleCase(value: string) {
  return `${value[0]?.toUpperCase()}${value.slice(1)}`;
}

function tokenVariable(tokenId: string) {
  return `var(--mfd-${tokenId.replaceAll(".", "-")})`;
}

function contrastStyle(pair: ContrastPair) {
  const backgroundColor = tokenVariable(pair.background);
  const foregroundColor = tokenVariable(pair.foreground);

  if (pair.category === "boundary" || pair.category === "focus") {
    return {
      backgroundColor,
      borderColor: foregroundColor,
      borderStyle: "solid",
      borderWidth: 2,
    };
  }

  return { backgroundColor, color: foregroundColor };
}

export default function ThemeFixturePage() {
  return (
    <main className={styles.page}>
      <header className={styles.introduction}>
        <p className={styles.eyebrow}>Runtime contract fixture</p>
        <h1>Eight independent theme contexts</h1>
        <p>
          Each panel applies one generated brand, color-scheme, and density permutation. Native
          controls inherit the matching browser color scheme.
        </p>
      </header>

      <div className={styles.grid}>
        {resolvedThemeContexts.map(({ brand, colorScheme, density }) => {
          const id = `${brand}-${colorScheme}-${density}`;
          const title = `${titleCase(brand)} · ${titleCase(colorScheme)} · ${titleCase(density)}`;

          return (
            <section
              className={styles.context}
              data-brand={brand}
              data-color-scheme={colorScheme}
              data-density={density}
              data-theme-context={id}
              key={id}
              aria-labelledby={`${id}-title`}
            >
              <div className={styles.contextHeader}>
                <div>
                  <p className={styles.contextLabel}>Resolved context</p>
                  <h2 id={`${id}-title`}>{title}</h2>
                </div>
                <code>{id}</code>
              </div>

              <div className={styles.surface}>
                <p className={styles.secondary}>Secondary copy stays legible on the surface.</p>
                <p className={styles.muted}>Muted copy still meets the approved text threshold.</p>

                <div className={styles.controls}>
                  <label>
                    <span>Name</span>
                    <input defaultValue="Example client" readOnly />
                  </label>
                  <label>
                    <span>Status</span>
                    <select defaultValue="active">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                </div>

                <ul className={styles.contrastPairs} aria-label="Measured contrast pairs">
                  {contrastPairs.map((pair) => (
                    <li className={styles.contrastPair} key={pair.id}>
                      <span className={styles.contrastPairLabel}>
                        <code>{pair.id}</code>
                        <strong>{pair.minimum}:1</strong>
                      </span>
                      <span
                        aria-hidden="true"
                        className={styles.contrastSwatch}
                        data-contrast-pair={pair.id}
                        style={contrastStyle(pair)}
                      >
                        {pair.category === "boundary" || pair.category === "focus" ? "" : "Aa"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
