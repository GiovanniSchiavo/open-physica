import { Link, createFileRoute, notFound  } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {  Suspense } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  PageLastUpdate,
} from "fumadocs-ui/layouts/docs/page";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import browserCollections from "fumadocs-mdx:collections/browser";
import type {ComponentProps} from "react";

import type {ExerciseItem} from "@/lib/exercises";
import { ExerciseCards } from "@/components/mdx/exercise-cards";
import { LLMCopyButton, ViewOptions } from "@/components/page-actions";
import { PageBadges } from "@/components/page-badges";
import {  getExerciseChildren } from "@/lib/exercises";
import { baseOptions } from "@/lib/layout.shared";
import { isSupportedLocale, resolveLocale } from "@/lib/locale";
import config from "@/lib/open-physica.config";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

type ClientProps = {
  pageUrl: string;
  markdownUrl: string;
  githubUrl: string;
  locale: string;
  exerciseChildren: Array<ExerciseItem>;
};

export const Route = createFileRoute("/$lang/docs/$")({
  loader: async ({ params }) => {
    if (!isSupportedLocale(params.lang)) {
      throw notFound();
    }

    const slugs = params._splat?.split("/") ?? [];
    const data = await serverLoader({ data: { lang: params.lang, slugs } });
    await clientLoader.preload(data.path);
    return data;
  },
  component: Page,
  notFoundComponent: () => (
    <p className="mx-auto max-w-3xl px-6 py-16 text-center text-fd-muted-foreground">
      Page not found
    </p>
  ),
});

const serverLoader = createServerFn({ method: "GET" })
  .inputValidator((input: { lang: string; slugs: Array<string> }) => input)
  .handler(async ({ data }) => {
    if (!isSupportedLocale(data.lang)) {
      throw notFound();
    }

    const page = source.getPage(data.slugs, data.lang);
    if (!page) {
      throw notFound();
    }

    const markdownUrl = `${page.url}.mdx`;

    return {
      path: page.path,
      pageUrl: page.url,
      markdownUrl,
      githubUrl: `https://github.com/${config.github.owner}/${config.github.repo}/blob/main/content/docs/${page.path}`,
      locale: page.locale,
      exerciseChildren: getExerciseChildren(page.slugs, data.lang),
      pageTree: await source.serializePageTree(source.getPageTree(data.lang)),
    };
  });

const clientLoader = browserCollections.docs.createClientLoader<ClientProps>({
  component(
    { toc, frontmatter, default: MDX, lastModified },
    { pageUrl, markdownUrl, githubUrl, locale, exerciseChildren },
  ) {
    const RelativeLink = createRelativeLink(pageUrl);

    return (
      <DocsPage toc={toc} tableOfContent={{ style: "clerk" }} full={frontmatter.full}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <PageBadges
          badges={frontmatter.badges}
          exercise={frontmatter.exercise}
          locale={locale}
        />
        <DocsBody>
          <div className="flex flex-row items-center gap-2 border-b pb-6">
            <LLMCopyButton markdownUrl={markdownUrl} />
            <ViewOptions markdownUrl={markdownUrl} githubUrl={githubUrl} />
          </div>
          <div className="prose text-foreground/90 flex-1 pt-6">
            <MDX
              components={getMDXComponents({
                a: RelativeLink,
                ExerciseCards: () => <ExerciseCards items={exerciseChildren} />,
              })}
            />
          </div>
        </DocsBody>
        {lastModified && <PageLastUpdate date={lastModified} />}
      </DocsPage>
    );
  },
});

function createRelativeLink(baseUrl: string) {
  return function RelativeLink({
    href,
    ...props
  }: ComponentProps<"a">) {
    if (!href) {
      return <a {...props} />;
    }

    if (
      href.startsWith("#") ||
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return <a href={href} {...props} />;
    }

    const resolved = resolveRelativeHref(baseUrl, href);
    return <Link to={resolved} {...props} />;
  };
}

function resolveRelativeHref(baseUrl: string, href: string) {
  if (href.startsWith("/")) {
    return href;
  }

  const origin = typeof window === "undefined" ? "http://localhost" : window.location.origin;
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const url = new URL(href, `${origin}${normalizedBase}`);
  return `${url.pathname}${url.search}${url.hash}`;
}

function Page() {
  const data = useFumadocsLoader(Route.useLoaderData());
  const locale = resolveLocale(data.locale);

  return (
    <DocsLayout {...baseOptions(locale)} tree={data.pageTree}>
      <Suspense>
        {clientLoader.useContent(data.path, {
          pageUrl: data.pageUrl,
          markdownUrl: data.markdownUrl,
          githubUrl: data.githubUrl,
          locale,
          exerciseChildren: data.exerciseChildren,
        })}
      </Suspense>
    </DocsLayout>
  );
}
