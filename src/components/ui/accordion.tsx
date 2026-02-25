"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";

import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={
        typeof className === "function"
          ? (state) => cn("flex w-full flex-col", className(state))
          : cn("flex w-full flex-col", className)
      }
      {...props}
    />
  );
}

function AccordionItem({ children, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item data-slot="accordion-item" {...props}>
      {children}
    </AccordionPrimitive.Item>
  );
}

function AccordionHeader({
  className,
  children,
  ...props
}: AccordionPrimitive.Header.Props) {
  return (
    <AccordionPrimitive.Header
      data-slot="accordion-header"
      className={
        typeof className === "function"
          ? (state) =>
              cn(
                "not-prose flex flex-row items-center font-medium",
                className(state),
              )
          : cn("not-prose flex flex-row items-center font-medium", className)
      }
      {...props}
    >
      {children}
    </AccordionPrimitive.Header>
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Trigger
      data-slot="accordion-trigger"
      className={
        typeof className === "function"
          ? (state) =>
              cn(
                "group flex flex-1 cursor-pointer items-center gap-2 px-3 py-2.5 text-start text-sm outline-none focus-visible:underline",
                className(state),
              )
          : cn(
              "group flex flex-1 cursor-pointer items-center gap-2 px-3 py-2.5 text-start text-sm outline-none focus-visible:underline",
              className,
            )
      }
      {...props}
    >
      <ChevronRight className="text-muted-foreground size-4 shrink-0 transition-transform duration-200 group-data-panel-open:rotate-90" />
      {children}
    </AccordionPrimitive.Trigger>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={
        typeof className === "function"
          ? (state) =>
              cn(
                "h-(--accordion-panel-height) overflow-hidden text-sm transition-[height] ease-out data-ending-style:h-0 data-starting-style:h-0",
                className(state),
              )
          : cn(
              "h-(--accordion-panel-height) overflow-hidden text-sm transition-[height] ease-out data-ending-style:h-0 data-starting-style:h-0",
              className,
            )
      }
      {...props}
    >
      {children}
    </AccordionPrimitive.Panel>
  );
}

export {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
};
