import { source, sectionTagSet } from "@/lib/source";
import type { StructuredData } from "fumadocs-core/mdx-plugins/remark-structure";
import { createFromSource } from "fumadocs-core/search/server";

export const dynamic = "force-dynamic";

type SearchPageData = {
  title?: string;
  description?: string;
  structuredData?: StructuredData;
  load?: () => Promise<SearchPageData>;
};

function emptyStructuredData(): StructuredData {
  return {
    headings: [],
    contents: [],
  };
}

const server = createFromSource(source, {
  localeMap: {
    en: "english",
    it: "italian",
  },
  async buildIndex(page) {
    const topLevel = page.slugs[0];
    const pageData = page.data as SearchPageData;
    const loadedData =
      typeof pageData.load === "function" ? await pageData.load() : pageData;
    const structuredData =
      pageData.structuredData ??
      loadedData.structuredData ??
      emptyStructuredData();

    return {
      title: pageData.title ?? loadedData.title ?? page.url,
      description: pageData.description ?? loadedData.description,
      url: page.url,
      id: page.url,
      structuredData,
      tag:
        typeof topLevel === "string" && sectionTagSet.has(topLevel)
          ? topLevel
          : undefined,
    };
  },
});

export async function GET(request: Request) {
  return server.GET(request);
}
