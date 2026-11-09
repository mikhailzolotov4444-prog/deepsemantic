"use client";

import { useActionState } from "react";
import {
  DOCUMENT_ACCESS,
  DOCUMENT_TYPES,
  type DocumentFieldError,
} from "../domain/teaching-document";
import { Button } from "@/shared/ui/button";
import {
  initialDocumentFormState,
  type DocumentFormState,
  type DocumentFormValues,
} from "./document-form-state";
import {
  cefrLevelOptions,
  documentAccessLabelsRu,
  documentFieldErrorsRu,
  documentTypeLabelsRu,
  formatFileSize,
} from "./labels-ru";

type DocumentAction = (state: DocumentFormState, formData: FormData) => Promise<DocumentFormState>;

interface DocumentFormProps {
  readonly action: DocumentAction;
  readonly initial: DocumentFormValues;
  /** Present when editing a document that already has a file. */
  readonly currentFile?: { readonly name: string; readonly size: number };
  /** Present when editing. */
  readonly id?: string;
}

const controlClass =
  "w-full rounded-md border border-muted-foreground/60 bg-background px-3 py-2 text-sm " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring " +
  "aria-[invalid=true]:border-destructive";

function FieldError({ field, code }: { field: string; code: DocumentFieldError | undefined }) {
  if (!code) return null;
  return (
    <p id={`document-${field}-error`} className="mt-1 text-sm text-destructive">
      {documentFieldErrorsRu[code]}
    </p>
  );
}

const noticeText = {
  validation: "Проверьте, пожалуйста, выделенные поля.",
  not_found: "Материал не найден. Возможно, его уже удалили.",
  unknown: "Не удалось сохранить. Попробуйте ещё раз через несколько минут.",
} as const;

export function DocumentForm({ action, initial, currentFile, id }: DocumentFormProps) {
  const [state, formAction, pending] = useActionState(action, initialDocumentFormState(initial));
  const { fieldErrors, values } = state;

  const describedBy = (field: keyof typeof fieldErrors) =>
    fieldErrors[field] ? `document-${field}-error` : undefined;

  return (
    <form action={formAction} noValidate className="space-y-5">
      {id ? <input type="hidden" name="id" value={id} /> : null}

      <div>
        <label htmlFor="document-title" className="mb-1 block text-sm font-medium">
          Название
        </label>
        <input
          id="document-title"
          name="title"
          type="text"
          required
          defaultValue={values.title}
          aria-invalid={fieldErrors.title ? true : undefined}
          aria-describedby={describedBy("title")}
          className={controlClass}
        />
        <FieldError field="title" code={fieldErrors.title} />
      </div>

      <div>
        <label htmlFor="document-description" className="mb-1 block text-sm font-medium">
          Описание
        </label>
        <textarea
          id="document-description"
          name="description"
          rows={4}
          defaultValue={values.description}
          aria-invalid={fieldErrors.description ? true : undefined}
          aria-describedby={describedBy("description")}
          className={controlClass}
        />
        <FieldError field="description" code={fieldErrors.description} />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="document-level" className="mb-1 block text-sm font-medium">
            Уровень
          </label>
          <select
            id="document-level"
            name="level"
            defaultValue={values.level}
            aria-invalid={fieldErrors.level ? true : undefined}
            aria-describedby={describedBy("level")}
            className={controlClass}
          >
            {cefrLevelOptions.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <FieldError field="level" code={fieldErrors.level} />
        </div>

        <div>
          <label htmlFor="document-type" className="mb-1 block text-sm font-medium">
            Тип
          </label>
          <select
            id="document-type"
            name="type"
            defaultValue={values.type}
            aria-invalid={fieldErrors.type ? true : undefined}
            aria-describedby={describedBy("type")}
            className={controlClass}
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {documentTypeLabelsRu[type]}
              </option>
            ))}
          </select>
          <FieldError field="type" code={fieldErrors.type} />
        </div>

        <div>
          <label htmlFor="document-access" className="mb-1 block text-sm font-medium">
            Доступ
          </label>
          <select
            id="document-access"
            name="access"
            defaultValue={values.access}
            aria-invalid={fieldErrors.access ? true : undefined}
            aria-describedby={describedBy("access")}
            className={controlClass}
          >
            {DOCUMENT_ACCESS.map((access) => (
              <option key={access} value={access}>
                {documentAccessLabelsRu[access]}
              </option>
            ))}
          </select>
          <FieldError field="access" code={fieldErrors.access} />
        </div>
      </div>

      <div>
        <label htmlFor="document-topics" className="mb-1 block text-sm font-medium">
          Темы (через запятую)
        </label>
        <input
          id="document-topics"
          name="topics"
          type="text"
          defaultValue={values.topics}
          aria-invalid={fieldErrors.topics ? true : undefined}
          aria-describedby={describedBy("topics") ?? "document-topics-hint"}
          className={controlClass}
        />
        <p id="document-topics-hint" className="mt-1 text-sm text-muted-foreground">
          Например: grammar, past simple, travel. Не больше 8 тем.
        </p>
        <FieldError field="topics" code={fieldErrors.topics} />
      </div>

      <div>
        <label htmlFor="document-file" className="mb-1 block text-sm font-medium">
          Файл (PDF или DOCX, до 4 МБ)
        </label>
        {currentFile ? (
          <p className="mb-2 text-sm text-muted-foreground">
            Сейчас загружен: {currentFile.name} ({formatFileSize(currentFile.size)}). Выберите новый
            файл, только если хотите его заменить.
          </p>
        ) : null}
        <input
          id="document-file"
          name="file"
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          aria-invalid={fieldErrors.file ? true : undefined}
          aria-describedby={describedBy("file")}
          className="block w-full text-sm"
        />
        <FieldError field="file" code={fieldErrors.file} />
      </div>

      <div role="status" aria-live="polite">
        {state.status === "error" && state.notice ? (
          <p className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">
            {noticeText[state.notice]}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="intent" value="save" variant="outline" disabled={pending}>
          {pending ? "Сохраняю…" : "Сохранить"}
        </Button>
        <Button type="submit" name="intent" value="publish" disabled={pending}>
          Сохранить и опубликовать
        </Button>
      </div>
    </form>
  );
}
