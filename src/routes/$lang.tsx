import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";

import { isSupportedLocale } from "@/lib/locale";

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (!isSupportedLocale(params.lang)) {
      throw notFound();
    }
  },
  component: LangLayout,
});

function LangLayout() {
  return <Outlet />;
}
