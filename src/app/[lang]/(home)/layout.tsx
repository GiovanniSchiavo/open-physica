import { baseOptions } from "@/lib/layout.shared";
import { getLocalizedLinks } from "@/lib/nav-links";
import { getTranslations } from "@/lib/translations";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;
  const { t } = getTranslations(lang);

  const devLinks =
    process.env.NODE_ENV === "development"
      ? [
          {
            text: t("writeNavLink"),
            url: `/${lang}/write`,
            active: "nested-url" as const,
          },
        ]
      : [];

  return (
    <HomeLayout
      {...baseOptions(lang)}
      links={[...getLocalizedLinks(lang), ...devLinks]}
    >
      {children}
    </HomeLayout>
  );
}
