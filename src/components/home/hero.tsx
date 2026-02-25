import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InteractiveGridBackground } from "@/components/interactive-grid-background";
import { localizePath } from "@/lib/locale";
import config from "@/lib/open-physica.config";

export function Hero({ lang }: { lang: string }) {
  return (
    <section className="relative h-full w-full">
      <InteractiveGridBackground
        gridGap={24}
        dotSize={1.2}
        radius={300}
        className="flex h-[calc(100svh-56px)] flex-col items-center justify-center overflow-hidden"
      >
        {/* Glow Effects */}
        <div className="from-primary/30 via-background/60 pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,var(--tw-gradient-stops))] to-transparent" />

        {/* Content */}
        <div className="animate-in fade-in slide-in-from-bottom-8 relative z-10 container mx-auto px-6 text-center duration-1000">
          <h1 className="from-foreground via-foreground/90 to-primary/70 mb-8 bg-linear-to-b bg-clip-text text-6xl font-black tracking-tighter text-transparent drop-shadow-sm sm:text-7xl lg:text-8xl xl:text-9xl">
            {config.hero.title[lang]}
          </h1>
          <p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-xl leading-relaxed font-medium sm:text-2xl">
            {config.hero.description[lang]}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="shadow-primary/20 h-14 rounded-full px-8 text-lg font-semibold shadow-lg transition-all hover:scale-105"
              nativeButton={false}
              render={
                <Link
                  href={localizePath(config.hero.primaryCta.href[lang], lang)}
                />
              }
            >
              {config.hero.primaryCta.text[lang]}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-background/50 h-14 rounded-full px-8 text-lg font-semibold backdrop-blur-sm transition-all hover:scale-105"
              nativeButton={false}
              render={
                <Link
                  href={localizePath(config.hero.secondaryCta.href[lang], lang)}
                />
              }
            >
              {config.hero.secondaryCta.text[lang]}
            </Button>
          </div>
        </div>
      </InteractiveGridBackground>
    </section>
  );
}
