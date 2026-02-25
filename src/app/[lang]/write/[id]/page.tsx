import { getMDXComponents } from "@/mdx-components";
import { compile, run } from "@mdx-js/mdx";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { notFound } from "next/navigation";
import * as runtime from "react/jsx-runtime";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

interface Frontmatter {
  title?: string;
  description?: string;
}

async function loadWritePage(id: string) {
  const filePath = join(process.cwd(), "content", "write", `${id}.mdx`);
  let raw: string;

  try {
    raw = await readFile(filePath, "utf-8");
  } catch {
    return null;
  }

  const code = await compile(raw, {
    outputFormat: "function-body",
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { strict: false, throwOnError: false }]],
    development: false,
  });

  const {
    default: MDXContent,
    frontmatter,
    toc,
  } = (await run(String(code), {
    ...runtime,
    baseUrl: import.meta.url,
  })) as {
    default: React.ComponentType<{
      components?: ReturnType<typeof getMDXComponents>;
    }>;
    frontmatter?: Frontmatter;
    toc?: Array<{ title: string; url: string; depth: number }>;
  };

  return {
    MDXContent,
    frontmatter: frontmatter ?? {},
    toc: toc ?? [],
  };
}

export default async function WritePageRoute({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { id, lang } = await params;
  const data = await loadWritePage(id);

  if (!data) {
    notFound();
  }

  const { MDXContent, frontmatter, toc } = data;

  return (
    <DocsPage toc={toc} tableOfContent={{ style: "clerk" }}>
      {frontmatter.title && <DocsTitle>{frontmatter.title}</DocsTitle>}
      {frontmatter.description && (
        <DocsDescription>{frontmatter.description}</DocsDescription>
      )}
      <DocsBody>
        <div className="prose text-foreground/90 flex-1">
          <MDXContent components={getMDXComponents({}, lang)} />
        </div>
      </DocsBody>
    </DocsPage>
  );
}
