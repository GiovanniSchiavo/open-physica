import { FlashcardsExplorer } from "@/components/flashcards/explorer";
import { loadFlashcardsData } from "@/lib/flashcards-loader.server";
import { baseOptions } from "@/lib/layout.shared";
import { localizePath } from "@/lib/locale";
import { getLocalizedLinks } from "@/lib/nav-links";
import { getTranslations } from "@/lib/translations";
import { HomeLayout } from "fumadocs-ui/layouts/home";

export default async function FlashcardsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const data = await loadFlashcardsData(lang);
  const { t } = getTranslations(lang);

  return (
    <HomeLayout {...baseOptions(lang)} links={getLocalizedLinks(lang)}>
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
        <header className="grid gap-2">
          <h1 className="text-2xl font-semibold sm:text-3xl">
            {t("flashcards")}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t("flashcardsDescription")}
          </p>
        </header>
        <FlashcardsExplorer
          data={data.explorer}
          interactiveRoute={localizePath("/flashcards/play", lang)}
        />
      </main>
    </HomeLayout>
  );
}
