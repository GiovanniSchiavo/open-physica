import type { TagItem } from "fumadocs-ui/contexts/search";
import docsMeta from "../../content/docs/meta.json";

const allSectionTags = (docsMeta.pages ?? []).filter(
  (page): page is string => typeof page === "string" && page.length > 0,
);

export function toDisplayName(value: string) {
  return value
    .split("-")
    .map((part) => {
      if (!part) return part;
      return `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`;
    })
    .join(" ");
}

export const sectionTagValues = allSectionTags;
export const sectionTagSet = new Set(sectionTagValues);

export const sectionTags: TagItem[] = sectionTagValues.map((value) => ({
  value,
  name: toDisplayName(value),
}));

export function resolveSectionTagFromPath(
  pathname: string | null,
  lang: string,
) {
  if (!pathname) return undefined;

  const docsBase = `/${lang}/docs`;
  if (pathname === docsBase || pathname === `${docsBase}/`) {
    return undefined;
  }

  if (!pathname.startsWith(`${docsBase}/`)) {
    return undefined;
  }

  const topLevel = pathname.slice(docsBase.length + 1).split("/")[0];
  if (!topLevel) return undefined;

  if (!sectionTagSet.has(topLevel)) {
    return undefined;
  }

  return topLevel;
}
