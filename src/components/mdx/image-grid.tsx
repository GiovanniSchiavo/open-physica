import { Children, isValidElement } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";

export function ImageGrid({
  children,
  columns = 2,
}: {
  children: ReactNode;
  columns?: number;
}) {
  // Unwrap paragraph if it's the only child
  let items = children;
  const arrayChildren = Children.toArray(children);

  const firstChild = arrayChildren[0];

  if (
    arrayChildren.length === 1 &&
    isValidElement(firstChild) &&
    firstChild.type === "p"
  ) {
    items = (firstChild as ReactElement<{ children: ReactNode }>).props
      .children;
  }

  return (
    <div
      className="my-6 grid grid-cols-1 gap-6 lg:grid-cols-[repeat(var(--image-grid-cols),minmax(0,1fr))]"
      style={
        {
          "--image-grid-cols": columns,
        } as CSSProperties
      }
    >
      {items}
    </div>
  );
}
