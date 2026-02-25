import type { ExerciseMetadata } from "@/lib/exercises";
import { Badge } from "@/components/ui/badge";
import {
  DifficultyStars,
  exerciseBadgeVariants,
} from "@/components/ui/difficulty-stars";
import { getTranslations } from "@/lib/translations";
import { cn } from "@/lib/utils";

export interface PageBadgesProps {
  /** Array of badge labels */
  badges?: Array<string>;
  /** Exercise metadata */
  exercise?: ExerciseMetadata;
  /** Current locale */
  locale: string;
  /** Additional class name */
  className?: string;
}

/**
 * PageBadges component - renders badges, difficulty, and exam status
 * in the page header area. Used for exercise pages and any page with badges.
 */
export function PageBadges({
  badges,
  exercise,
  locale,
  className,
}: PageBadgesProps) {
  const { t } = getTranslations(locale);
  const hasBadges = badges && badges.length > 0;
  const hasExercise = exercise !== undefined;

  // Don't render anything if there's nothing to show
  if (!hasBadges && !hasExercise) {
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
    </div>
  );
}

PageBadges.displayName = "PageBadges";
