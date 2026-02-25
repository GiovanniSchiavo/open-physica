import { isSupportedLocale } from "@/lib/locale";
import { source } from "@/lib/source";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

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

  // Read raw MDX from disk and strip frontmatter for copy/export workflows.
  const raw = await readFile(
    join(process.cwd(), "content/docs", page.path),
    "utf-8",
  );
  const content = raw.replace(/^---[\s\S]*?---\n?/, "");

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
