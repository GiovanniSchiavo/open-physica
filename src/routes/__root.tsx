import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import type { ReactNode } from "react";

import { Provider } from "@/components/provider";
import { localizePath, resolveLocale } from "@/lib/locale";
import config from "@/lib/open-physica.config";


export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: "OpenPhysica",
      },
      {
        name: "description",
        content: config.hero.description.en,
      },
      {
        name: "color-scheme",
        content: "light dark",
      },
      {
        name: "theme-color",
        content: "#0b0d13",
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: "icon",
        href: "/favicon.ico",
      },
      {
        rel: "apple-touch-icon",
        href: "/logo192.png",
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
    ],
  }),

  shellComponent: RootDocument,
  errorComponent: RootErrorComponent,
  notFoundComponent: RootNotFoundComponent,
})

function RootDocument({ children }: { children: ReactNode }) {
  const lang = useActiveLocale();

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <Provider lang={lang}>{children}</Provider>
        <Scripts />
      </body>
    </html>
  )
}

function RootErrorComponent({ error }: { error: Error }) {
  const lang = useActiveLocale();
  const homeUrl = localizePath("/", lang);
  const message = import.meta.env.DEV
    ? error.message || "Unknown error"
    : "Something went wrong. Please try again later.";

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Unexpected error</h1>
      <p className="text-fd-muted-foreground">{message}</p>
      <Link
        to={homeUrl}
        className="rounded-md bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground"
      >
        Back to home
      </Link>
    </main>
  );
}

function RootNotFoundComponent() {
  const lang = useActiveLocale();
  const homeUrl = localizePath("/", lang);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="text-fd-muted-foreground">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        to={homeUrl}
        className="rounded-md bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground"
      >
        Back to home
      </Link>
    </main>
  );
}

function useActiveLocale() {
  return useRouterState({
    select: (state) => {
      const match = state.matches.find((item) => {
        const params = item.params;
        return "lang" in params && typeof params.lang === "string";
      });
      const lang =
        match && "lang" in match.params ? match.params.lang : undefined;
      return resolveLocale(lang);
    },
  });
}
