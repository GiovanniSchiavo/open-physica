import { createFileRoute } from "@tanstack/react-router";

import { getLLMText } from "@/lib/get-llm-text";
import { isSupportedLocale } from "@/lib/locale";
import { source } from "@/lib/source";

export const Route = createFileRoute("/$lang/llms-full.txt")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const lang = params.lang;
        if (!isSupportedLocale(lang)) {
          return new Response("Not Found", { status: 404 });
        }

        const scan = source.getPages(lang).map(getLLMText);
        const scanned = await Promise.all(scan);

        return new Response(scanned.join("\n\n"), {
          headers: {
            "Content-Type": "text/plain",
          },
        });
      },
    },
  },
});
