import { isSupportedLocale } from "@/lib/locale";
import { source } from "@/lib/source";
import type { InferPageType } from "fumadocs-core/source";

type PageData = InferPageType<typeof source>["data"];

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lang: string; slug?: string[] }> },
) {
  const { lang, slug } = await params;

  if (!isSupportedLocale(lang)) {
    return new Response("Not Found", { status: 404 });
  }

  const page = source.getPage(slug, lang);
  if (!page) {
    return new Response("Not Found", { status: 404 });
  }

  let content = "";
  if ("getText" in page.data) {
    const { getText } = page.data as PageData & {
      getText: (type: "raw" | "processed") => Promise<string>;
    };
    content = await getText("raw");
  }

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
