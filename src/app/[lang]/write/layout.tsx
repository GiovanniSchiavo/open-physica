import { baseOptions } from "@/lib/layout.shared";
import { getTranslations } from "@/lib/translations";
import type * as PageTree from "fumadocs-core/page-tree";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AddPageButton } from "./add-page-button";

async function getWritePageIds(): Promise<number[]> {
  const dir = join(process.cwd(), "content", "write");
  const files = await readdir(dir).catch(() => []);
  return files
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => parseInt(f.replace(".mdx", ""), 10))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);
}

export default async function WriteLayout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;

  if (process.env.NODE_ENV === "production") {
    redirect(`/${lang}`);
  }

  const { t } = getTranslations(lang);
  const pages = await getWritePageIds();

  const tree: PageTree.Root = {
    name: t("writePagesTitle"),
    children: pages.map((id) => ({
      type: "page" as const,
      name: `${t("writePage")} ${id}`,
      url: `/${lang}/write/${id}`,
    })),
  };

  return (
    <DocsLayout
      {...baseOptions(lang)}
      tree={tree}
      sidebar={{
        banner: <AddPageButton lang={lang} label={t("writeAddPage")} />,
      }}
    >
      {children}
    </DocsLayout>
  );
}
