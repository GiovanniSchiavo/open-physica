import "server-only";

import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";

export interface ExtractedFlashcardContent {
  questionHtml: string;
  answerHtml: string;
}

const FLASHCARD_BLOCK_PATTERN = /<Flashcard>([\s\S]*?)<\/Flashcard>/g;

const markdownProcessor = remark()
  .use(remarkMath)
  .use(remarkRehype)
  .use(rehypeKatex, { strict: false })
  .use(rehypeStringify);

export async function extractFlashcardsFromRaw(
  raw: string,
): Promise<Array<ExtractedFlashcardContent>> {
  const cards: Array<ExtractedFlashcardContent> = [];

  for (const block of raw.matchAll(FLASHCARD_BLOCK_PATTERN)) {
    const cardContent = block[1] ?? "";
    const question = extractSection(cardContent, "FlashcardQuestion");
    const answer = extractSection(cardContent, "FlashcardAnswer");

    if (!question || !answer) {
      continue;
    }

    const [questionHtml, answerHtml] = await Promise.all([
      renderMarkdownToHtml(question),
      renderMarkdownToHtml(answer),
    ]);

    if (!questionHtml || !answerHtml) {
      continue;
    }

    cards.push({
      questionHtml,
      answerHtml,
    });
  }

  return cards;
}

function extractSection(input: string, tag: string): string | undefined {
  const pattern = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
  const section = input.match(pattern)?.[1]?.trim();
  return section && section.length > 0 ? section : undefined;
}

async function renderMarkdownToHtml(markdown: string): Promise<string> {
  try {
    const rendered = await markdownProcessor.process(markdown);
    return String(rendered).trim();
  } catch {
    return "";
  }
}
