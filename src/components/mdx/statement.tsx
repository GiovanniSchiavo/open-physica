import { cva } from "class-variance-authority";
import { Children, cloneElement, isValidElement } from "react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/lib/translations";
import { cn } from "@/lib/utils";

export type StatementType =
  // Foundational
  | "definition"
  | "notation"
  // Axiomatic
  | "axiom"
  | "postulate"
  // Deductive
  | "theorem"
  | "lemma"
  | "proposition"
  | "corollary"
  // Physical & Heuristic
  | "law"
  | "principle"
  | "ansatz"
  | "conjecture";

type ThemeGroup = "foundational" | "axiomatic" | "deductive" | "heuristic";
type ThemeTone = ThemeGroup | "fallback";

interface StatementProps {
  type: StatementType | string;
  title?: string;
  label?: string;
  locale?: string;
  children: ReactNode;
  className?: string;
}

interface StatementTitleProps {
  children: ReactNode;
}

const statementVariants = cva(
  "relative my-6 rounded-lg border-l-4 px-5 py-4 shadow-sm",
  {
    variants: {
      tone: {
        foundational: `
          border-l-info
          bg-[color-mix(in_oklch,var(--info)_10%,var(--card))]
          text-card-foreground
        `,
        axiomatic: `
          border-l-primary
          bg-[color-mix(in_oklch,var(--primary)_10%,var(--card))]
          text-card-foreground
        `,
        deductive: `
          border-l-success
          bg-[color-mix(in_oklch,var(--success)_10%,var(--card))]
          text-card-foreground
        `,
        heuristic: `
          border-l-warn
          bg-[color-mix(in_oklch,var(--warn)_10%,var(--card))]
          text-card-foreground
        `,
        fallback: `
          border-l-border
          bg-card
          text-card-foreground
        `,
      },
    },
    defaultVariants: {
      tone: "fallback",
    },
  },
);

const statementBadgeVariants = cva("absolute top-3 right-3", {
  variants: {
    tone: {
      foundational: `
        bg-[color-mix(in_oklch,var(--info)_18%,transparent)]
        text-info
      `,
      axiomatic: `
        bg-[color-mix(in_oklch,var(--primary)_18%,transparent)]
        text-primary
      `,
      deductive: `
        bg-[color-mix(in_oklch,var(--success)_18%,transparent)]
        text-success
      `,
      heuristic: `
        bg-[color-mix(in_oklch,var(--warn)_18%,transparent)]
        text-warn
      `,
      fallback: `
        bg-[color-mix(in_oklch,var(--muted)_60%,transparent)]
        text-muted-foreground
      `,
    },
  },
  defaultVariants: {
    tone: "fallback",
  },
});

const typeToGroup: Record<StatementType, ThemeGroup> = {
  // Foundational
  definition: "foundational",
  notation: "foundational",
  // Axiomatic
  axiom: "axiomatic",
  postulate: "axiomatic",
  // Deductive
  theorem: "deductive",
  lemma: "deductive",
  proposition: "deductive",
  corollary: "deductive",
  // Physical & Heuristic
  law: "heuristic",
  principle: "heuristic",
  ansatz: "heuristic",
  conjecture: "heuristic",
};

function StatementTitle({ children }: StatementTitleProps) {
  return <>{children}</>;
}

// Mark the component for identification
StatementTitle.displayName = "StatementTitle";

export function Statement({
  type,
  title,
  label,
  locale,
  children,
  className,
}: StatementProps) {
  const { t } = getTranslations(locale ?? "en");
  const tone: ThemeTone = Object.prototype.hasOwnProperty.call(
    typeToGroup,
    type,
  )
    ? typeToGroup[type as StatementType]
    : "fallback";

  let typeLabel: string;
  if (label) {
    typeLabel = label;
  } else {
    try {
      typeLabel = t(type);
    } catch {
      typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    }
  }

  let titleContent: ReactNode = title;
  const bodyChildren: Array<ReactNode> = [];

  const isStatementTitleElement = (
    child: unknown,
  ): child is React.ReactElement<StatementTitleProps> =>
    isValidElement(child) &&
    ((child.type as { displayName?: string }).displayName ===
      "StatementTitle" ||
      child.type === StatementTitle);

  const isElementWithChildren = (
    child: unknown,
  ): child is React.ReactElement<{ children?: ReactNode }> =>
    isValidElement(child);

  Children.forEach(Children.toArray(children), (child) => {
    if (isStatementTitleElement(child)) {
      titleContent = child.props.children;
      return;
    }

    if (isElementWithChildren(child) && child.props.children) {
      const nestedChildren = Children.toArray(child.props.children);
      let foundTitle = false;
      const filteredChildren: Array<ReactNode> = [];
      for (const nested of nestedChildren) {
        if (isStatementTitleElement(nested)) {
          titleContent = nested.props.children;
          foundTitle = true;
          continue;
        }
        filteredChildren.push(nested);
      }

      if (foundTitle) {
        if (filteredChildren.length > 0) {
          bodyChildren.push(
            cloneElement(child, {
              children: filteredChildren,
            }),
          );
        }
        return;
      }
    }

    bodyChildren.push(child);
  });

  return (
    <div className={cn(statementVariants({ tone }), className)}>
      {/* Type badge - top right */}
      <Badge className={cn(statementBadgeVariants({ tone }))}>
        {typeLabel}
      </Badge>

      {/* Title area */}
      {titleContent && (
        <h3 className="text-primary mt-0 mb-2 pr-20 font-semibold">
          {titleContent}
        </h3>
      )}

      {/* Body content */}
      <div className={cn(titleContent ? "" : "pr-20")}>{bodyChildren}</div>
    </div>
  );
}

export { StatementTitle };
