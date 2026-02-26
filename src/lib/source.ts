import { loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { docs } from "../../.source/server";
import { Star } from "lucide-react";
import { createElement } from "react";
import type { ReactNode } from "react";
import { i18n } from "@/lib/i18n";

// Helper to create difficulty indicator for sidebar (matches DifficultyStars colors)
function DifficultyIndicator({ difficulty }: { difficulty: number }) {
  const isMax = difficulty === 4;
  const stars = isMax ? 3 : difficulty;
  // Use the same CSS variables as DifficultyStars: warn for 1-3, destructive for 4
  const colorClass = isMax
    ? "text-destructive fill-destructive"
    : "text-warn fill-warn";

  return createElement(
    "span",
    { className: `inline-flex gap-0.5 ml-1.5` },
    ...Array.from({ length: stars }, (_, i) =>
      createElement(Star, {
        key: i,
        className: `size-2.5 ${colorClass}`,
      }),
    ),
  );
}

// Helper to create exam badge for sidebar
function ExamBadge() {
  return createElement(
    "span",
    {
      className:
        "ml-1.5 rounded px-1 py-0.5 text-[10px] font-medium bg-[color-mix(in_oklch,var(--warn)_16%,transparent)] text-warn",
    },
    "E",
  );
}

// Helper to create a general badge for sidebar
function SidebarBadge({ text }: { text: string }) {
  return createElement(
    "span",
    {
      className:
        "ml-1.5 rounded px-1 py-0.5 text-[10px] font-medium bg-[color-mix(in_oklch,var(--primary)_12%,transparent)] text-primary truncate max-w-[60px]",
      title: text,
    },
    text,
  );
}

export const source = loader({
  i18n,
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  plugins: ({ typedPlugin }) => [
    lucideIconsPlugin(),
    typedPlugin({
      transformPageTree: {
        file(node, file) {
          if (!file) return node;

          // Read the original file data to access frontmatter
          const data = this.storage.read(file);
          if (!data || !("data" in data)) return node;

          // Type guard: only doc entries have data.data with frontmatter
          const docData = data.data as
            | {
                exercise?: { difficulty?: number; exam?: boolean };
                sidebar?: { badges?: Array<string> };
              }
            | undefined;

          const exercise = docData?.exercise;
          const sidebar = docData?.sidebar;

          // Only use sidebar.badges if explicitly defined (no fallback)
          const sidebarBadges = sidebar?.badges;

          // If this page has sidebar badges or exercise metadata, enhance the name
          if (exercise || (sidebarBadges && sidebarBadges.length > 0)) {
            const originalName = node.name;
            const elements: Array<ReactNode> = [
              createElement("span", { key: "name" }, originalName),
            ];

            // Add sidebar badges (only if explicitly defined)
            if (sidebarBadges && sidebarBadges.length > 0) {
              sidebarBadges.forEach((badge, index) => {
                elements.push(
                  createElement(SidebarBadge, {
                    key: `badge-${index}`,
                    text: badge,
                  }),
                );
              });
            }

            // Add exam indicator
            if (exercise?.exam) {
              elements.push(createElement(ExamBadge, { key: "exam" }));
            }

            // Add difficulty stars
            if (exercise?.difficulty) {
              elements.push(
                createElement(DifficultyIndicator, {
                  key: "diff",
                  difficulty: exercise.difficulty,
                }),
              );
            }

            node.name = createElement(
              "span",
              { className: "inline-flex items-center gap-0" },
              ...elements,
            );
          }

          return node;
        },
      },
    }),
  ],
});

import { sectionTagValues, toDisplayName } from "@/lib/search-tags";
import type { TagItem } from "fumadocs-ui/contexts/search";
import { getPageTreeRoots } from "fumadocs-core/page-tree";

export function getLocalizedSectionTags(lang: string): TagItem[] {
  const tree = source.pageTree[lang];
  if (!tree) {
    return sectionTagValues.map((value) => ({
      value,
      name: toDisplayName(value),
    }));
  }

  const roots = getPageTreeRoots(tree);

  return sectionTagValues.map((value) => {
    const rootNode = roots.find((r) => r.$id === `${lang}:${value}`);

    return {
      value,
      name: (rootNode?.name as string) ?? toDisplayName(value),
    };
  });
}
