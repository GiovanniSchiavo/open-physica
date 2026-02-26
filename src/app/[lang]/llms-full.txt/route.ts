import { getLLMText } from "@/lib/get-llm-text";
import { isSupportedLocale } from "@/lib/locale";
import { source } from "@/lib/source";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lang: string }> },
) {
  const { lang } = await params;

  if (!isSupportedLocale(lang)) {
    return new Response("Not Found", { status: 404 });
  }

  const scan = source.getPages(lang).map(getLLMText);
  const scanned = await Promise.all(scan);

  return new Response(scanned.join("\n\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
