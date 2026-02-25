"use client";

import { BookOpenText, Brain, Check, ChevronsUpDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import type { FlashcardsSessionResult } from "@/components/flashcards/deck";
import type {
  FlashcardItem,
  FlashcardTopicDeck,
  FlashcardsRetakeMode,
  FlashcardsSearchState,
} from "@/lib/flashcards";
import {
  FlashcardsInteractive,
  FlashcardsStudy,
} from "@/components/flashcards/deck";
import {
  buildFlashcardsDeckLabels,
  normalizeExplorerSearchState,
} from "@/components/flashcards/shared";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  appendFlashcardsRetakeMode,
  buildCourseDeck,
  buildFlashcardsSearch,
  buildFlashcardsSessionStorageKey,
  buildTopicDeck,
  loadFlashcardsLastReportSummary,
  loadFlashcardsSessionSummary,
  normalizeFlashcardPath,
  normalizeFlashcardsSessionSummary,
  parseFlashcardsRetakeMode,
  parseFlashcardsSearch,
  parseFlashcardsSessionSummary,
  storeFlashcardsLastReportSummary,
  storeFlashcardsSessionSummary,
} from "@/lib/flashcards";
import { getTranslations } from "@/lib/translations";
import { cn } from "@/lib/utils";

export interface FlashcardsExplorerCourse {
  slug: string;
  title: string;
}

export interface FlashcardsExplorerTopic {
  courseSlug: string;
  courseTitle: string;
  topicSlug: string;
  title: string;
  locale: string;
  cards: Array<FlashcardItem>;
}

export interface FlashcardsExplorerData {
  courseSlug: string;
  locale: string;
  courses: Array<FlashcardsExplorerCourse>;
  topics: Array<FlashcardsExplorerTopic>;
}

export function FlashcardsExplorer({
  data,
  interactiveRoute,
}: {
  data: FlashcardsExplorerData;
  interactiveRoute?: string;
}) {
  const { t } = getTranslations(data.locale);

  const topicDecks = useMemo<Array<FlashcardTopicDeck>>(
    () =>
      data.topics.map((topic) => ({
        courseSlug: topic.courseSlug,
        topicSlug: topic.topicSlug,
        locale: topic.locale,
        cards: topic.cards,
      })),
    [data.topics],
  );

  const courseOptions = useMemo(() => {
    const fallback = data.topics.map((topic) => ({
      slug: normalizeFlashcardPath(topic.courseSlug),
      title: topic.courseTitle,
    }));
    const source = data.courses.length > 0 ? data.courses : fallback;

    return [
      ...new Map(
        source.map((course) => [
          normalizeFlashcardPath(course.slug),
          {
            slug: normalizeFlashcardPath(course.slug),
            title: course.title,
          },
        ]),
      ).values(),
    ].sort((a, b) => a.title.localeCompare(b.title, data.locale));
  }, [data.courses, data.locale, data.topics]);

  const topicOptionsByCourse = useMemo(
    () =>
      new Map(
        courseOptions.map((course) => {
          const courseDecks = topicDecks.filter(
            (topicDeck) =>
              normalizeFlashcardPath(topicDeck.courseSlug) === course.slug,
          );

          const options = data.topics
            .filter(
              (topic) =>
                normalizeFlashcardPath(topic.courseSlug) === course.slug,
            )
            .map((topic) => ({
              slug: topic.topicSlug,
              title: topic.title,
              cardCount: buildTopicDeck(courseDecks, topic.topicSlug).length,
            }))
            .sort((a, b) => a.title.localeCompare(b.title, data.locale));

          return [course.slug, options] as const;
        }),
      ),
    [courseOptions, data.locale, data.topics, topicDecks],
  );

  const normalizeState = useCallback(
    (state: FlashcardsSearchState): FlashcardsSearchState => {
      return normalizeExplorerSearchState(
        state,
        courseOptions,
        topicOptionsByCourse,
      );
    },
    [courseOptions, topicOptionsByCourse],
  );

  const [searchState, setSearchState] = useState<FlashcardsSearchState>(() =>
    normalizeState({
      scope: "topic",
      mode: "interactive",
      course: courseOptions[0]?.slug,
    }),
  );
  const [sessionResult, setSessionResult] =
    useState<FlashcardsSessionResult | null>(null);
  const [retakeMode, setRetakeMode] = useState<FlashcardsRetakeMode>("all");
  const sessionStorageKey = useMemo(
    () =>
      buildFlashcardsSessionStorageKey({
        locale: data.locale,
        scope: searchState.scope,
        course: searchState.course,
        topic: searchState.topic,
      }),
    [data.locale, searchState.course, searchState.scope, searchState.topic],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncFromUrl = () => {
      const parsed = parseFlashcardsSearch(window.location.search);
      setSearchState(normalizeState(parsed));
      setRetakeMode(parseFlashcardsRetakeMode(window.location.search));
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);

    return () => {
      window.removeEventListener("popstate", syncFromUrl);
    };
  }, [normalizeState]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRetakeMode("all");

    if (typeof window === "undefined") {
      setSessionResult(null);
      return;
    }

    const parsedSummary = parseFlashcardsSessionSummary(window.location.search);
    if (parsedSummary) {
      setSessionResult(parsedSummary);
      storeFlashcardsSessionSummary(sessionStorageKey, parsedSummary);
      storeFlashcardsLastReportSummary(data.locale, parsedSummary);
      return;
    }

    const fromScopedStorage = loadFlashcardsSessionSummary(sessionStorageKey);
    if (fromScopedStorage) {
      setSessionResult(fromScopedStorage);
      return;
    }

    const fromLastReport = loadFlashcardsLastReportSummary(data.locale);
    if (fromLastReport) {
      setSessionResult(fromLastReport);
      return;
    }

    setSessionResult((previous) =>
      searchState.mode === "study" ? previous : null,
    );
  }, [data.locale, searchState.mode, sessionStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = buildFlashcardsSearch(searchState);
    const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    if (
      `${window.location.pathname}${window.location.search}${window.location.hash}` !==
      url
    ) {
      window.history.pushState({}, "", url);
    }
  }, [searchState]);

  const updateState = (next: Partial<FlashcardsSearchState>) => {
    setSearchState((previous) => {
      const merged: FlashcardsSearchState = {
        scope: next.scope ?? previous.scope,
        mode: next.mode ?? previous.mode,
        course: next.course ?? previous.course,
        topic: next.topic ?? previous.topic,
      };
      return normalizeState(merged);
    });
  };

  const topicOptions = useMemo(
    () =>
      searchState.course
        ? (topicOptionsByCourse.get(searchState.course) ?? [])
        : [],
    [searchState.course, topicOptionsByCourse],
  );
  const courseDropdownOptions = useMemo(
    () =>
      courseOptions.map((course) => ({
        value: course.slug,
        label: course.title,
      })),
    [courseOptions],
  );
  const topicDropdownOptions = useMemo(
    () =>
      topicOptions.map((topic) => ({
        value: topic.slug,
        label: `${topic.title} (${topic.cardCount})`,
      })),
    [topicOptions],
  );

  const scopedTopicDecks = useMemo(
    () =>
      topicDecks.filter(
        (topicDeck) =>
          normalizeFlashcardPath(topicDeck.courseSlug) === searchState.course,
      ),
    [searchState.course, topicDecks],
  );
  const topicTitlesBySlug = useMemo(
    () =>
      new Map(
        data.topics.map((topic) => [
          normalizeFlashcardPath(topic.topicSlug),
          topic.title,
        ]),
      ),
    [data.topics],
  );

  const courseCards = useMemo(
    () => buildCourseDeck(scopedTopicDecks),
    [scopedTopicDecks],
  );

  const cards = useMemo(() => {
    if (searchState.scope === "course") {
      return courseCards;
    }

    if (!searchState.topic) {
      return [];
    }

    return buildTopicDeck(scopedTopicDecks, searchState.topic);
  }, [courseCards, scopedTopicDecks, searchState.scope, searchState.topic]);
  const filteredSessionResult = useMemo(() => {
    if (!sessionResult) {
      return null;
    }

    return normalizeFlashcardsSessionSummary(
      sessionResult,
      cards.map((card) => card.id),
    );
  }, [cards, sessionResult]);
  const sessionSummary = useMemo(() => {
    if (!filteredSessionResult) {
      return null;
    }

    const passedCount = filteredSessionResult.confirmIds.length;
    const notPassedCount = Math.max(0, cards.length - passedCount);

    return {
      passedCount,
      notPassedCount,
    };
  }, [cards.length, filteredSessionResult]);
  const gameCards = useMemo(() => {
    if (retakeMode !== "discarded" || !filteredSessionResult) {
      return cards;
    }

    const discardedSet = new Set(filteredSessionResult.passIds);
    return cards.filter((card) => discardedSet.has(card.id));
  }, [cards, filteredSessionResult, retakeMode]);
  const highlightedPassedCards = useMemo(
    () => new Set(filteredSessionResult?.confirmIds ?? []),
    [filteredSessionResult],
  );
  const interactiveHrefForMode = useCallback(
    (mode: FlashcardsRetakeMode) => {
      if (!interactiveRoute) {
        return undefined;
      }

      const params = new URLSearchParams(
        buildFlashcardsSearch({
          scope: searchState.scope,
          mode: "interactive",
          course: searchState.course,
          topic: searchState.topic,
        }),
      );
      appendFlashcardsRetakeMode(params, mode);
      return `${interactiveRoute}?${params.toString()}`;
    },
    [
      interactiveRoute,
      searchState.course,
      searchState.scope,
      searchState.topic,
    ],
  );
  const interactiveHref = interactiveHrefForMode(retakeMode);

  const selectedCourse = courseOptions.find(
    (course) => course.slug === searchState.course,
  );
  const fallbackCourseTitle =
    courseOptions.length > 0
      ? courseOptions[0].title
      : t("flashcardsScopeCourse");
  const selectedCourseTitle = selectedCourse
    ? selectedCourse.title
    : fallbackCourseTitle;
  const firstTopicTitle = topicOptions[0]?.title ?? selectedCourseTitle;
  const selectedTopicTitle = firstTopicTitle
    ? (topicOptions.find((topic) => topic.slug === searchState.topic)?.title ??
      firstTopicTitle)
    : t("flashcardsScopeCourse");

  const labels = buildFlashcardsDeckLabels(t);

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-4">
      <section className="bg-card rounded-xl border p-3 sm:p-4">
        <div
          className={cn(
            "grid gap-2.5",
            searchState.scope === "topic"
              ? "lg:grid-cols-[12rem_14rem_minmax(14rem,1fr)_minmax(16rem,1.2fr)]"
              : "lg:grid-cols-[12rem_14rem_minmax(14rem,1fr)]",
            "lg:items-end",
          )}
        >
          <div className="grid gap-2">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
              {t("flashcardsScopeLabel")}
            </p>
            <div className="grid w-full grid-cols-2 rounded-lg border p-1">
              <SegmentedButton
                active={searchState.scope === "topic"}
                onClick={() => updateState({ scope: "topic" })}
                label={t("flashcardsScopeTopic")}
              />
              <SegmentedButton
                active={searchState.scope === "course"}
                onClick={() => updateState({ scope: "course" })}
                label={t("flashcardsScopeCourse")}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
              {t("flashcardsModeLabel")}
            </p>
            <div className="grid w-full grid-cols-2 rounded-lg border p-1">
              <SegmentedButton
                active={searchState.mode === "study"}
                onClick={() => updateState({ mode: "study" })}
                label={t("flashcardsModeStudy")}
                icon={BookOpenText}
              />
              <SegmentedButton
                active={searchState.mode === "interactive"}
                onClick={() => {
                  setRetakeMode("all");
                  updateState({ mode: "interactive" });
                }}
                label={t("flashcardsModeInteractive")}
                icon={Brain}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
              {t("flashcardsCourseLabel")}
            </p>
            <DropdownSelect
              value={searchState.course ?? ""}
              onValueChange={(value) => updateState({ course: value })}
              options={courseDropdownOptions}
              placeholder={t("flashcardsNoCards")}
              disabled={courseDropdownOptions.length === 0}
            />
          </div>

          {searchState.scope === "topic" ? (
            <div className="grid gap-2">
              <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                {t("flashcardsTopicLabel")}
              </p>
              <DropdownSelect
                value={searchState.topic ?? ""}
                onValueChange={(value) => updateState({ topic: value })}
                options={topicDropdownOptions}
                placeholder={t("flashcardsNoTopic")}
                disabled={topicDropdownOptions.length === 0}
              />
            </div>
          ) : null}
        </div>
      </section>

      {cards.length === 0 ? (
        <section className="bg-card text-muted-foreground rounded-xl border p-8 text-center">
          {t("flashcardsNoCards")}
        </section>
      ) : searchState.mode === "study" ? (
        <section className="grid gap-4">
          {filteredSessionResult && sessionSummary ? (
            <div className="bg-card rounded-xl border p-4">
              <p className="text-sm font-semibold">
                {t("flashcardsResultsTitle")}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <ResultPill
                  label={t("flashcardsResultsNotPassed")}
                  value={sessionSummary.notPassedCount}
                  tone="warn"
                />
                <ResultPill
                  label={t("flashcardsResultsPassed")}
                  value={sessionSummary.passedCount}
                  tone="success"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setRetakeMode("all");
                    const href = interactiveHrefForMode("all");
                    if (href && typeof window !== "undefined") {
                      window.location.assign(href);
                      return;
                    }

                    updateState({ mode: "interactive" });
                  }}
                >
                  {t("flashcardsRetakeAll")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={filteredSessionResult.passIds.length === 0}
                  onClick={() => {
                    setRetakeMode("discarded");
                    const href = interactiveHrefForMode("discarded");
                    if (href && typeof window !== "undefined") {
                      window.location.assign(href);
                      return;
                    }

                    updateState({ mode: "interactive" });
                  }}
                >
                  {t("flashcardsRetakePassedOnly")}
                </Button>
              </div>
            </div>
          ) : null}
          <FlashcardsStudy
            cards={cards}
            labels={labels}
            highlightedCardIds={highlightedPassedCards}
            topicTitlesBySlug={topicTitlesBySlug}
          />
        </section>
      ) : (
        <section className="py-2 sm:py-3">
          {interactiveHref ? (
            <div className="flex justify-center">
              <Button
                type="button"
                nativeButton={false}
                className="h-12 min-w-56 rounded-xl border border-sky-300/35 bg-[linear-gradient(135deg,#1d4ed8,#0891b2)] px-7 text-base font-semibold text-white shadow-[0_18px_35px_-18px_rgba(8,145,178,0.55)] transition hover:scale-[1.02] hover:brightness-105 active:scale-[0.99]"
                render={<a href={interactiveHref} />}
              >
                <Brain className="size-4" />
                {t("flashcardsEnterGame")}
              </Button>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground mb-4 text-xs">
                {searchState.scope === "course"
                  ? selectedCourseTitle
                  : selectedTopicTitle}
              </p>
              <FlashcardsInteractive
                cards={gameCards}
                labels={labels}
                onSessionComplete={(result) => {
                  setSessionResult(result);
                  storeFlashcardsSessionSummary(sessionStorageKey, result);
                  setRetakeMode("all");
                  updateState({ mode: "study" });
                }}
              />
            </>
          )}
        </section>
      )}
    </div>
  );
}

function SegmentedButton({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-10 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
    >
      {Icon ? <Icon className="size-4" /> : null}
      {label}
    </button>
  );
}

type DropdownOption = {
  value: string;
  label: string;
};

function DropdownSelect({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<DropdownOption>;
  placeholder: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <Popover
      open={disabled ? false : open}
      onOpenChange={(next) => {
        if (!disabled) {
          setOpen(next);
        }
      }}
    >
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full justify-between rounded-lg px-3 text-sm font-normal"
            disabled={disabled}
          />
        }
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronsUpDown className="text-muted-foreground size-4" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[--anchor-width] p-1">
        {options.length === 0 ? (
          <p className="text-muted-foreground px-2 py-1.5 text-sm">
            {placeholder}
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "size-4",
                    option.value === value ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="truncate">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function ResultPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warn";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-2",
        tone === "success" && "border-success/30 bg-success/5",
        tone === "warn" && "border-warn/35 bg-warn/10",
      )}
    >
      <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {label}
      </span>
      <span className="ml-auto text-sm font-bold">{value}</span>
    </div>
  );
}
