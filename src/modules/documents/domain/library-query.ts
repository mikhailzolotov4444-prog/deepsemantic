import {
  CEFR_LEVELS,
  DOCUMENT_TYPES,
  type CefrLevel,
  type DocumentType,
} from "./teaching-document";

export const LIBRARY_PAGE_SIZE = 12;

export interface LibraryQuery {
  readonly text?: string;
  readonly level?: CefrLevel;
  readonly topic?: string;
  readonly type?: DocumentType;
  readonly page: number;
  readonly pageSize: number;
}

/** Raw values from the address bar (?q=...&level=...). Anything unknown is simply ignored. */
export interface RawLibraryQuery {
  readonly q?: string;
  readonly level?: string;
  readonly topic?: string;
  readonly type?: string;
  readonly page?: string;
}

export function parseLibraryQuery(raw: RawLibraryQuery): LibraryQuery {
  const text = raw.q?.trim().slice(0, 100);
  const topic = raw.topic?.trim().toLowerCase().slice(0, 40);
  const level = CEFR_LEVELS.find((candidate) => candidate === raw.level);
  const type = DOCUMENT_TYPES.find((candidate) => candidate === raw.type);
  const page = Number.parseInt(raw.page ?? "1", 10);

  return {
    ...(text ? { text } : {}),
    ...(topic ? { topic } : {}),
    ...(level ? { level } : {}),
    ...(type ? { type } : {}),
    page: Number.isFinite(page) && page >= 1 ? Math.min(page, 1000) : 1,
    pageSize: LIBRARY_PAGE_SIZE,
  };
}
