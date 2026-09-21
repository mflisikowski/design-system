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
  registryDependencies,
  snapshot,
}: InstallationProps) {
  return (
    <div data-docs="installation-block">
      <CommandLine command={latest} label="Latest reviewed item" />
      <CommandLine command={snapshot} label="Immutable snapshot" />
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

export function ApiTable({ rows }: Readonly<{ rows: readonly ApiRow[] }>) {
  return (
    <ScrollableRegion label="Registry Sample API" surface="table-scroll">
      <table>
        <caption>Registry Sample public properties</caption>
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
