import type { ComponentProps, ReactNode } from "react";
import { Accordion, Accordions } from "@/components/accordion";
import { getTranslations } from "@/lib/translations";
import { cn } from "@/lib/utils";

export interface SolutionProps extends ComponentProps<"div"> {
  children: ReactNode;
  title?: string;
  locale?: string;
}

/**
 * Solution component - a simple wrapper around Accordion for exercise solutions.
 * Can be used standalone or will automatically integrate with exercise pages.
 */
export function Solution({
  children,
  title,
  locale,
  className,
  ...props
}: SolutionProps) {
  const { t } = getTranslations(locale ?? "en");

  return (
    <div className={cn("mt-6", className)} {...props}>
      <Accordions>
        <Accordion id="solution" title={title ?? t("showSolution")}>
          {children}
        </Accordion>
      </Accordions>
    </div>
  );
}

Solution.displayName = "Solution";
