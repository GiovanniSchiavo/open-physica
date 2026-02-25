import { source } from "@/lib/source";

/**
 * Exercise metadata structure
 */
export interface ExerciseMetadata {
  difficulty?: number;
  exam?: boolean;
}

/**
 * Exercise item for cards/lists
 */
export interface ExerciseItem {
  title: string;
  url: string;
  description?: string;
  badges?: Array<string>;
  exercise?: ExerciseMetadata;
}

/**
 * Extended page data with exercise-specific fields
 */
export interface ExercisePageData {
  badges?: Array<string>;
  exercise?: ExerciseMetadata;
}

/**
 * Get child exercise pages for the current folder.
 * Returns pages that have exercise metadata in their frontmatter.
 */
export function getExerciseChildren(
  parentSlugs: Array<string>,
  locale: string,
): Array<ExerciseItem> {
  const allPages = source.getPages(locale);

  const children = allPages.filter((p) => {
    const pageSlugs = p.slugs;

    // Must be exactly one level deeper than parent
    if (pageSlugs.length !== parentSlugs.length + 1) return false;

    // Must start with all parent slugs
    for (let i = 0; i < parentSlugs.length; i++) {
      if (pageSlugs[i] !== parentSlugs[i]) return false;
    }

    // Must have exercise metadata
    return (p.data as ExercisePageData).exercise !== undefined;
  });

  return children.map((p) => {
    const data = p.data as ExercisePageData;
    return {
      title: p.data.title,
      url: p.url,
      description: p.data.description,
      badges: data.badges,
      exercise: data.exercise,
    };
  });
}
