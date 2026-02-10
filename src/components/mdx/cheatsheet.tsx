import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./cheatsheet.css";

export function Cheatsheet({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "cheatsheet-container",
        "m-0 grid w-full max-w-full min-w-0 gap-[0.35rem] overflow-hidden px-2 pt-2 pb-3",
        "print:gap-[0.15rem] print:px-0 print:pt-0 print:pb-0 print:text-[6px] print:leading-[1.1] print:text-black! print:[-webkit-print-color-adjust:exact] print:[print-color-adjust:exact]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CheatsheetGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "cheatsheet-grid",
        "grid w-full max-w-full min-w-0 items-stretch gap-[0.6rem]",
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        "print:grid-cols-4 print:gap-[0.2rem]",
        className,
      )}
    >
      {children}
    </div>
  );
}

type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | "full";

const colSpanClass: Record<ColSpan, string> = {
  1: "col-span-1",
  2: "col-span-1 md:col-span-2",
  3: "col-span-1 md:col-span-2 lg:col-span-3",
  4: "col-span-1 md:col-span-2 lg:col-span-3 print:col-span-4",
  5: "col-span-1 md:col-span-2 lg:col-span-3 print:col-span-4",
  6: "col-span-1 md:col-span-2 lg:col-span-3 print:col-span-4",
  full: "col-span-full",
};

export function CheatsheetColumn({
  children,
  span = 1,
}: {
  children: ReactNode;
  span?: ColSpan;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col gap-[0.6rem] print:gap-[0.2rem]",
        colSpanClass[span],
      )}
    >
      {children}
    </div>
  );
}

type ContentColumns = 1 | 2 | 3;

const contentColsClass: Record<ContentColumns, string> = {
  1: "",
  2: "md:columns-2 gap-x-3",
  3: "md:columns-2 lg:columns-3 gap-x-3",
};

export function CheatsheetSection({
  title,
  children,
  span = 1,
  columns = 1,
  variant = "default",
}: {
  title: string;
  children: ReactNode;
  span?: ColSpan;
  columns?: ContentColumns;
  variant?: "default" | "table";
}) {
  return (
    <section
      className={cn(
        "cheatsheet-section relative flex max-w-full min-w-0 flex-1 break-inside-avoid flex-col",
        "bg-card text-card-foreground rounded-lg border shadow-sm",
        "print:rounded-none print:border-[0.5px] print:shadow-none",
        colSpanClass[span],
      )}
    >
      <header className="cheatsheet-header border-l-primary flex items-center rounded-t-lg border-b border-l-[3px] px-3 py-1.5 print:border-l-2! print:border-l-[#333]! print:bg-[#eee]! print:px-1.5 print:py-0.5">
        <h3 className="cheatsheet-title mt-2.5 mb-1 flex items-center gap-2 text-sm leading-none font-bold tracking-wider uppercase print:text-[7px]">
          {title}
        </h3>
      </header>
      <div
        className={cn(
          "cheatsheet-body max-w-full min-w-0 flex-1 overflow-x-auto text-[11px]",
          variant === "table" ? "p-[0.4rem] pb-[0.6rem]" : "p-1.5",
          contentColsClass[columns],
          "print:p-1 print:text-[7px]",
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return (
    <span className="border-l-warn text-muted-foreground mt-1 block border-l-2 pl-1.5 text-xs italic print:mt-0.5 print:border-l-[1.5px]! print:border-l-[#999]! print:text-[6.5px]">
      {children}
    </span>
  );
}
