import type {
  CefrLevel,
  DocumentAccess,
  DocumentFieldError,
  DocumentType,
} from "../domain/teaching-document";

/** Russian texts for the admin area (the admin area is Russian only, see ADR-0004). */
export const documentTypeLabelsRu: Record<DocumentType, string> = {
  worksheet: "Рабочий лист",
  lesson_plan: "План урока",
  guide: "Справочник",
  other: "Другое",
};

export const documentAccessLabelsRu: Record<DocumentAccess, string> = {
  public: "Бесплатно для всех",
  email: "Бесплатно за email",
  paid: "Платный (скоро)",
};

export const documentFieldErrorsRu: Record<DocumentFieldError, string> = {
  title_required: "Введите название.",
  title_too_long: "Название слишком длинное (не больше 150 символов).",
  description_too_long: "Описание слишком длинное (не больше 2000 символов).",
  level_invalid: "Выберите уровень.",
  type_invalid: "Выберите тип.",
  access_invalid: "Выберите доступ.",
  topics_too_many: "Слишком много тем (не больше 8).",
  topic_too_long: "Одна из тем слишком длинная (не больше 40 символов).",
  file_required_to_publish: "Чтобы опубликовать материал, загрузите файл.",
  file_empty: "Файл пустой.",
  file_too_large: "Файл больше 4 МБ.",
  file_type_not_allowed: "Подходят только файлы PDF и DOCX.",
  email_invalid: "Укажите корректный email.",
};

export const cefrLevelOptions: readonly CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} МБ`;
}
