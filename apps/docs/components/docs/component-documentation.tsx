import type { ReactNode } from "react";

import { CopyCommand } from "./copy-command";

type ScrollableRegionProps = Readonly<{
  children: ReactNode;
  label: string;
  surface: "code-scroll" | "table-scroll";
}>;

function ScrollableRegion({ children, label, surface }: ScrollableRegionProps) {
  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- MFD exception: Scrollable documentation regions need keyboard focus when code or tables overflow.
    <section aria-label={label} data-docs={surface} tabIndex={0}>
      {children}
    </section>
  );
}

type Maturity = "stable" | "experimental" | "planned" | "deprecated";

type MaturityNoticeProps = Readonly<{
  introduced: string;
  status: Maturity;
}>;

export function MaturityNotice({ introduced, status }: MaturityNoticeProps) {
  return (
    <div data-docs="maturity-notice">
      <span data-docs="maturity-badge" data-maturity={status}>
        {status}
      </span>
      <span>Introduced in {introduced}</span>
    </div>
  );
}

type InstallationProps = Readonly<{
  dependencies: readonly string[];
  latest: string;
  namespaceConfig: string;
  registryDependencies: readonly string[];
  snapshot: string;
}>;

function CommandLine({ command, label }: Readonly<{ command: string; label: string }>) {
  return (
    <div data-docs="command-line">
      <div data-docs="command-line-heading">
        <span>{label}</span>
        <CopyCommand command={command} />
      </div>
      <ScrollableRegion label={`${label} command`} surface="code-scroll">
        <pre>
          <code>{command}</code>
        </pre>
      </ScrollableRegion>
    </div>
  );
}

export function Installation({
  dependencies,
  latest,
  namespaceConfig,
  registryDependencies,
  snapshot,
}: InstallationProps) {
  return (
    <div data-docs="installation-block">
      <section data-docs="installation-path">
        <h3>New project</h3>
        <p>
          Initialize the project with shadcn, then add the MFD registry namespace to the generated{" "}
          <code>components.json</code> before installing the item.
        </p>
        <CodeExample filename="components.json" language="json">
          {namespaceConfig}
        </CodeExample>
        <CommandLine command={latest} label="Install the latest reviewed item" />
      </section>
      <section data-docs="installation-path">
        <h3>Existing project</h3>
        <p>
          Merge the registry entry into the existing <code>components.json</code>, preserving the
          project&apos;s style, aliases, and Tailwind settings, then install the item.
        </p>
        <CodeExample filename="components.json" language="json">
          {namespaceConfig}
        </CodeExample>
        <CommandLine command={latest} label="Install the latest reviewed item" />
      </section>
      <section data-docs="installation-path">
        <h3>Reproducible installation</h3>
        <p>Use the complete immutable URL when the exact reviewed release must be retained.</p>
        <CommandLine command={snapshot} label="Install the immutable snapshot" />
      </section>
      <dl data-docs="dependency-list">
        <div>
          <dt>Package dependencies</dt>
          <dd>{dependencies.join(", ")}</dd>
        </div>
        <div>
          <dt>Registry dependencies</dt>
          <dd>{registryDependencies.join(", ")}</dd>
        </div>
      </dl>
    </div>
  );
}

type CodeExampleProps = Readonly<{
  children: string;
  filename: string;
  language: string;
}>;

export function CodeExample({ children, filename, language }: CodeExampleProps) {
  return (
    <figure data-docs="code-example">
      <figcaption>
        <span>{filename}</span>
        <span>{language}</span>
      </figcaption>
      <ScrollableRegion label={`${filename} code example`} surface="code-scroll">
        <pre>
          <code>{children.trim()}</code>
        </pre>
      </ScrollableRegion>
    </figure>
  );
}

type LiveExampleProps = Readonly<{
  children: ReactNode;
  label: string;
}>;

export function LiveExample({ children, label }: LiveExampleProps) {
  return (
    <fieldset aria-label={label} data-docs="live-example">
      <legend data-docs="live-example-label">Live canonical item</legend>
      <div data-docs="live-example-canvas">{children}</div>
    </fieldset>
  );
}

type ApiRow = Readonly<{
  defaultValue: string;
  description: string;
  name: string;
  type: string;
}>;

type ApiTableProps = Readonly<{
  label: string;
  rows: readonly ApiRow[];
}>;

export function ApiTable({ label, rows }: ApiTableProps) {
  return (
    <ScrollableRegion label={`${label} API`} surface="table-scroll">
      <table>
        <caption>{label} public properties</caption>
        <thead>
          <tr>
            <th scope="col">Property</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row">
                <code>{row.name}</code>
              </th>
              <td>
                <code>{row.type}</code>
              </td>
              <td>{row.defaultValue}</td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollableRegion>
  );
}

export function AccessibilityNotes({ children }: Readonly<{ children: ReactNode }>) {
  return <div data-docs="accessibility-notes">{children}</div>;
}

type KeyboardRow = Readonly<{
  interaction: string;
  result: string;
}>;

export function KeyboardBehavior({ rows }: Readonly<{ rows: readonly KeyboardRow[] }>) {
  return (
    <ScrollableRegion label="Keyboard behavior" surface="table-scroll">
      <table>
        <caption>Keyboard interaction</caption>
        <thead>
          <tr>
            <th scope="col">Interaction</th>
            <th scope="col">Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.interaction}>
              <th scope="row">{row.interaction}</th>
              <td>{row.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollableRegion>
  );
}
