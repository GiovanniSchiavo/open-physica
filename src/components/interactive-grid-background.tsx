"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InteractiveGridBackgroundProps {
  children?: ReactNode;
  gridGap?: number;
  dotSize?: number;
  radius?: number;
  color?: string;
  highlightColor?: string;
  className?: string;
}

/** Smooth cubic S-curve: no visible edge at proximity boundary */
function smoothstep(x: number) {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

/** Parse any CSS color string to [r, g, b] via an offscreen canvas pixel */
function parseToRgb(cssColor: string): [number, number, number] {
  const tmp = document.createElement("canvas");
  tmp.width = tmp.height = 1;
  const c = tmp.getContext("2d")!;
  c.fillStyle = cssColor;
  c.fillRect(0, 0, 1, 1);
  const d = c.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}

export function InteractiveGridBackground({
  children,
  gridGap = 40,
  dotSize = 1.5,
  radius = 300,
  color,
  highlightColor,
  className,
}: InteractiveGridBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const sizeRef = useRef({ w: 0, h: 0 });
  const colorsRef = useRef({ dot: "", glow: "", gr: 0, gg: 0, gb: 0 });
  const rafRef = useRef<number>(0);
  const nearDotsRef = useRef<Float32Array>(new Float32Array(8192));

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const getCSSColor = (v: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(v).trim();

    const refreshColors = () => {
      const dotColor = color ?? getCSSColor("--muted-foreground");
      const glowColor = highlightColor ?? getCSSColor("--primary");
      const [gr, gg, gb] = parseToRgb(glowColor);
      colorsRef.current = { dot: dotColor, glow: glowColor, gr, gg, gb };
    };
    refreshColors();

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      sizeRef.current = { w: container.offsetWidth, h: container.offsetHeight };
      canvas.width = sizeRef.current.w * dpr;
      canvas.height = sizeRef.current.h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const mo = new MutationObserver(refreshColors);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);

    const draw = (ts: number) => {
      const t = ts * 0.001;
      const { w: W, h: H } = sizeRef.current;
      const { x: mx, y: my } = mouseRef.current;
      const { dot: dotColor, glow: glowColor, gr, gg, gb } = colorsRef.current;
      const rgba = (a: number) => `rgba(${gr},${gg},${gb},${a})`;

      ctx.clearRect(0, 0, W, H);

      const cols = Math.ceil(W / gridGap) + 2;
      const rows = Math.ceil(H / gridGap) + 2;
      const buf = nearDotsRef.current;
      let nearCount = 0;

      // ── Pass 1: base dots ─────────────────────────────────────────────────
      ctx.shadowBlur = 0;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const bx = i * gridGap;
          const by = j * gridGap;

          const dx = bx - mx;
          const dy = by - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Gravitational pull toward cursor
          let gravX = 0,
            gravY = 0;
          if (dist > 0 && dist < radius) {
            const force = smoothstep(1 - dist / radius) * 45;
            gravX = -(dx / dist) * force;
            gravY = -(dy / dist) * force;
          }

          // Gravitational waves rippling outward
          let waveX = 0,
            waveY = 0;
          if (dist > 0 && dist < radius * 2.4) {
            const decay = Math.exp(-dist / (radius * 0.85));
            const wave = Math.sin(dist * 0.03 - t * 3.5) * 8.0 * decay;
            waveX = (dx / dist) * wave;
            waveY = (dy / dist) * wave;
          }

          // Ambient space morphing — two independent slow fields for organic look
          const ambX =
            Math.sin(bx * 0.015 + t * 0.22) *
              Math.cos(by * 0.011 + t * 0.17) *
              1.4 +
            Math.sin(bx * 0.009 + t * 0.14) * 0.6;
          const ambY =
            Math.cos(bx * 0.011 + t * 0.19) *
              Math.sin(by * 0.015 + t * 0.26) *
              1.4 +
            Math.cos(by * 0.009 + t * 0.11) * 0.6;

          const x = bx + gravX + waveX + ambX;
          const y = by + gravY + waveY + ambY;

          const rawProx = dist < radius ? 1 - dist / radius : 0;
          const prox = smoothstep(rawProx); // smooth S-curve
          const size = dotSize * (1 + prox * 1.6);

          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          if (prox > 0) {
            ctx.fillStyle = glowColor;
            ctx.globalAlpha = 0.1 + prox * 0.7;
          } else {
            ctx.fillStyle = dotColor;
            ctx.globalAlpha = 0.16;
          }
          ctx.fill();

          if (prox > 0.05 && nearCount + 4 <= buf.length) {
            buf[nearCount] = x;
            buf[nearCount + 1] = y;
            buf[nearCount + 2] = prox;
            buf[nearCount + 3] = size;
            nearCount += 4;
          }
        }
      }

      // ── Pass 2: shadow-bloom glow on near dots ────────────────────────────
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowColor = glowColor;
      ctx.fillStyle = glowColor;

      for (let k = 0; k < nearCount; k += 4) {
        const px = buf[k],
          py = buf[k + 1];
        const prox = buf[k + 2],
          size = buf[k + 3];
        ctx.shadowBlur = smoothstep(prox) * 20;
        ctx.globalAlpha = prox * 0.45;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // ── Pass 3: gravitational singularity ─────────────────────────────────
      const inBounds = mx > -20 && my > -20 && mx < W + 20 && my < H + 20;
      if (inBounds) {
        // Smooth radial nebula using rgba gradient stops
        const grd = ctx.createRadialGradient(mx, my, 0, mx, my, radius * 0.6);
        grd.addColorStop(0, rgba(0.2));
        grd.addColorStop(0.25, rgba(0.09));
        grd.addColorStop(0.6, rgba(0.03));
        grd.addColorStop(1, rgba(0));
        ctx.globalAlpha = 1;
        ctx.fillStyle = grd;
        ctx.fillRect(
          mx - radius * 0.6,
          my - radius * 0.6,
          radius * 1.2,
          radius * 1.2,
        );

        // Hard singularity core with bloom
        ctx.shadowBlur = 28;
        ctx.shadowColor = glowColor;
        ctx.fillStyle = glowColor;
        ctx.globalAlpha = 0.92;
        ctx.beginPath();
        ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      ro.disconnect();
      mo.disconnect();
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [gridGap, dotSize, radius, color, highlightColor]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 block h-full w-full"
      />
      {children}
    </div>
  );
}
