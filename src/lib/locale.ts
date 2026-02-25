import { i18n } from "@/lib/i18n";

export const supportedLanguages = i18n.languages;
export type SupportedLocale = (typeof supportedLanguages)[number];

export function isSupportedLocale(lang?: string): lang is SupportedLocale {
  return (
    typeof lang === "string" &&
    supportedLanguages.includes(lang as SupportedLocale)
  );
}

export function resolveLocale(lang?: string) {
  if (isSupportedLocale(lang)) {
    return lang;
  }

  return i18n.defaultLanguage;
}

export function localizePath(path: string, locale: string) {
  if (!path) return `/${locale}`;

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:")
  ) {
    return path;
  }

  if (path.startsWith("#") || path.startsWith("?")) {
    return path;
  }

  if (!path.startsWith("/")) {
    return `/${locale}/${path}`.replaceAll(/\/+/g, "/");
  }

  if (path === "/") {
    return `/${locale}`;
  }

  if (path === `/${locale}` || path.startsWith(`/${locale}/`)) {
    return path;
  }

  return `/${locale}${path}`.replaceAll(/\/+/g, "/");
}
