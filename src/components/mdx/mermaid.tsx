"use client";

import { use, useId, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
const themeMediaQuery = "(prefers-color-scheme: dark)";

function getIsDark() {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return false;
  }

  const root = document.documentElement;
  const dataTheme = root.getAttribute("data-theme");
  const dataScheme = root.getAttribute("data-color-scheme");

  if (root.classList.contains("dark")) return true;
  if (dataTheme === "dark") return true;
  if (dataScheme === "dark") return true;

  return window.matchMedia(themeMediaQuery).matches;
}

function subscribeToThemeChanges(callback: () => void) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  const onChange = () => callback();
  const mediaQuery = window.matchMedia(themeMediaQuery);

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", onChange);
  } else {
    mediaQuery.addListener(onChange);
  }

  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme", "data-color-scheme"],
  });

  return () => {
    if (typeof mediaQuery.removeEventListener === "function") {
      mediaQuery.removeEventListener("change", onChange);
    } else {
      mediaQuery.removeListener(onChange);
    }
    observer.disconnect();
  };
}

export function Mermaid({ chart }: { chart: string }) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) return null;
  return <MermaidContent chart={chart} />;
}

const cache = new Map<string, Promise<unknown>>();

function cachePromise<T>(
  key: string,
  setPromise: () => Promise<T>,
): Promise<T> {
  const cached = cache.get(key);
  if (cached) return cached as Promise<T>;

  const promise = setPromise();
  cache.set(key, promise);
  return promise;
}

/** Convert HSL CSS value to hex color for Mermaid */
function hslToHex(hsl: string): string {
  const match = hsl.match(/hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\)/);
  if (!match) return hsl;

  const h = Number.parseFloat(match[1]) / 360;
  const s = Number.parseFloat(match[2]) / 100;
  const l = Number.parseFloat(match[3]) / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    const tt = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Get theme variables from CSS custom properties */
function getThemeVariables(isDark: boolean) {
  const style = getComputedStyle(document.documentElement);

  const getCSSVar = (name: string) => {
    const value = style.getPropertyValue(name).trim();
    return value ? hslToHex(value) : undefined;
  };

  const background =
    getCSSVar("--background") ?? (isDark ? "#1e1e2e" : "#f0f1f5");
  const foreground =
    getCSSVar("--foreground") ?? (isDark ? "#c6d0f5" : "#4c4f69");
  const primary = getCSSVar("--primary") ?? (isDark ? "#f9e2af" : "#d97706");
  const secondary =
    getCSSVar("--secondary") ?? (isDark ? "#313244" : "#ccd0da");
  const muted = getCSSVar("--muted") ?? (isDark ? "#45475a" : "#bcc0cc");
  const border = getCSSVar("--border") ?? (isDark ? "#45475a" : "#9ca0b0");

  return {
    darkMode: isDark,
    background,
    fontFamily: "inherit",
    primaryColor: primary,
    primaryTextColor: background,
    primaryBorderColor: border,
    secondaryColor: secondary,
    secondaryTextColor: foreground,
    secondaryBorderColor: border,
    tertiaryColor: muted,
    tertiaryTextColor: foreground,
    tertiaryBorderColor: border,
    lineColor: foreground,
    textColor: foreground,
    mainBkg: secondary,
    nodeBorder: border,
    clusterBkg: muted,
    clusterBorder: border,
    titleColor: foreground,
    edgeLabelBackground: secondary,
    nodeTextColor: foreground,
    actorBkg: secondary,
    actorBorder: border,
    actorTextColor: foreground,
    actorLineColor: border,
    noteBkgColor: primary,
    noteTextColor: background,
    noteBorderColor: border,
  };
}

function MermaidContent({ chart }: { chart: string }) {
  const id = useId();
  const isDark = useSyncExternalStore(
    subscribeToThemeChanges,
    getIsDark,
    () => false,
  );

  const { default: mermaid } = use(
    cachePromise("mermaid", () => import("mermaid")),
  );

  const themeVariables = getThemeVariables(isDark);

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    fontFamily: "inherit",
    theme: "base",
    themeVariables,
  });

  // Resolve CSS variables in chart content and convert HSL to hex for Mermaid
  const resolvedChart = chart.replace(
    /var\(--([^)]+)\)/g,
    (match, name: string) => {
      const style = getComputedStyle(document.documentElement);
      const value = style.getPropertyValue(`--${name}`).trim();
      return value ? hslToHex(value) : match;
    },
  );

  const { svg, bindFunctions } = use(
    cachePromise(`${chart}-${isDark ? "dark" : "light"}`, () => {
      return mermaid.render(id, resolvedChart.replaceAll("\\n", "\n"));
    }),
  );

  return (
    <div
      className="overflow-x-auto py-4 [&_svg]:max-w-full!"
      ref={(container) => {
        if (container) bindFunctions?.(container);
      }}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Mermaid SVG rendering
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
