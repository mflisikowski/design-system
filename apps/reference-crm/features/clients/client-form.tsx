"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DialogBody, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { type CreateClientInput, createClientInputSchema } from "./model";
import { ClientRepositoryError } from "./repository";

type ClientFormValues = z.input<typeof createClientInputSchema>;

type ClientFormProps = Readonly<{
  onDirtyChange: (dirty: boolean) => void;
  onSubmit: (input: CreateClientInput) => Promise<void>;
  pending: boolean;
}>;

const defaultValues: ClientFormValues = {
  organizationName: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  notes: "",
};

export function ClientForm({ onDirtyChange, onSubmit, pending }: ClientFormProps) {
  const [failureFocusTarget, setFailureFocusTarget] = useState<HTMLElement | null>(null);
  const [failedSubmission, setFailedSubmission] = useState<string | null>(null);
  const {
    clearErrors,
    formState: { errors, isDirty },
    handleSubmit,
    register,
    setError,
    setFocus,
  } = useForm<ClientFormValues, unknown, CreateClientInput>({
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(createClientInputSchema),
    shouldFocusError: true,
  });

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (!pending && failedSubmission && failureFocusTarget) {
      queueMicrotask(() => failureFocusTarget.focus());
    }
  }, [failedSubmission, failureFocusTarget, pending]);

  async function submitValues(input: CreateClientInput) {
    const activeElement = document.activeElement;
    clearErrors();

    try {
      await onSubmit(input);
    } catch (error) {
      if (error instanceof ClientRepositoryError) {
        const fieldErrors = Object.entries(error.fieldErrors ?? {}) as [
          keyof ClientFormValues,
          string,
        ][];
        if (fieldErrors.length > 0) {
          setFailureFocusTarget(null);
          setFailedSubmission(null);
          for (const [field, message] of fieldErrors) {
            setError(field, { message, type: "server" });
          }
          setFocus(fieldErrors[0][0]);
          return;
        }

        setFailureFocusTarget(activeElement instanceof HTMLElement ? activeElement : null);
        setFailedSubmission(error.message);
        return;
      }

      setFailureFocusTarget(activeElement instanceof HTMLElement ? activeElement : null);
      setFailedSubmission("The client could not be saved. Try again.");
    }
  }

  const submit = handleSubmit(submitValues);

  return (
    <form aria-busy={pending || undefined} className="client-form" noValidate onSubmit={submit}>
      <DialogBody>
        {failedSubmission ? (
          <div className="client-form__failure">
            <Alert live tone="danger">
              <AlertTitle>Client could not be saved</AlertTitle>
              <AlertDescription>{failedSubmission}</AlertDescription>
              <AlertAction>
                <Button
                  loading={pending}
                  loadingLabel="Retrying"
                  onClick={() => void submit()}
                  variant="outline"
                >
                  Try again
                </Button>
              </AlertAction>
            </Alert>
          </div>
        ) : null}
        <fieldset className="client-form__fields" disabled={pending}>
          <Field invalid={Boolean(errors.organizationName)}>
            <FieldLabel>Organization name</FieldLabel>
            <Input autoComplete="organization" required {...register("organizationName")} />
            <FieldError>{errors.organizationName?.message}</FieldError>
          </Field>
          <Field invalid={Boolean(errors.contactName)}>
            <FieldLabel>Contact name</FieldLabel>
            <Input autoComplete="name" required {...register("contactName")} />
            <FieldError>{errors.contactName?.message}</FieldError>
          </Field>
          <Field invalid={Boolean(errors.contactEmail)}>
            <FieldLabel>Contact email</FieldLabel>
            <Input autoComplete="email" required type="email" {...register("contactEmail")} />
            <FieldError>{errors.contactEmail?.message}</FieldError>
          </Field>
          <Field invalid={Boolean(errors.contactPhone)}>
            <FieldLabel>Contact phone</FieldLabel>
            <Input autoComplete="tel" type="tel" {...register("contactPhone")} />
            <FieldError>{errors.contactPhone?.message}</FieldError>
          </Field>
          <Field invalid={Boolean(errors.notes)}>
            <FieldLabel>Notes</FieldLabel>
            <FieldDescription>Optional context for the client relationship.</FieldDescription>
            <Textarea maxLength={1000} rows={5} {...register("notes")} />
            <FieldError>{errors.notes?.message}</FieldError>
          </Field>
        </fieldset>
      </DialogBody>
      <DialogFooter>
        <DialogClose disabled={pending} render={<Button variant="outline" />}>
          Cancel
        </DialogClose>
        <Button loading={pending} loadingLabel="Saving client" type="submit">
          Save client
        </Button>
      </DialogFooter>
    </form>
  );
}
