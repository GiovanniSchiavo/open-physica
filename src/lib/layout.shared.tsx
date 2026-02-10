import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { i18n } from "@/lib/i18n";
import config from "@/lib/open-physica.config";

export function baseOptions(locale: string): BaseLayoutProps {
  return {
    i18n,
    nav: {
      title: config.site.title,
      url: `/${locale}`,
    },
    githubUrl: `https://github.com/${config.github.owner}/${config.github.repo}`,
  };
}
