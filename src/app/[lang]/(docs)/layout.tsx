import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { CSSProperties, ReactNode } from "react";

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;
  const tree = source.getPageTree(lang);
  const base = baseOptions(lang);

  return (
    <DocsLayout
      {...base}
      nav={{ ...base.nav, enabled: false }}
      githubUrl={undefined}
      tree={tree}
      containerProps={{
        style: { "--fd-header-height": "0px" } as CSSProperties,
      }}
    >
      {children}
    </DocsLayout>
  );
}
