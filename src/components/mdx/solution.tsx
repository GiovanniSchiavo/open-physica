"use client";

import type { ComponentProps, ReactNode } from "react";
import { Accordion, Accordions } from "@/components/mdx/accordion";
import { getTranslations } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale";

export interface SolutionProps extends ComponentProps<"div"> {
  children: ReactNode;
  title?: string;
}

/**
 * Solution component - a simple wrapper around Accordion for exercise solutions.
 * Can be used standalone or will automatically integrate with exercise pages.
 */
export function Solution({
  children,
  title,
  className,
  ...props
}: SolutionProps) {
  const locale = useLocale();
  const { t } = getTranslations(locale);

  return (
    <div className={cn("mt-6", className)} {...props}>
      <Accordions type="single">
        <Accordion id="solution" title={title ?? t("showSolution")}>
          {children}
        </Accordion>
      </Accordions>
    </div>
  );
}

Solution.displayName = "Solution";
