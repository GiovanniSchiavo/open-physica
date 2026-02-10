import { createFileRoute, notFound } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";

import { Hero } from "@/components/home/hero";
import { baseOptions } from "@/lib/layout.shared";
import { isSupportedLocale, localizePath } from "@/lib/locale";
import config from "@/lib/open-physica.config";

export const Route = createFileRoute("/$lang/")({
  beforeLoad: ({ params }) => {
    if (!isSupportedLocale(params.lang)) {
      throw notFound();
    }
  },
  component: HomePage,
});

function HomePage() {
  const { lang } = Route.useParams();

  const linkItems = config.links.map((link) => {
    if (link.type === "menu" && link.items) {
      return {
        type: "menu",
        text: link.text[lang],
        items: link.items.map((item) => ({
          text: item.text[lang],
          url: localizePath(item.url!, lang),
          active: item.active as "nested-url" | undefined,
        })),
      };
    }
    return {
      text: link.text[lang],
      url: localizePath(link.url!, lang),
      active: link.active as "nested-url" | undefined,
    };
  });

  return (
    // @ts-expect-error -- Fumadocs types mess
    <HomeLayout {...baseOptions(lang)} links={linkItems}>
      <main className="flex min-h-screen flex-col">
        <Hero lang={lang} />
      </main>
    </HomeLayout>
  );
}
