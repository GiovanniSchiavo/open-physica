import type { InferPageType } from "fumadocs-core/source";
import type { source } from "@/lib/source";

type PageData = InferPageType<typeof source>["data"];

export async function getLLMText(page: InferPageType<typeof source>) {
  let content = "";

  if ("getText" in page.data) {
    const { getText } = page.data as PageData & {
      getText: (type: "raw" | "processed") => Promise<string>;
    };
    content = await getText("raw");
  }

  return `# ${page.data.title} (${page.url})\n\n${content}`;
}
