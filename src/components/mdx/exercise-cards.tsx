"use client";

import Link from "next/link";
import type { ExerciseItem } from "@/lib/exercises";
import { Badge } from "@/components/ui/badge";
import {
  DifficultyStars,
  exerciseBadgeVariants,
} from "@/components/ui/difficulty-stars";
import { useLocale } from "@/lib/use-locale";
import { getTranslations } from "@/lib/translations";
import { cn } from "@/lib/utils";

export interface ExerciseCardsProps {
  items: Array<ExerciseItem>;
  className?: string;
}

/**
 * ExerciseCards - MDX component for displaying exercise cards in a grid.
 * Use `<ExerciseCards />` in index pages to render child exercise pages.
 * Items are injected via page.tsx component override.
 */
export function ExerciseCards({ items, className }: ExerciseCardsProps) {
  const locale = useLocale();
  const { t } = getTranslations(locale);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("not-prose mt-6 mb-16", className)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.url}
            href={item.url}
            className="bg-card hover:bg-accent group flex flex-col rounded-xl border p-4 transition-colors"
          >
            {/* Header with badges */}
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              {item.badges?.map((badge) => (
                <Badge
                  key={badge}
                  className={cn(exerciseBadgeVariants({ size: "sm" }))}
                >
                  {badge}
                </Badge>
              ))}
              {item.exercise?.exam && (
                <Badge
                  className={cn(
                    exerciseBadgeVariants({ tone: "exam", size: "sm" }),
                  )}
                >
                  {t("examBadge")}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="text-card-foreground group-hover:text-foreground line-clamp-2 text-base font-medium transition-colors">
              {item.title}
            </h3>

            {/* Description */}
            {item.description && (
              <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                {item.description}
              </p>
            )}

            {/* Footer with difficulty */}
            {item.exercise?.difficulty && (
              <div className="mt-auto pt-3">
                <DifficultyStars
                  difficulty={item.exercise.difficulty}
                  size="sm"
                />
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

ExerciseCards.displayName = "ExerciseCards";
