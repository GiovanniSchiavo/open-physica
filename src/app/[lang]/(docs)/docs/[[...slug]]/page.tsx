import { ExerciseCards } from "@/components/mdx/exercise-cards";
import { LLMCopyButton, ViewOptions } from "@/components/page-actions";
import { PageBadges } from "@/components/page-badges";
import { getExerciseChildren, type ExercisePageData } from "@/lib/exercises";
import config from "@/lib/open-physica.config";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";
import type { DocData } from "fumadocs-mdx/runtime/types";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  PageLastUpdate,
} from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug?: string[] }>;
}) {
  const { slug, lang } = await params;

  const page = source.getPage(slug, lang);
  if (!page) notFound();

  const loaded = (await page.data.load()) as DocData & { lastModified?: Date };
  const MDX = loaded.body;

  const exerciseData = page.data as unknown as ExercisePageData;
  const exerciseChildren = getExerciseChildren(page.slugs, lang);

  const markdownUrl = `${page.url}.mdx`;
  const githubUrl = `https://github.com/${config.github.owner}/${config.github.repo}/blob/main/content/docs/${page.path}`;

  return (
    <DocsPage
      toc={loaded.toc}
      tableOfContent={{ style: "clerk" }}
      full={(page.data as { full?: boolean }).full}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <PageBadges
        badges={exerciseData.badges}
        exercise={exerciseData.exercise}
        locale={lang}
      />
      <DocsBody>
        <div className="flex flex-row items-center gap-2 border-b pb-6">
          <LLMCopyButton markdownUrl={markdownUrl} />
          <ViewOptions markdownUrl={markdownUrl} githubUrl={githubUrl} />
        </div>
        <div className="prose text-foreground/90 flex-1 pt-6">
          <MDX
            components={getMDXComponents(
              {
                a: createRelativeLink(source, page),
                ExerciseCards: () => <ExerciseCards items={exerciseChildren} />,
              },
              lang,
            )}
          />
        </div>
      </DocsBody>
      {loaded.lastModified && <PageLastUpdate date={loaded.lastModified} />}
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug?: string[] }>;
}): Promise<Metadata> {
  const { slug, lang } = await params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
