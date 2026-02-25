import type { FlashcardsSearchState } from "@/lib/flashcards";
import { normalizeFlashcardPath } from "@/lib/flashcards";

export type FlashcardsDeckLabels = {
  question: string;
  answer: string;
  flip: string;
  pass: string;
  confirm: string;
  remaining: string;
  confirmed: string;
  passed: string;
  passedTag: string;
  completedTitle: string;
  restart: string;
  viewReport: string;
};

export type FlashcardsNamedOption = {
  slug: string;
  title: string;
};

export function buildFlashcardsDeckLabels(
  t: (key: string) => string,
): FlashcardsDeckLabels {
  return {
    question: t("flashcardsQuestion"),
    answer: t("flashcardsAnswer"),
    flip: t("flashcardsFlip"),
    pass: t("flashcardsPass"),
    confirm: t("flashcardsConfirm"),
    remaining: t("flashcardsRemaining"),
    confirmed: t("flashcardsConfirmed"),
    passed: t("flashcardsPassed"),
    passedTag: t("flashcardsPassedTag"),
    completedTitle: t("flashcardsCompletedTitle"),
    restart: t("flashcardsRestart"),
    viewReport: t("flashcardsViewReport"),
  };
}

export function normalizeExplorerSearchState(
  state: FlashcardsSearchState,
  courseOptions: Array<FlashcardsNamedOption>,
  topicOptionsByCourse: Map<string, Array<FlashcardsNamedOption>>,
): FlashcardsSearchState {
  const defaultCourse = courseOptions[0]?.slug;
  const validCourses = new Set(courseOptions.map((course) => course.slug));
  const normalizedCourse = state.course
    ? normalizeFlashcardPath(state.course)
    : undefined;
  const course =
    normalizedCourse && validCourses.has(normalizedCourse)
      ? normalizedCourse
      : defaultCourse;

  const scopedTopicOptions = course
    ? (topicOptionsByCourse.get(course) ?? [])
    : [];
  const validTopics = new Set(scopedTopicOptions.map((topic) => topic.slug));
  const defaultTopic = scopedTopicOptions[0]?.slug;
  const normalizedTopic = state.topic
    ? normalizeFlashcardPath(state.topic)
    : undefined;
  const topic =
    normalizedTopic && validTopics.has(normalizedTopic)
      ? normalizedTopic
      : defaultTopic;

  return {
    scope: state.scope,
    mode: state.mode,
    course,
    topic,
  };
}
