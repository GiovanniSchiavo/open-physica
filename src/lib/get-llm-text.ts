import type { InferPageType } from "fumadocs-core/source";
import type { source } from "@/lib/source";

export async function getLLMText(page: InferPageType<typeof source>) {
  // Read the raw MDX from disk and strip the YAML frontmatter block so
  // downstream LLM consumers receive source markdown rather than rendered HTML.
  const hasGetText = "getText" in page.data;
  let content = "";

  if (hasGetText) {
    // This removes frontmatter automatically via Fumadocs MDX
    content = await (page.data as any).getText("raw");
  }

  return `# ${page.data.title} (${page.url})\n\n${content}`;
}
