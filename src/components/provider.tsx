"use client";

import { DocsSearchDialog } from "@/components/docs-search-dialog";
import { defineI18nUI } from "fumadocs-ui/i18n";
import { RootProvider } from "fumadocs-ui/provider/next";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { i18n } from "@/lib/i18n";
import { resolveSectionTagFromPath } from "@/lib/search-tags";
import { sectionTags, sectionTagSet } from "@/lib/source";
import type { TagItem } from "fumadocs-ui/contexts/search";

const { provider } = defineI18nUI(i18n, {
  translations: {
    en: {
      displayName: "English",
      search: "Search",
      toc: "On this page",
      lastUpdate: "Last updated on",
    },
    it: {
      displayName: "Italiano",
      search: "Cerca",
      toc: "In questa pagina",
      lastUpdate: "Ultimo aggiornamento il",
    },
  },
});

export function Provider({
  lang,
  tags,
  children,
}: {
  lang: string;
  tags?: TagItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const defaultTag = useMemo(
    () => resolveSectionTagFromPath(pathname, lang, sectionTagSet),
    [lang, pathname],
  );

  return (
    <RootProvider
      i18n={provider(lang)}
      search={{
        SearchDialog: DocsSearchDialog,
        options: {
          defaultTag,
          tags: tags ?? sectionTags,
          allowClear: true,
        },
      }}
    >
      {children}
    </RootProvider>
  );
}
