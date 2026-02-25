import { localizePath } from "@/lib/locale";
import config from "@/lib/open-physica.config";

/**
 * Build localized nav link items from the site config.
 * Shared by the home page and flashcards index.
 */
export function getLocalizedLinks(lang: string) {
  return config.links.map((link) => {
    if (link.type === "menu" && link.items) {
      return {
        type: "menu" as const,
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
}
