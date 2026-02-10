import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import config from "@/lib/open-physica.config";
import { localizePath } from "@/lib/locale";

export function Hero({ lang }: { lang: string }) {
  return (
    <section className={`relative overflow-hidden py-24 lg:py-32`}>
      <div
        className={`from-primary/20 via-background to-background absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] opacity-40`}
      />
      <div className="container mx-auto px-4 text-center">
        <h1
          className={`from-foreground to-foreground/70 mb-6 bg-linear-to-b bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl lg:text-7xl`}
        >
          {config.hero.title[lang]}
        </h1>
        <p
          className={`text-muted-foreground mx-auto mb-10 max-w-2xl text-lg delay-100 sm:text-xl`}
        >
          {config.hero.description[lang]}
        </p>
        <div
          className={`flex flex-col items-center justify-center gap-4 delay-200 sm:flex-row`}
        >
          <Button size="lg" asChild>
            <Link to={localizePath(config.hero.primaryCta.href[lang], lang)}>
              {config.hero.primaryCta.text[lang]}
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to={localizePath(config.hero.secondaryCta.href[lang], lang)}>
              {config.hero.secondaryCta.text[lang]}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
