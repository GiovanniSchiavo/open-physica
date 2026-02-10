import { createFileRoute, redirect } from "@tanstack/react-router";

import { i18n } from "@/lib/i18n";

export const Route = createFileRoute("/docs")({
  loader: () => {
    throw redirect({
      to: "/$lang/docs/$",
      params: { lang: i18n.defaultLanguage, _splat: undefined },
    });
  },
  component: () => null,
});
