"use client";

import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { Check, Link as LinkIcon } from "lucide-react";
import {
  
  useEffect,
  useRef,
  useState
} from "react";
import { mergeRefs } from "../../lib/merge-refs";
import { cn } from "../../lib/utils";
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
  Accordion as Root,
} from "../ui/accordion";
import { buttonVariants } from "../ui/button";
import type {ComponentProps,
  ReactNode} from "react";

export function Accordions({
  type = "single",
  ref,
  className,
  defaultValue,
  ...props
}: ComponentProps<typeof Root>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const composedRef = mergeRefs(ref, rootRef);

  // Compute initial value including any hash-based accordion
  const [value, setValue] = useState<string | Array<string>>(() => {
    const baseValue =
      type === "single" ? (defaultValue ?? "") : (defaultValue ?? []);

    // Check for hash-based opening (client-side only)
    if (typeof window === "undefined") return baseValue;

    const id = window.location.hash.substring(1);
    if (!id) return baseValue;

    // We'll handle the actual element check in useEffect for scrolling
    // but open the accordion optimistically based on the hash
    return typeof baseValue === "string" ? id : [id, ...baseValue];
  });

  // Handle scrolling to the element after mount
  useEffect(() => {
    const id = window.location.hash.substring(1);
    if (!id) return;

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    // @ts-expect-error -- Multiple types
    <Root
      type={type}
      ref={composedRef}
      value={value}
      onValueChange={setValue}
      collapsible={type === "single" ? true : undefined}
      className={cn(
        "divide-fd-border bg-fd-card divide-y overflow-hidden rounded-lg border",
        className,
      )}
      {...props}
    />
  );
}

export function Accordion({
  title,
  id,
  value = String(title),
  headerActions,
  children,
  ...props
}: Omit<ComponentProps<typeof AccordionItem>, "value" | "title"> & {
  title: string | ReactNode;
  value?: string;
  headerActions?: ReactNode;
}) {
  return (
    <AccordionItem value={value} {...props}>
      <AccordionHeader id={id} data-accordion-value={value}>
        <AccordionTrigger>{title}</AccordionTrigger>
        {headerActions}
        {id ? <CopyButton id={id} /> : null}
      </AccordionHeader>
      <AccordionContent>
        <div className="prose-no-margin px-4 pb-2 text-[0.9375rem]">
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
