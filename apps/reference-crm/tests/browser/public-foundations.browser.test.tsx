import { useState } from "react";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Icon, IconButton } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import { SearchField } from "@/components/ui/search-field";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ToastViewport, toast } from "@/components/ui/toast";

test("public foundations preserve native behavior and accessible names", async () => {
  const onClick = vi.fn();

  render(
    <div>
      <Button onClick={onClick}>Retry</Button>
      <Button loading loadingLabel="Resetting demo data" onClick={onClick}>
        Reset demo data
      </Button>
      <IconButton label="More actions for Northstar Studio" onClick={onClick}>
        <Icon name="ellipsis" />
      </IconButton>
      <Link href="#clients">Browse clients</Link>
      <Link
        href="#settings"
        render={<a aria-label="Router-composed settings" data-router-link="" href="#settings" />}
      >
        Router-composed settings
      </Link>
    </div>,
  );

  await page.getByRole("button", { name: "Retry" }).click();
  expect(onClick).toHaveBeenCalledTimes(1);
  const loadingButton = page.getByRole("button", { name: "Resetting demo data" });
  await expect.element(loadingButton).toHaveAttribute("aria-disabled", "true");
  await loadingButton.click({ force: true });
  expect(onClick).toHaveBeenCalledTimes(1);
  await expect.element(loadingButton).toHaveFocus();
  await expect
    .element(page.getByRole("img", { name: "More actions for Northstar Studio" }))
    .not.toBeInTheDocument();
  await expect
    .element(page.getByRole("link", { name: "Browse clients" }))
    .toHaveAttribute("href", "#clients");
  await expect
    .element(page.getByRole("link", { name: "Router-composed settings" }))
    .toHaveAttribute("data-router-link", "");
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

test("form controls expose labels, descriptions, and validation errors", async () => {
  render(
    <>
      <Field invalid>
        <FieldLabel>Organization name</FieldLabel>
        <FieldDescription>Use the client organization, not the contact.</FieldDescription>
        <Input />
        <FieldError>Organization name is required.</FieldError>
      </Field>
      <Field>
        <FieldLabel>Notes</FieldLabel>
        <Textarea />
      </Field>
    </>,
  );

  const organizationName = page.getByRole("textbox", { name: "Organization name" });
  await expect.element(organizationName).toHaveAttribute("aria-invalid", "true");
  await expect
    .element(organizationName)
    .toHaveAccessibleDescription(
      "Use the client organization, not the contact. Organization name is required.",
    );
  await expect.element(page.getByRole("textbox", { name: "Notes" })).toBeInTheDocument();
});

test("Search Field owns native value, submit, clear, and Escape behavior", async () => {
  const onSubmit = vi.fn();
  const onClear = vi.fn();

  render(
    <Field>
      <FieldLabel>Search clients</FieldLabel>
      <FieldDescription>Search by organization, contact, or email.</FieldDescription>
      <SearchField defaultValue="Northstar" onClear={onClear} onSubmit={onSubmit} />
    </Field>,
  );

  const field = page.getByRole("searchbox", { name: "Search clients" });
  await expect
    .element(field)
    .toHaveAccessibleDescription("Search by organization, contact, or email.");
  await field.click();
  await userEvent.keyboard("{Enter}");
  expect(onSubmit).toHaveBeenCalledWith("Northstar");

  await userEvent.keyboard("{Escape}");
  await expect.element(field).toHaveValue("");
  expect(onClear).toHaveBeenCalledTimes(1);

  await field.fill("Juniper");
  await expect.element(page.getByRole("button", { name: "Clear search" })).toBeInTheDocument();
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect.element(field).toHaveValue("");
  expect(onClear).toHaveBeenCalledTimes(2);
});

test("status Badge tones and Select keyboard behavior remain explicit", async () => {
  function Fixture() {
    const [status, setStatus] = useState("planned");
    return (
      <>
        <div aria-label="Project status badges">
          <Badge tone="neutral">Planned</Badge>
          <Badge tone="accent">Active</Badge>
          <Badge tone="warning">On hold</Badge>
          <Badge tone="success">Completed</Badge>
        </div>
        <Select.Root
          items={[
            { label: "Planned", value: "planned" },
            { label: "Active", value: "active" },
            { label: "On hold", value: "on-hold" },
            { label: "Completed", value: "completed" },
          ]}
          onValueChange={(value) => value && setStatus(value)}
          value={status}
        >
          <Select.Trigger aria-label="Project status">
            <Select.Value />
            <Select.Icon />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="planned">Planned</Select.Item>
            <Select.Item value="active">Active</Select.Item>
            <Select.Item value="on-hold">On hold</Select.Item>
            <Select.Item value="completed">Completed</Select.Item>
          </Select.Content>
        </Select.Root>
      </>
    );
  }

  render(<Fixture />);

  await expect
    .element(page.getByText("On hold", { exact: true }))
    .toHaveAttribute("data-tone", "warning");

  const trigger = page.getByRole("combobox", { name: "Project status" });
  await trigger.click();
  await expect.element(page.getByRole("option", { name: "Planned" })).toBeInTheDocument();
  await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
  await expect.element(trigger).toHaveTextContent("On hold⌄");
});

test("dialog manages modal focus and restores it to the trigger", async () => {
  const onOpenChange = vi.fn();
  render(
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger>Open client form</DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Add client</DialogTitle>
          <DialogDescription>Enter the organization and primary contact.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Field>
            <FieldLabel>Organization name</FieldLabel>
            <Input />
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>,
  );

  const trigger = page.getByRole("button", { name: "Open client form" });
  await trigger.click();
  expect(onOpenChange).toHaveBeenLastCalledWith(
    true,
    expect.objectContaining({ cancel: expect.any(Function), reason: "trigger" }),
  );
  await expect.element(page.getByRole("dialog", { name: "Add client" })).toBeInTheDocument();
  await expect.element(page.getByRole("textbox", { name: "Organization name" })).toHaveFocus();
  await page.getByRole("button", { name: "Cancel" }).click();
  expect(onOpenChange).toHaveBeenLastCalledWith(
    false,
    expect.objectContaining({ cancel: expect.any(Function), reason: "close" }),
  );
  await expect.element(trigger).toHaveFocus();
});

test("alert dialog protects consequential actions and focus", async () => {
  function Fixture() {
    const [pending, setPending] = useState(false);

    return (
      <AlertDialog pending={pending}>
        <AlertDialogTrigger>Discard draft</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>Your entered values will be lost.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel render={<Button variant="outline" />}>
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setPending(true)}
              render={<Button variant="danger" />}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  render(<Fixture />);

  const trigger = page.getByRole("button", { name: "Discard draft" });
  await trigger.click();
  await expect
    .element(page.getByRole("alertdialog", { name: "Discard changes?" }))
    .toBeInTheDocument();
  await expect.element(page.getByRole("button", { name: "Keep editing" })).toHaveFocus();
  document.querySelector<HTMLElement>(".mfd-alert-dialog__backdrop")?.click();
  await expect
    .element(page.getByRole("alertdialog", { name: "Discard changes?" }))
    .toBeInTheDocument();

  const action = page.getByRole("button", { name: "Discard changes" });
  await action.click();
  await expect.element(page.getByRole("button", { name: "Keep editing" })).toBeDisabled();
  await expect.element(action).toHaveAttribute("aria-disabled", "true");
  await expect.element(action).toHaveFocus();
  await userEvent.keyboard("{Escape}");
  await expect
    .element(page.getByRole("alertdialog", { name: "Discard changes?" }))
    .toBeInTheDocument();
});

test("alert dialog treats Escape as cancel and restores trigger focus", async () => {
  render(
    <AlertDialog>
      <AlertDialogTrigger>Discard draft</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Discard changes?</AlertDialogTitle>
        <AlertDialogDescription>Your entered values will be lost.</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction>Discard changes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
  );

  const trigger = page.getByRole("button", { name: "Discard draft" });
  await trigger.click();
  await userEvent.keyboard("{Escape}");
  await expect
    .element(page.getByRole("alertdialog", { name: "Discard changes?" }))
    .not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
});

test("toast adapter announces successful acknowledgements politely", async () => {
  render(
    <>
      <ToastViewport />
      <Button onClick={() => toast.success("Client added")}>Save client</Button>
    </>,
  );

  await page.getByRole("button", { name: "Save client" }).click();
  await expect.element(page.getByText("Client added")).toBeInTheDocument();
  await expect.element(page.getByText("Client added")).toHaveAttribute("data-title");
});
