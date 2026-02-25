import { flashcardData } from "../../.source/server";
import { Children, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import type { DocData } from "fumadocs-mdx/runtime/types";
import type { FlashcardItem, FlashcardTopicDeck } from "@/lib/flashcards";
import {
  normalizeFlashcardPath,
  parseFlashcardDataPath,
  selectLocalizedTopicFiles,
} from "@/lib/flashcards";

// Marker component types used only for element-tree traversal.
// They are never called/rendered; they serve as unique type identifiers.
function FlashcardMarker(): null {
  return null;
}
function QuestionMarker(): null {
  return null;
}
function AnswerMarker(): null {
  return null;
}

interface FlashcardSourceFile {
  path: string;
  courseSlug: string;
  topicSlug: string;
  locale: string;
  load: () => Promise<Pick<DocData, "body">>;
}

export interface FlashcardCourseSnapshot {
  courseSlug: string;
  requestedLocale: string;
  topics: Array<FlashcardTopicDeck>;
}

export function getActiveCourses(): string[] {
  return [...new Set(getFlashcardSourceFiles().map((f) => f.courseSlug))];
}

export function isFlashcardCourseActive(courseSlug: string): boolean {
  return getFlashcardSourceFiles().some(
    (f) => f.courseSlug === normalizeFlashcardPath(courseSlug),
  );
}

export async function getFlashcardCourseSnapshot(
  courseSlug: string,
  locale: string,
): Promise<FlashcardCourseSnapshot> {
  const normalizedCourse = normalizeFlashcardPath(courseSlug);
  const normalizedLocale = normalizeFlashcardPath(locale);

  if (!isFlashcardCourseActive(normalizedCourse)) {
    return {
      courseSlug: normalizedCourse,
      requestedLocale: normalizedLocale,
      topics: [],
    };
  }

  const candidates = getFlashcardSourceFiles().filter(
    (file) => file.courseSlug === normalizedCourse,
  );
  const selectedFiles = selectLocalizedTopicFiles(
    candidates,
    normalizedLocale,
  ).sort((a, b) => a.topicSlug.localeCompare(b.topicSlug));

  const topics = await Promise.all(
    selectedFiles.map(async (file) => ({
      courseSlug: file.courseSlug,
      topicSlug: file.topicSlug,
      locale: file.locale,
      cards: await getCardsForFile(file),
    })),
  );

  return {
    courseSlug: normalizedCourse,
    requestedLocale: normalizedLocale,
    topics: topics.filter((topic) => topic.cards.length > 0),
  };
}

function getFlashcardSourceFiles(): Array<FlashcardSourceFile> {
  return flashcardData
    .map((entry) => {
      const parsed = parseFlashcardDataPath(entry.info.path);
      if (!parsed) {
        return undefined;
      }

      return {
        path: normalizeFlashcardPath(entry.info.path),
        courseSlug: parsed.courseSlug,
        topicSlug: parsed.topicSlug,
        locale: parsed.locale,
        load: entry.load as () => Promise<Pick<DocData, "body">>,
      } satisfies FlashcardSourceFile;
    })
    .filter((value): value is FlashcardSourceFile => value !== undefined)
    .sort((a, b) => a.path.localeCompare(b.path));
}

async function getCardsForFile(
  file: FlashcardSourceFile,
): Promise<Array<FlashcardItem>> {
  let body: unknown;
  try {
    const loadedModule = await file.load();
    body = loadedModule.body;
  } catch {
    return [];
  }

  if (!body) return [];

  const components = {
    Flashcard: FlashcardMarker,
    FlashcardQuestion: QuestionMarker,
    FlashcardAnswer: AnswerMarker,
  };

  // Call the MDX component as a plain function — this creates an element tree
  // without rendering (JSX runtime just builds plain objects). We then
  // traverse the tree to extract Flashcard question/answer content.
  let tree: ReactNode;
  try {
    const MDXBody = body as (props: {
      components?: Record<string, unknown>;
    }) => ReactElement;
    tree = MDXBody({ components });
  } catch {
    return [];
  }

  return extractFlashcardsFromTree(tree, file);
}

function extractFlashcardsFromTree(
  tree: ReactNode,
  file: FlashcardSourceFile,
): Array<FlashcardItem> {
  const cards: Array<FlashcardItem> = [];

  function traverse(node: ReactNode): void {
    if (Array.isArray(node)) {
      for (const child of node) traverse(child);
      return;
    }

    if (!isValidElement(node)) return;

    if (node.type === FlashcardMarker) {
      const nodeEl = node as ReactElement<{ children?: ReactNode }>;
      const question = findDirectChildOfType(
        nodeEl.props.children,
        QuestionMarker,
      );
      const answer = findDirectChildOfType(nodeEl.props.children, AnswerMarker);

      if (question !== undefined && answer !== undefined) {
        const qContent = (question as ReactElement<{ children?: ReactNode }>)
          .props.children;
        const aContent = (answer as ReactElement<{ children?: ReactNode }>)
          .props.children;

        if (qContent !== undefined && aContent !== undefined) {
          cards.push({
            id: `auto:${file.path}#${cards.length + 1}`,
            question: qContent,
            answer: aContent,
            topicSlug: file.topicSlug,
            courseSlug: file.courseSlug,
          });
        }
      }
      // Do not recurse into Flashcard children
      return;
    }

    const props = (node as ReactElement<{ children?: ReactNode }>).props;
    if (props.children !== undefined) {
      traverse(props.children);
    }
  }

  traverse(tree);
  return cards;
}

function findDirectChildOfType(
  children: ReactNode,
  type: unknown,
): ReactElement | undefined {
  let found: ReactElement | undefined;
  Children.forEach(children, (child) => {
    if (!found && isValidElement(child) && child.type === type) {
      found = child as ReactElement;
    }
  });
  return found;
}
