import { findParent } from "fumadocs-core/page-tree";
import type { FlashcardsExplorerData } from "@/components/flashcards/explorer";
import { normalizeFlashcardPath } from "@/lib/flashcards";
import { source } from "@/lib/source";

export async function getFlashcardsExplorerData(
  locale: string,
): Promise<FlashcardsExplorerData> {
  const { getActiveCourses, getFlashcardCourseSnapshot } =
    await import("@/lib/flashcards.server");

  const snapshots = await Promise.all(
    getActiveCourses().map((courseSlug) =>
      getFlashcardCourseSnapshot(courseSlug, locale),
    ),
  );

  const topics = snapshots.flatMap((snapshot) => {
    const courseTitle = getCourseTitle(snapshot.courseSlug, locale);

    return snapshot.topics
      .filter((topic) => topic.cards.length > 0)
      .map((topic) => ({
        courseSlug: snapshot.courseSlug,
        courseTitle,
        topicSlug: topic.topicSlug,
        title: getTopicTitle(topic.topicSlug, locale),
        locale: topic.locale,
        cards: topic.cards,
      }));
  });
  const courses = snapshots.map((snapshot) => ({
    slug: snapshot.courseSlug,
    title: getCourseTitle(snapshot.courseSlug, locale),
  }));

  return {
    courseSlug: "all-courses",
    locale,
    courses,
    topics,
  };
}

function getTopicTitle(topicSlug: string, locale: string): string {
  const page = getPageBySlugPath(topicSlug, locale);
  if (page?.data.title) {
    return page.data.title;
  }

  return topicSlug;
}

function getCourseTitle(courseSlug: string, locale: string): string {
  const page = getPageBySlugPath(courseSlug, locale);
  if (!page) {
    return courseSlug;
  }

  const parent = findParent(source.getPageTree(locale), page.url);
  if (parent && "type" in parent) {
    const meta = source.getNodeMeta(parent, locale);
    if (meta?.data.title) {
      return meta.data.title;
    }
  }

  return page.data.title;
}

function getPageBySlugPath(slugPath: string, locale: string) {
  const normalized = normalizeFlashcardPath(slugPath);
  if (!normalized) {
    return undefined;
  }

  return source
    .getPages(locale)
    .find(
      (page) => normalizeFlashcardPath(page.slugs.join("/")) === normalized,
    );
}
