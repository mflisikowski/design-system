"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { DialogBody, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { type CreateClientInput, createClientInputSchema } from "./model";

type ClientFormValues = z.input<typeof createClientInputSchema>;

type ClientFormProps = Readonly<{
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

export function ClientForm({ onSubmit, pending }: ClientFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ClientFormValues, unknown, CreateClientInput>({
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(createClientInputSchema),
    shouldFocusError: true,
  });

  const submit = handleSubmit(onSubmit);

  return (
    <form aria-busy={pending || undefined} className="client-form" noValidate onSubmit={submit}>
      <DialogBody>
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
