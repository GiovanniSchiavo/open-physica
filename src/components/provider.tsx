"use client";
import { defineI18nUI } from "fumadocs-ui/i18n";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import type { ReactNode } from "react";
import { i18n } from "@/lib/i18n";

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
  children,
}: {
  lang: string;
  children: ReactNode;
}) {
  return <RootProvider i18n={provider(lang)}>{children}</RootProvider>;
}
