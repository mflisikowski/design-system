"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ComponentPropsWithoutRef } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DialogBody, DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  useFieldControlProps,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  type CreateProjectInput,
  createProjectInputSchema,
  projectStatusLabels,
  projectStatusSchema,
} from "./model";
import { ProjectRepositoryError } from "./repository";

type ProjectFormValues = z.input<typeof createProjectInputSchema>;

type ProjectFormProps = Readonly<{
  onDirtyChange: (dirty: boolean) => void;
  onSubmit: (input: CreateProjectInput) => Promise<void>;
  pending: boolean;
}>;

const defaultValues: ProjectFormValues = {
  description: "",
  name: "",
  status: "planned",
};

function ProjectStatusSelect({ ...props }: Readonly<ComponentPropsWithoutRef<"select">>) {
  const fieldProps = useFieldControlProps(props);

  return (
    <select {...props} {...fieldProps} className="project-form__select">
      {projectStatusSchema.options.map((status) => (
        <option key={status} value={status}>
          {projectStatusLabels[status]}
        </option>
      ))}
    </select>
  );
}

export function ProjectForm({ onDirtyChange, onSubmit, pending }: ProjectFormProps) {
  const [failureFocusTarget, setFailureFocusTarget] = useState<HTMLElement | null>(null);
  const [failedSubmission, setFailedSubmission] = useState<string | null>(null);
  const {
    clearErrors,
    formState: { errors, isDirty },
    handleSubmit,
    register,
    setError,
    setFocus,
  } = useForm<ProjectFormValues, unknown, CreateProjectInput>({
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(createProjectInputSchema),
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

  async function submitValues(input: CreateProjectInput) {
    const activeElement = document.activeElement;
    clearErrors();

    try {
      await onSubmit(input);
    } catch (error) {
      if (error instanceof ProjectRepositoryError) {
        const fieldErrors = Object.entries(error.fieldErrors ?? {}) as [
          keyof ProjectFormValues,
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
      setFailedSubmission("The project could not be saved. Try again.");
    }
  }

  const submit = handleSubmit(submitValues);

  return (
    <form aria-busy={pending || undefined} className="project-form" noValidate onSubmit={submit}>
      <DialogBody>
        {failedSubmission ? (
          <div className="project-form__failure">
            <Alert live tone="danger">
              <AlertTitle>Project could not be saved</AlertTitle>
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
        <fieldset className="project-form__fields" disabled={pending}>
          <Field invalid={Boolean(errors.name)}>
            <FieldLabel>Project name</FieldLabel>
            <Input autoComplete="off" required {...register("name")} />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>
          <Field invalid={Boolean(errors.description)}>
            <FieldLabel>Description</FieldLabel>
            <FieldDescription>Optional context for the project team.</FieldDescription>
            <Textarea maxLength={1000} rows={4} {...register("description")} />
            <FieldError>{errors.description?.message}</FieldError>
          </Field>
          <Field invalid={Boolean(errors.status)}>
            <FieldLabel>Status</FieldLabel>
            <ProjectStatusSelect {...register("status")} />
            <FieldError>{errors.status?.message}</FieldError>
          </Field>
        </fieldset>
      </DialogBody>
      <DialogFooter>
        <DialogClose disabled={pending} render={<Button variant="outline" />}>
          Cancel
        </DialogClose>
        <Button loading={pending} loadingLabel="Saving project" type="submit">
          Save project
        </Button>
      </DialogFooter>
    </form>
  );
}
