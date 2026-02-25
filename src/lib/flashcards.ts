import type { ReactNode } from "react";

export type FlashcardScope = "topic" | "course";
export type FlashcardMode = "study" | "interactive";
export type FlashcardsRetakeMode = "all" | "discarded";

export interface FlashcardItem {
  id: string;
  question: ReactNode;
  answer: ReactNode;
  topicSlug: string;
  courseSlug: string;
}

export interface FlashcardTopicDeck {
  courseSlug: string;
  topicSlug: string;
  locale: string;
  cards: Array<FlashcardItem>;
}

export interface FlashcardsSearchState {
  scope: FlashcardScope;
  mode: FlashcardMode;
  course?: string;
  topic?: string;
}

export interface FlashcardsSearchInput {
  scope?: FlashcardScope;
  mode?: FlashcardMode;
  course?: string;
  topic?: string;
}

export interface FlashcardsSessionSummary {
  passIds: Array<string>;
  confirmIds: Array<string>;
}

export interface FlashcardsSessionStorageInput {
  locale: string;
  scope: FlashcardScope;
  course?: string;
  topic?: string;
}

export interface FlashcardDataFilePath {
  courseSlug: string;
  topicSlug: string;
  locale: string;
}

const FLASHCARD_DATA_PATH_PATTERN =
  /^(?<topic>.+)\/flashcards\.(?<locale>[a-z0-9-]+)\.mdx$/i;
const FLASHCARDS_RESULT_CONFIRMED_PARAM = "fc_confirmed";
const FLASHCARDS_RESULT_PASSED_PARAM = "fc_passed";
const FLASHCARDS_RETAKE_PARAM = "fc_retake";
const FLASHCARDS_RESULT_STORAGE_PREFIX = "open-physica:flashcards:result:v1";
const FLASHCARDS_LAST_REPORT_STORAGE_PREFIX =
  "open-physica:flashcards:last-report:v1";

export function normalizeFlashcardPath(value: string): string {
  return value
    .trim()
    .replaceAll(/\/+/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

function getCourseFromPath(path: string): string | undefined {
  const normalized = normalizeFlashcardPath(path);
  if (!normalized) return undefined;

  const [course] = normalized.split("/");
  return course || undefined;
}

export function parseFlashcardDataPath(
  path: string,
): FlashcardDataFilePath | undefined {
  const normalized = normalizeFlashcardPath(path);
  const match = normalized.match(FLASHCARD_DATA_PATH_PATTERN);

  if (!match?.groups?.topic || !match.groups.locale) {
    return undefined;
  }

  const topicSlug = normalizeFlashcardPath(match.groups.topic);
  const courseSlug = getCourseFromPath(topicSlug);
  if (!courseSlug) {
    return undefined;
  }

  return {
    courseSlug,
    topicSlug,
    locale: match.groups.locale.toLowerCase(),
  };
}

export function buildFlashcardsSearch(search: FlashcardsSearchInput): string {
  const params = new URLSearchParams();
  const scope = search.scope ?? "topic";
  const mode = search.mode ?? "interactive";

  params.set("scope", scope);
  params.set("mode", mode);

  if (search.course) {
    params.set("course", normalizeFlashcardPath(search.course));
  }

  if (search.topic) {
    params.set("topic", normalizeFlashcardPath(search.topic));
  }

  return params.toString();
}

export function parseFlashcardsSearch(
  raw: string | URLSearchParams | Record<string, unknown>,
): FlashcardsSearchState {
  const params = toSearchParams(raw);
  const scopeValue = params.get("scope");
  const modeValue = params.get("mode");
  const courseValue = params.get("course");
  const topicValue = params.get("topic");

  return {
    scope: scopeValue === "course" ? "course" : "topic",
    mode: modeValue === "study" ? "study" : "interactive",
    course: courseValue ? normalizeFlashcardPath(courseValue) : undefined,
    topic: topicValue ? normalizeFlashcardPath(topicValue) : undefined,
  };
}

export function appendFlashcardsSessionSummary(
  params: URLSearchParams,
  summary: FlashcardsSessionSummary,
): void {
  params.delete(FLASHCARDS_RESULT_CONFIRMED_PARAM);
  params.delete(FLASHCARDS_RESULT_PASSED_PARAM);

  for (const id of sanitizeFlashcardIds(summary.confirmIds)) {
    params.append(FLASHCARDS_RESULT_CONFIRMED_PARAM, id);
  }

  for (const id of sanitizeFlashcardIds(summary.passIds)) {
    params.append(FLASHCARDS_RESULT_PASSED_PARAM, id);
  }
}

export function appendFlashcardsRetakeMode(
  params: URLSearchParams,
  mode: FlashcardsRetakeMode,
): void {
  params.delete(FLASHCARDS_RETAKE_PARAM);

  if (mode === "discarded") {
    params.set(FLASHCARDS_RETAKE_PARAM, "discarded");
  }
}

export function parseFlashcardsRetakeMode(
  raw: string | URLSearchParams | Record<string, unknown>,
): FlashcardsRetakeMode {
  const params = toSearchParams(raw);
  return params.get(FLASHCARDS_RETAKE_PARAM) === "discarded"
    ? "discarded"
    : "all";
}

export function buildFlashcardsSessionStorageKey(
  input: FlashcardsSessionStorageInput,
): string {
  const locale = normalizeFlashcardPath(input.locale) || "it";
  const scope = input.scope === "course" ? "course" : "topic";
  const course = input.course ? normalizeFlashcardPath(input.course) : "__all";
  const topic =
    scope === "topic"
      ? input.topic
        ? normalizeFlashcardPath(input.topic)
        : "__all"
      : "__course";

  return `${FLASHCARDS_RESULT_STORAGE_PREFIX}:${locale}:${course}:${scope}:${topic}`;
}

export function buildFlashcardsLastReportStorageKey(locale: string): string {
  const normalizedLocale = normalizeFlashcardPath(locale) || "it";
  return `${FLASHCARDS_LAST_REPORT_STORAGE_PREFIX}:${normalizedLocale}`;
}

export function storeFlashcardsSessionSummary(
  storageKey: string,
  summary: FlashcardsSessionSummary,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const confirmIds = sanitizeFlashcardIds(summary.confirmIds);
  const passIds = sanitizeFlashcardIds(summary.passIds);
  if (confirmIds.length === 0 && passIds.length === 0) {
    window.localStorage.removeItem(storageKey);
    return;
  }

  window.localStorage.setItem(
    storageKey,
    JSON.stringify({
      confirmIds,
      passIds,
      savedAt: Date.now(),
    }),
  );
}

export function storeFlashcardsLastReportSummary(
  locale: string,
  summary: FlashcardsSessionSummary,
): void {
  storeFlashcardsSessionSummary(
    buildFlashcardsLastReportStorageKey(locale),
    summary,
  );
}

export function loadFlashcardsSessionSummary(
  storageKey: string,
): FlashcardsSessionSummary | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const object = parsed as Record<string, unknown>;
    const confirmIds = sanitizeFlashcardIds(
      Array.isArray(object.confirmIds)
        ? object.confirmIds.filter(
            (value): value is string => typeof value === "string",
          )
        : [],
    );
    const passIds = sanitizeFlashcardIds(
      Array.isArray(object.passIds)
        ? object.passIds.filter(
            (value): value is string => typeof value === "string",
          )
        : [],
    );

    if (confirmIds.length === 0 && passIds.length === 0) {
      return null;
    }

    return {
      confirmIds,
      passIds,
    };
  } catch {
    return null;
  }
}

export function loadFlashcardsLastReportSummary(
  locale: string,
): FlashcardsSessionSummary | null {
  return loadFlashcardsSessionSummary(
    buildFlashcardsLastReportStorageKey(locale),
  );
}

export function parseFlashcardsSessionSummary(
  raw: string | URLSearchParams | Record<string, unknown>,
): FlashcardsSessionSummary | null {
  const params = toSearchParams(raw);
  const confirmIds = sanitizeFlashcardIds(
    params.getAll(FLASHCARDS_RESULT_CONFIRMED_PARAM),
  );
  const passIds = sanitizeFlashcardIds(
    params.getAll(FLASHCARDS_RESULT_PASSED_PARAM),
  );

  if (confirmIds.length === 0 && passIds.length === 0) {
    return null;
  }

  return {
    confirmIds,
    passIds,
  };
}

export function filterFlashcardsSessionSummary(
  summary: FlashcardsSessionSummary,
  deckCardIds: Array<string>,
): FlashcardsSessionSummary | null {
  const availableCardIds = new Set(deckCardIds);
  const confirmIds = sanitizeFlashcardIds(summary.confirmIds).filter((id) =>
    availableCardIds.has(id),
  );
  const confirmedSet = new Set(confirmIds);
  const passIds = sanitizeFlashcardIds(summary.passIds).filter(
    (id) => availableCardIds.has(id) && !confirmedSet.has(id),
  );

  if (confirmIds.length === 0 && passIds.length === 0) {
    return null;
  }

  return {
    confirmIds,
    passIds,
  };
}

export function normalizeFlashcardsSessionSummary(
  summary: FlashcardsSessionSummary,
  deckCardIds: Array<string>,
): FlashcardsSessionSummary | null {
  const normalizedDeckIds = sanitizeFlashcardIds(deckCardIds);
  if (normalizedDeckIds.length === 0) {
    return null;
  }

  const availableCardIds = new Set(normalizedDeckIds);
  const confirmIds = sanitizeFlashcardIds(summary.confirmIds).filter((id) =>
    availableCardIds.has(id),
  );
  const confirmedSet = new Set(confirmIds);
  const passIds = normalizedDeckIds.filter((id) => !confirmedSet.has(id));

  return {
    confirmIds,
    passIds,
  };
}

export function isSameOrDescendantTopic(
  topic: string,
  selectedTopic: string,
): boolean {
  const normalizedTopic = normalizeFlashcardPath(topic);
  const normalizedSelected = normalizeFlashcardPath(selectedTopic);

  if (!normalizedTopic || !normalizedSelected) {
    return false;
  }

  return (
    normalizedTopic === normalizedSelected ||
    normalizedTopic.startsWith(`${normalizedSelected}/`)
  );
}

export function selectLocalizedTopicFiles<
  T extends { topicSlug: string; locale: string },
>(files: Array<T>, locale: string): Array<T> {
  const normalizedLocale = normalizeFlashcardPath(locale);
  const grouped = new Map<string, Array<T>>();

  for (const file of files) {
    const topic = normalizeFlashcardPath(file.topicSlug);
    const variants = grouped.get(topic);

    if (variants) {
      variants.push(file);
    } else {
      grouped.set(topic, [file]);
    }
  }

  const sortedTopics = [...grouped.keys()].sort((a, b) => a.localeCompare(b));

  return sortedTopics
    .map((topic) => {
      const variants = grouped.get(topic) ?? [];
      return variants.find(
        (entry) => normalizeFlashcardPath(entry.locale) === normalizedLocale,
      );
    })
    .filter((entry): entry is T => Boolean(entry));
}

export function buildCourseDeck(
  topicDecks: Array<FlashcardTopicDeck>,
): Array<FlashcardItem> {
  const inOrder = [...topicDecks]
    .sort((a, b) =>
      normalizeFlashcardPath(a.topicSlug).localeCompare(
        normalizeFlashcardPath(b.topicSlug),
      ),
    )
    .flatMap((topicDeck) => topicDeck.cards);

  return dedupeFlashcardsById(inOrder);
}

export function buildTopicDeck(
  topicDecks: Array<FlashcardTopicDeck>,
  selectedTopic: string,
): Array<FlashcardItem> {
  const normalizedSelectedTopic = normalizeFlashcardPath(selectedTopic);
  if (!normalizedSelectedTopic) {
    return [];
  }

  const inOrder = [...topicDecks]
    .filter((topicDeck) =>
      isSameOrDescendantTopic(topicDeck.topicSlug, normalizedSelectedTopic),
    )
    .sort((a, b) =>
      normalizeFlashcardPath(a.topicSlug).localeCompare(
        normalizeFlashcardPath(b.topicSlug),
      ),
    )
    .flatMap((topicDeck) => topicDeck.cards);

  return dedupeFlashcardsById(inOrder);
}

function dedupeFlashcardsById(
  cards: Array<FlashcardItem>,
): Array<FlashcardItem> {
  const seen = new Set<string>();
  const deduped: Array<FlashcardItem> = [];

  for (const card of cards) {
    if (seen.has(card.id)) {
      continue;
    }

    seen.add(card.id);
    deduped.push(card);
  }

  return deduped;
}

function sanitizeFlashcardIds(ids: Array<string>): Array<string> {
  const seen = new Set<string>();
  const normalized: Array<string> = [];

  for (const raw of ids) {
    const value = raw.trim();
    if (!value || seen.has(value)) {
      continue;
    }

    seen.add(value);
    normalized.push(value);
  }

  return normalized;
}

function toSearchParams(
  raw: string | URLSearchParams | Record<string, unknown>,
): URLSearchParams {
  if (typeof raw === "string") {
    const value = raw.startsWith("?") ? raw.slice(1) : raw;
    return new URLSearchParams(value);
  }

  if (raw instanceof URLSearchParams) {
    return raw;
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") {
      params.set(key, value);
    }
  }

  return params;
}
