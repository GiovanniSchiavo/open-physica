import { notFound } from "next/navigation";
import type { FlashcardsExplorerData } from "@/components/flashcards/explorer";
import { isSupportedLocale } from "@/lib/locale";

export type FlashcardsLoaderData = {
  locale: string;
  explorer: FlashcardsExplorerData;
};

/**
 * Shared server-side loader for flashcards routes.
 * Validates the locale, then fetches the explorer data.
 */
export async function loadFlashcardsData(
  lang: string,
): Promise<FlashcardsLoaderData> {
  if (!isSupportedLocale(lang)) {
    notFound();
  }

  const { getFlashcardsExplorerData } =
    await import("@/lib/flashcards-explorer.server");

  return {
    locale: lang,
    explorer: await getFlashcardsExplorerData(lang),
  };
}
