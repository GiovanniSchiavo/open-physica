"use client";

import { FunctionSquare } from "lucide-react";
import type { ExerciseMetadata } from "@/lib/exercises";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DifficultyStars,
  exerciseBadgeVariants,
} from "@/components/ui/difficulty-stars";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getTranslations } from "@/lib/translations";
import { cn } from "@/lib/utils";

export interface PageBadgesProps {
  /** Array of badge labels */
  badges?: Array<string>;
  /** Exercise metadata */
  exercise?: ExerciseMetadata;
  /** Formulae content (ReactNode) */
  formulae?: ReactNode;
  /** Current locale */
  locale: string;
  /** Additional class name */
  className?: string;
}

function FormulaePopover({
  children,
  locale,
}: {
  children: ReactNode;
  locale: string;
}) {
  const { t } = getTranslations(locale);

  return (
    <Popover>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          aria-label={t("showFormulae")}
          className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary data-[state=open]:bg-primary/20 data-[state=open]:ring-primary/30 gap-1.5 data-[state=open]:ring-2"
        >
          <FunctionSquare className="size-4" />
          <span className="hidden sm:inline">{t("formulae")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="text-foreground mb-3 text-sm font-semibold">
          {t("formulaeTitle")}
        </h4>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * PageBadges component - renders badges, difficulty, exam status, and formulae
 * in the page header area. Used for exercise pages and any page with badges.
 */
export function PageBadges({
  badges,
  exercise,
  formulae,
  locale,
  className,
}: PageBadgesProps) {
  const { t } = getTranslations(locale);
  const hasBadges = badges && badges.length > 0;
  const hasExercise = exercise !== undefined;
  const hasFormulae = formulae !== undefined && formulae !== null;

  // Don't render anything if there's nothing to show
  if (!hasBadges && !hasExercise && !hasFormulae) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2 pb-2", className)}>
      {/* Regular badges */}
      {badges?.map((badge) => (
        <Badge key={badge} className={cn(exerciseBadgeVariants())}>
          {badge}
        </Badge>
      ))}

      {/* Exam badge */}
      {exercise?.exam && (
        <Badge className={cn(exerciseBadgeVariants({ tone: "exam" }))}>
          {t("examBadge")}
        </Badge>
      )}

      {/* Difficulty stars */}
      {hasExercise && exercise.difficulty && (
        <DifficultyStars difficulty={exercise.difficulty} />
      )}

      {/* Formulae popover */}
      {hasFormulae && (
        <FormulaePopover locale={locale}>{formulae}</FormulaePopover>
      )}
    </div>
  );
}

PageBadges.displayName = "PageBadges";
