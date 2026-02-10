import { createFileRoute } from "@tanstack/react-router";

import { isSupportedLocale } from "@/lib/locale";
import { source } from "@/lib/source";

export const Route = createFileRoute("/$lang/llms.mdx/docs/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const lang = params.lang;
        if (!isSupportedLocale(lang)) {
          return new Response("Not Found", { status: 404 });
        }

        const slugs = params._splat?.split("/") ?? [];
        const page = source.getPage(slugs, lang);
        if (!page) {
          return new Response("Not Found", { status: 404 });
        }

        return new Response(await page.data.getText("raw"), {
          headers: {
            "Content-Type": "text/markdown",
          },
        });
      },
    },
  },
});
