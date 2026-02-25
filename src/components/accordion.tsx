"use client";

import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { Check, Link as LinkIcon } from "lucide-react";
import { useRef, useState } from "react";
import { mergeRefs } from "../lib/merge-refs";
import { cn } from "../lib/utils";
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
  Accordion as Root,
} from "./ui/accordion";
import { buttonVariants } from "./ui/button";
import type { ComponentProps, ReactNode } from "react";

export function Accordions({
  ref,
  className,
  defaultValue,
  ...props
}: ComponentProps<typeof Root>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const composedRef = mergeRefs(ref, rootRef);
  const [value, setValue] = useState<Array<string>>(() => {
    const initialValue = defaultValue ?? [];
    if (typeof window === "undefined") return initialValue;

    const id = window.location.hash.substring(1);
    if (id.length === 0) return initialValue;

    const selected = document.getElementById(id);
    const selectedValue = selected?.getAttribute("data-accordion-value");
    if (!selectedValue) return initialValue;

    return [selectedValue, ...initialValue];
  });

  return (
    <Root
      ref={composedRef}
      value={value}
      onValueChange={setValue}
      className={(s) =>
        cn(
          "divide-fd-border bg-fd-card divide-y overflow-hidden rounded-lg border",
          typeof className === "function" ? className(s) : className,
        )
      }
      {...props}
    />
  );
}

export function Accordion({
  title,
  id,
  value = String(title),
  children,
  ...props
}: Omit<ComponentProps<typeof AccordionItem>, "value" | "title"> & {
  title: string | ReactNode;
  value?: string;
}) {
  return (
    <AccordionItem value={value} {...props}>
      <AccordionHeader id={id} data-accordion-value={value}>
        <AccordionTrigger>{title}</AccordionTrigger>
        {id ? <CopyButton id={id} /> : null}
      </AccordionHeader>
      <AccordionContent hiddenUntilFound>
        <div className="prose-no-margin px-4 pb-2 text-[0.9375rem] [&[hidden]:not([hidden='until-found'])]:hidden">
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function CopyButton({ id }: { id: string }) {
  const [checked, onClick] = useCopyButton(() => {
    const url = new URL(window.location.href);
    url.hash = id;

    return navigator.clipboard.writeText(url.toString());
  });

  return (
    <button
      type="button"
      aria-label="Copy Link"
      className={cn(
        buttonVariants({
          variant: "ghost",
          className: "text-fd-muted-foreground me-2",
        }),
      )}
      onClick={onClick}
    >
      {checked ? (
        <Check className="size-3.5" />
      ) : (
        <LinkIcon className="size-3.5" />
      )}
    </button>
  );
}
