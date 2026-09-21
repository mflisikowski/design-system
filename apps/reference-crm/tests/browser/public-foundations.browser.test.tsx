import { useState } from "react";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { Icon, IconButton } from "@/components/ui/icon";
import { Link } from "@/components/ui/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

test("public foundations preserve native behavior and accessible names", async () => {
  const onClick = vi.fn();

  render(
    <div>
      <Button onClick={onClick}>Retry</Button>
      <Button loading loadingLabel="Resetting demo data">
        Reset demo data
      </Button>
      <IconButton label="More actions for Northstar Studio" onClick={onClick}>
        <Icon name="ellipsis" />
      </IconButton>
      <Link href="#clients">Browse clients</Link>
    </div>,
  );

  await page.getByRole("button", { name: "Retry" }).click();
  expect(onClick).toHaveBeenCalledTimes(1);
  await expect.element(page.getByRole("button", { name: "Resetting demo data" })).toBeDisabled();
  await expect
    .element(page.getByRole("img", { name: "More actions for Northstar Studio" }))
    .not.toBeInTheDocument();
  await expect
    .element(page.getByRole("link", { name: "Browse clients" }))
    .toHaveAttribute("href", "#clients");
});

test("feedback and data display expose semantic structures", async () => {
  function Fixture() {
    const [empty, setEmpty] = useState(false);

    return (
      <>
        <Alert live tone="danger">
          <AlertTitle>Clients could not be loaded</AlertTitle>
          <AlertDescription>Try the request again.</AlertDescription>
        </Alert>
        <Button onClick={() => setEmpty(true)}>Show empty state</Button>
        {empty ? (
          <EmptyState>
            <EmptyStateTitle>No clients yet</EmptyStateTitle>
            <EmptyStateDescription>Add a client to get started.</EmptyStateDescription>
            <EmptyStateActions>
              <Button>Add client</Button>
            </EmptyStateActions>
          </EmptyState>
        ) : (
          <Table>
            <TableCaption>Clients</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Northstar Studio</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </>
    );
  }

  render(<Fixture />);

  await expect
    .element(page.getByRole("alert"))
    .toHaveTextContent("Clients could not be loadedTry the request again.");
  await expect.element(page.getByRole("table", { name: "Clients" })).toBeInTheDocument();
  await expect.element(page.getByRole("columnheader", { name: "Client" })).toBeInTheDocument();

  await page.getByRole("button", { name: "Show empty state" }).click();
  await expect.element(page.getByRole("heading", { name: "No clients yet" })).toBeInTheDocument();
});
