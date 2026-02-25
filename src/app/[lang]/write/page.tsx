import { getTranslations } from "@/lib/translations";
import { DocsBody, DocsPage } from "fumadocs-ui/layouts/docs/page";

export default async function WriteIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { t } = getTranslations(lang);

  return (
    <DocsPage toc={[]}>
      <DocsBody>
        <p className="text-fd-muted-foreground">{t("writeSelectPage")}</p>
      </DocsBody>
    </DocsPage>
  );
}
