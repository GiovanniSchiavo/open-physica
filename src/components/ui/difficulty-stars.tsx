import { cva } from "class-variance-authority";
import { Star } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Shared badge variants for exercise-related badges
 */
export const exerciseBadgeVariants = cva(
  "border-transparent bg-[color-mix(in_oklch,var(--primary)_12%,transparent)] text-primary",
  {
    variants: {
      tone: {
        default: "",
        exam: "bg-[color-mix(in_oklch,var(--warn)_16%,transparent)] text-warn",
      },
      size: {
        default: "",
        sm: "text-xs",
      },
    },
    defaultVariants: {
      tone: "default",
      size: "default",
    },
  },
);

export type ExerciseBadgeVariants = VariantProps<typeof exerciseBadgeVariants>;

interface DifficultyStarsProps {
  difficulty: number;
  size?: "sm" | "default";
  className?: string;
}

/**
 * DifficultyStars component - renders 1-4 difficulty as stars.
 * - 1-3 stars: yellow filled stars
 * - 4 stars: 3 red filled stars (max difficulty)
 */
export function DifficultyStars({
  difficulty,
  size = "default",
  className,
}: DifficultyStarsProps) {
  const isMaxDifficulty = difficulty === 4;
  const displayStars = isMaxDifficulty ? 3 : difficulty;
  const starSize = size === "sm" ? "size-3.5" : "size-4";

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3].map((star) => (
        <Star
          key={star}
          className={cn(
            starSize,
            star <= displayStars
              ? isMaxDifficulty
                ? "fill-destructive text-destructive"
                : "fill-warn text-warn"
              : "text-[color-mix(in_oklch,var(--muted-foreground)_30%,transparent)]",
          )}
        />
      ))}
    </div>
  );
}
