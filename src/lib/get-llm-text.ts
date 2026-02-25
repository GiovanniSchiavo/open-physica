import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { InferPageType } from "fumadocs-core/source";
import type { source } from "@/lib/source";

export async function getLLMText(page: InferPageType<typeof source>) {
  // Read the raw MDX from disk and strip the YAML frontmatter block so
  // downstream LLM consumers receive source markdown rather than rendered HTML.
  const raw = await readFile(
    join(process.cwd(), "content/docs", page.path),
    "utf-8",
  );
  const content = raw.replace(/^---[\s\S]*?---\n?/, "");

  return `# ${page.data.title} (${page.url})\n\n${content}`;
}
