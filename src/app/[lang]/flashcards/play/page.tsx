import { Suspense } from "react";
import { FlashcardsPlayClient } from "@/components/flashcards/play-client";
import { loadFlashcardsData } from "@/lib/flashcards-loader.server";

export default async function FlashcardsPlayPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const data = await loadFlashcardsData(lang);

  return (
    <Suspense>
      <FlashcardsPlayClient lang={lang} data={data} />
    </Suspense>
  );
}
