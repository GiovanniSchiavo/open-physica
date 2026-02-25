import { cva } from "class-variance-authority";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  XCircle,
} from "lucide-react";
import { Children, cloneElement, isValidElement } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CalloutType = "info" | "warn" | "error" | "tip" | "default";

interface CalloutProps {
  title?: string;
  type?: CalloutType;
  children: ReactNode;
  className?: string;
}

interface CalloutTitleProps {
  children: ReactNode;
}

const calloutVariants = cva(
  `
    my-6 rounded-lg border px-5 py-4 shadow-sm
    [&_p]:leading-relaxed
  `,
  {
    variants: {
      tone: {
        info: `
          border-info
          bg-[color-mix(in_oklch,var(--info)_12%,var(--card))]
          text-card-foreground
        `,
        warn: `
          border-warn
          bg-[color-mix(in_oklch,var(--warn)_12%,var(--card))]
          text-card-foreground
        `,
        error: `
          border-destructive
          bg-[color-mix(in_oklch,var(--destructive)_10%,var(--card))]
          text-card-foreground
        `,
        tip: `
          border-success
          bg-[color-mix(in_oklch,var(--success)_12%,var(--card))]
          text-card-foreground
        `,
        default: "border-border bg-card text-card-foreground",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

const iconVariants = cva("size-4", {
  variants: {
    tone: {
      info: "text-info",
      warn: "text-warn",
      error: "text-destructive",
      tip: "text-success",
      default: "text-foreground",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

const iconMap: Record<
  CalloutType,
  React.ComponentType<{ className?: string }>
> = {
  info: Info,
  warn: AlertTriangle,
  error: XCircle,
  tip: Lightbulb,
  default: AlertCircle,
};

export function CalloutTitle({ children }: CalloutTitleProps) {
  return <>{children}</>;
}

CalloutTitle.displayName = "CalloutTitle";

export function Callout({
  title,
  type = "info",
  children,
  className,
}: CalloutProps) {
  const Icon = iconMap[type];

  let titleContent: ReactNode = title;
  const otherChildren: Array<ReactNode> = [];

  const isCalloutTitleElement = (
    child: unknown,
  ): child is React.ReactElement<CalloutTitleProps> =>
    isValidElement(child) &&
    ((child.type as { displayName?: string }).displayName === "CalloutTitle" ||
      child.type === CalloutTitle);

  const isElementWithChildren = (
    child: unknown,
  ): child is React.ReactElement<{ children?: ReactNode }> =>
    isValidElement(child);
  Children.forEach(children, (child) => {
    if (isCalloutTitleElement(child)) {
      titleContent = child.props.children;
      return;
    }

    if (isElementWithChildren(child) && child.props.children) {
      const nestedChildren = Children.toArray(child.props.children);
      let foundTitle = false;
      const filteredChildren: Array<ReactNode> = [];
      for (const nested of nestedChildren) {
        if (isCalloutTitleElement(nested)) {
          titleContent = nested.props.children;
          foundTitle = true;
          continue;
        }
        filteredChildren.push(nested);
      }

      if (foundTitle) {
        if (filteredChildren.length > 0) {
          otherChildren.push(
            cloneElement(child, {
              children: filteredChildren,
            }),
          );
        }
        return;
      }
    }

    otherChildren.push(child);
  });

  return (
    <div
      className={cn(
        calloutVariants({ tone: type }),
        "flex items-start gap-3",
        className,
      )}
    >
      <Icon className={cn(iconVariants({ tone: type }))} />
      <div className="min-w-0 flex-1">
        {titleContent && (
          <div className="mb-1 text-base font-semibold">{titleContent}</div>
        )}
        <div className="text-sm text-[color-mix(in_oklch,var(--foreground)_78%,transparent)] [&_.katex-display]:w-full">
          {otherChildren.map((child, index) => {
            if (isValidElement(child) && child.key == null) {
              return cloneElement(child as React.ReactElement, {
                key: `callout-child-${index}`,
              });
            }
            return child;
          })}
        </div>
      </div>
    </div>
  );
}
