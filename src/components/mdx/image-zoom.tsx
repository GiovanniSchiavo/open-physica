"use client";

import { Image } from "fumadocs-core/framework";
import { useCallback, useEffect, useState } from "react";
import type { ImageProps } from "fumadocs-core/framework";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ImageZoomProps = ImageProps & {
  zoomInProps?: ComponentProps<"img">;
};

type ImageSize = "small" | "medium" | "large";

interface ParsedAltData {
  alt: string;
  size: ImageSize | null;
}

const SIZE_CLASSES: Record<ImageSize, string> = {
  small: "w-full max-w-xs mx-auto",
  medium: "w-full max-w-md mx-auto",
  large: "w-full",
};

function getImageSrc(src: ImageProps["src"]): string {
  if (typeof src === "string") return src;

  if (typeof src === "object" && src !== null) {
    if ("default" in src) {
      const defaultSrc = (src as { default: unknown }).default;
      if (
        typeof defaultSrc === "object" &&
        defaultSrc !== null &&
        "src" in defaultSrc
      ) {
        return String((defaultSrc as { src: unknown }).src);
      }
    }
    if ("src" in src) {
      return String(src.src);
    }
  }

  return "";
}

function parseAltText(alt: ImageProps["alt"]): ParsedAltData {
  if (typeof alt !== "string") {
    return { alt: "", size: null };
  }

  const tokens = alt.split("#").map((token) => token.trim());
  let size: ImageSize | null = null;
  let endIndex = tokens.length;

  while (endIndex > 1) {
    const tag = tokens[endIndex - 1];
    if (tag === "small" || tag === "medium" || tag === "large") {
      size = tag;
      endIndex -= 1;
      continue;
    }
    break;
  }

  const cleanAlt = tokens.slice(0, endIndex).join("#").trim();
  return { alt: cleanAlt, size };
}

function isSvgUrl(url: string): boolean {
  return /\.svg($|\?|#)/i.test(url) || url.startsWith("data:image/svg+xml");
}

function decodeSvgDataUri(src: string): string | null {
  if (!src.startsWith("data:image/svg+xml")) return null;
  try {
    return src.includes(";base64,")
      ? atob(src.split(";base64,")[1])
      : decodeURIComponent(src.split(",")[1]);
  } catch {
    return null;
  }
}

/**
 * Simple fullscreen zoom modal
 */
function ZoomModal({
  children,
  isOpen,
  onClose,
}: {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleEsc);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleEsc);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <span
      className="bg-background/95 fixed inset-0 z-100 flex cursor-zoom-out items-center justify-center backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <span className="max-h-[90vh] max-w-[90vw] overflow-auto">
        {children}
      </span>
    </span>
  );
}

/**
 * Inline SVG with zoom
 */
function InlineSvg({ src, alt }: { src: string; alt: string }) {
  const initialSvg = decodeSvgDataUri(src);
  const [svgContent, setSvgContent] = useState<string | null>(initialSvg);
  const [error, setError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleZoom = useCallback(() => setIsZoomed(true), []);
  const handleClose = useCallback(() => setIsZoomed(false), []);

  useEffect(() => {
    if (initialSvg) return;

    let cancelled = false;

    async function fetchSvg() {
      try {
        const response = await fetch(src);
        if (!response.ok) throw new Error("Failed to fetch SVG");
        const text = await response.text();
        if (!cancelled) {
          setSvgContent(text);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      }
    }

    fetchSvg();
    return () => {
      cancelled = true;
    };
  }, [src, initialSvg]);

  if (error) {
    return (
      // Fallback image for failed SVG fetch/render.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className="m-0! block h-auto w-full p-0!" />
    );
  }

  if (!svgContent) {
    return (
      <span className="bg-muted block h-48 w-full animate-pulse rounded" />
    );
  }

  return (
    <>
      <span
        className="inline-svg block cursor-zoom-in"
        role="img"
        aria-label={alt}
        onClick={handleZoom}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
      <ZoomModal isOpen={isZoomed} onClose={handleClose}>
        <span
          className="inline-svg block"
          style={{ width: "80vw", maxWidth: "1200px" }}
          role="img"
          aria-label={alt}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </ZoomModal>
    </>
  );
}

/**
 * Regular image with zoom
 */
function ZoomableImage({
  src,
  alt,
  className,
  ...props
}: ImageProps & { alt: string }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const srcString = getImageSrc(src);

  const handleZoom = useCallback(() => setIsZoomed(true), []);
  const handleClose = useCallback(() => setIsZoomed(false), []);

  return (
    <>
      <span onClick={handleZoom} className="block cursor-zoom-in">
        <Image
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px"
          {...props}
          src={src}
          alt={alt}
          className={cn("m-0! block h-auto w-full p-0!", className)}
        />
      </span>
      <ZoomModal isOpen={isZoomed} onClose={handleClose}>
        {/* Raw img keeps natural resolution inside the modal zoom overlay. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={srcString}
          alt={alt}
          className="max-h-[90vh] max-w-full object-contain"
        />
      </ZoomModal>
    </>
  );
}

export function ImageZoom({ children, ...props }: ImageZoomProps) {
  const srcString = getImageSrc(props.src);
  const { alt, size } = parseAltText(props.alt);
  const sizeClass = size ? SIZE_CLASSES[size] : SIZE_CLASSES.medium;
  const titleCaption =
    typeof props.title === "string" ? props.title.trim() : "";
  const isSvg = isSvgUrl(srcString);

  return (
    <span className={cn("flex flex-col items-center", sizeClass)}>
      <span
        className={cn(
          "bg-card block w-full overflow-hidden rounded-xl border leading-none shadow-sm transition-shadow hover:shadow-md",
        )}
      >
        {isSvg ? (
          <InlineSvg src={srcString} alt={alt} />
        ) : (
          (children ?? <ZoomableImage {...props} alt={alt} />)
        )}
      </span>
      {titleCaption && (
        <span className="text-muted-foreground mt-2 text-center text-sm italic">
          {titleCaption}
        </span>
      )}
    </span>
  );
}
