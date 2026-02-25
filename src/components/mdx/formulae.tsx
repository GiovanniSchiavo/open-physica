import { FunctionSquare, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { getTranslations } from "@/lib/translations";

export interface FormulaeProps {
  /** The formulae content */
  children: ReactNode;
  /** Optional title for the drawer */
  title?: string;
  /** Locale used for UI labels */
  locale?: string;
}

/**
 * Formulae component - renders a floating button that opens a drawer
 * with useful formulas for solving exercises. Use this within exercise
 * pages to provide a quick reference for relevant equations.
 *
 * @example
 * ```mdx
 * <Formulae>
 *   $$ T = 2\pi \sqrt{\frac{L}{g}} $$
 *   (Valid for small oscillations)
 * </Formulae>
 * ```
 */
export function Formulae({ children, title, locale }: FormulaeProps) {
  const { t } = getTranslations(locale ?? "en");

  return (
    <div className="not-prose fixed right-6 bottom-6 z-50">
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary data-[state=open]:bg-primary/20 data-[state=open]:ring-primary/30 gap-1.5 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 data-[state=open]:ring-2"
          >
            <FunctionSquare className="size-4" />
            <span>{t("formulaeButton")}</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-prose">
            <DrawerHeader className="relative">
              <DrawerTitle>{title ?? t("formulaeTitle")}</DrawerTitle>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 size-8"
                >
                  <X className="size-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <div className="prose prose-sm dark:prose-invert max-w-none overflow-y-auto px-4 pb-8">
              {children}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

Formulae.displayName = "Formulae";
