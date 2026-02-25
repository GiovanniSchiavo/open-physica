"use client";

import { FlashcardsInteractive } from "@/components/flashcards/deck";
import {
  buildFlashcardsDeckLabels,
  normalizeExplorerSearchState,
} from "@/components/flashcards/shared";
import { Button } from "@/components/ui/button";
import type {
  FlashcardTopicDeck,
  FlashcardsSearchState,
} from "@/lib/flashcards";
import type { FlashcardsLoaderData } from "@/lib/flashcards-loader.server";
import {
  appendFlashcardsSessionSummary,
  buildCourseDeck,
  buildFlashcardsSearch,
  buildFlashcardsSessionStorageKey,
  buildTopicDeck,
  filterFlashcardsSessionSummary,
  loadFlashcardsSessionSummary,
  normalizeFlashcardPath,
  normalizeFlashcardsSessionSummary,
  parseFlashcardsRetakeMode,
  parseFlashcardsSearch,
  parseFlashcardsSessionSummary,
  storeFlashcardsLastReportSummary,
  storeFlashcardsSessionSummary,
} from "@/lib/flashcards";
import { localizePath } from "@/lib/locale";
import { getTranslations } from "@/lib/translations";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { baseOptions } from "@/lib/layout.shared";

export function FlashcardsPlayClient({
  lang,
  data,
}: {
  lang: string;
  data: FlashcardsLoaderData;
}) {
  const { t } = getTranslations(lang);
  const searchParams = useSearchParams();

  const topicDecks = useMemo<Array<FlashcardTopicDeck>>(
    () =>
      data.explorer.topics.map((topic) => ({
        courseSlug: topic.courseSlug,
        topicSlug: topic.topicSlug,
        locale: topic.locale,
        cards: topic.cards,
      })),
    [data.explorer.topics],
  );
  const courseOptions = useMemo(() => {
    const fallback = data.explorer.topics.map((topic) => ({
      slug: normalizeFlashcardPath(topic.courseSlug),
      title: topic.courseTitle,
    }));
    const source =
      data.explorer.courses.length > 0 ? data.explorer.courses : fallback;

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
    ].sort((a, b) => a.title.localeCompare(b.title, lang));
  }, [data.explorer.courses, data.explorer.topics, lang]);
  const topicOptionsByCourse = useMemo(
    () =>
      new Map(
        courseOptions.map((course) => {
          const options = data.explorer.topics
            .filter(
              (topic) =>
                normalizeFlashcardPath(topic.courseSlug) === course.slug,
            )
            .map((topic) => ({
              slug: topic.topicSlug,
              title: topic.title,
            }))
            .sort((a, b) => a.title.localeCompare(b.title, lang));

          return [course.slug, options] as const;
        }),
      ),
    [courseOptions, data.explorer.topics, lang],
  );

  const normalizedState = useMemo<FlashcardsSearchState>(() => {
    const parsed = parseFlashcardsSearch(searchParams);
    return normalizeExplorerSearchState(
      {
        ...parsed,
        mode: "interactive",
      },
      courseOptions,
      topicOptionsByCourse,
    );
  }, [courseOptions, searchParams, topicOptionsByCourse]);

  const scopedTopicDecks = useMemo(
    () =>
      topicDecks.filter(
        (topicDeck) =>
          normalizeFlashcardPath(topicDeck.courseSlug) ===
          normalizedState.course,
      ),
    [normalizedState.course, topicDecks],
  );
  const cards = useMemo(() => {
    if (normalizedState.scope === "course") {
      return buildCourseDeck(scopedTopicDecks);
    }

    if (!normalizedState.topic) {
      return [];
    }

    return buildTopicDeck(scopedTopicDecks, normalizedState.topic);
  }, [normalizedState.scope, normalizedState.topic, scopedTopicDecks]);
  const sessionStorageKey = useMemo(
    () =>
      buildFlashcardsSessionStorageKey({
        locale: lang,
        scope: normalizedState.scope,
        course: normalizedState.course,
        topic: normalizedState.topic,
      }),
    [
      lang,
      normalizedState.course,
      normalizedState.scope,
      normalizedState.topic,
    ],
  );
  const retakeMode = useMemo(
    () => parseFlashcardsRetakeMode(searchParams),
    [searchParams],
  );
  const gameCards = useMemo(() => {
    if (retakeMode !== "discarded") {
      return cards;
    }

    const fromUrl = parseFlashcardsSessionSummary(searchParams);
    const sourceSummary =
      fromUrl ??
      (typeof window === "undefined"
        ? null
        : loadFlashcardsSessionSummary(sessionStorageKey));
    if (!sourceSummary) {
      return [];
    }

    const parsedSummary = filterFlashcardsSessionSummary(
      sourceSummary,
      cards.map((card) => card.id),
    );
    if (!parsedSummary) {
      return [];
    }

    const discardedSet = new Set(parsedSummary.passIds);
    return cards.filter((card) => discardedSet.has(card.id));
  }, [cards, searchParams, retakeMode, sessionStorageKey]);
  const selectedCourseTitle = useMemo(
    () =>
      courseOptions.find((course) => course.slug === normalizedState.course)
        ?.title ?? t("flashcardsScopeCourse"),
    [courseOptions, normalizedState.course, t],
  );
  const selectedTopicTitle = useMemo(
    () =>
      data.explorer.topics.find(
        (topic) =>
          normalizeFlashcardPath(topic.topicSlug) === normalizedState.topic,
      )?.title ?? selectedCourseTitle,
    [data.explorer.topics, normalizedState.topic, selectedCourseTitle],
  );
  const labels = buildFlashcardsDeckLabels(t);
  const selectedTopicLabel =
    normalizedState.scope === "course"
      ? t("flashcardsTopicAll")
      : selectedTopicTitle;

  return (
    <HomeLayout {...baseOptions(lang)} nav={{ enabled: false }}>
      <main className="mx-auto flex h-svh min-h-svh w-full max-w-none flex-col overflow-x-visible overflow-y-hidden px-3 py-2 sm:px-4 sm:py-3">
        <header className="z-20 pb-2 sm:pb-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              nativeButton={false}
              className="h-8 w-fit rounded-xl px-2.5 sm:h-9 sm:px-3"
              render={
                <a
                  href={localizePath("/flashcards", lang)}
                  className="inline-flex items-center gap-1.5"
                />
              }
            >
              <ArrowLeft className="size-4" />
              <span>{t("flashcards")}</span>
            </Button>
            <p className="text-muted-foreground min-w-0 truncate text-xs font-medium sm:text-sm">
              {`${selectedCourseTitle} / ${selectedTopicLabel}`}
            </p>
          </div>
        </header>
        {gameCards.length === 0 ? (
          <section className="bg-card text-muted-foreground rounded-xl border p-8 text-center">
            {t("flashcardsNoCards")}
          </section>
        ) : (
          <section className="min-h-0 flex-1">
            <FlashcardsInteractive
              className="h-full min-h-0"
              cards={gameCards}
              labels={labels}
              onSessionComplete={(rawSummary) => {
                const summary = normalizeFlashcardsSessionSummary(
                  rawSummary,
                  cards.map((card) => card.id),
                );
                if (!summary) {
                  return;
                }
                storeFlashcardsSessionSummary(sessionStorageKey, summary);
                storeFlashcardsLastReportSummary(lang, summary);
              }}
              onViewReport={(rawSummary) => {
                if (typeof window === "undefined") {
                  return;
                }

                const summary = normalizeFlashcardsSessionSummary(
                  rawSummary,
                  cards.map((card) => card.id),
                );
                if (!summary) {
                  return;
                }
                storeFlashcardsSessionSummary(sessionStorageKey, summary);
                storeFlashcardsLastReportSummary(lang, summary);

                const params = new URLSearchParams(
                  buildFlashcardsSearch({
                    scope: normalizedState.scope,
                    mode: "study",
                    course: normalizedState.course,
                    topic: normalizedState.topic,
                  }),
                );
                appendFlashcardsSessionSummary(params, summary);

                window.location.assign(
                  `${localizePath("/flashcards", lang)}?${params.toString()}`,
                );
              }}
            />
          </section>
        )}
      </main>
    </HomeLayout>
  );
}
