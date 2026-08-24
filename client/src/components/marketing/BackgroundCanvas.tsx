import { useEffect, useRef } from "react";
import { BACKGROUND_ICONS, type IconDrawFn } from "./background-icons";

// Depth layers per the art direction: distant/mid/near, each with its own
// scale, base opacity, blur and parallax factor. Ceiling is 0.07 absolute
// — none of these exceed it, and the render loop clamps defensively too.
const LAYERS = {
  distante: { scale: 0.6, opacity: 0.025, blur: 2, parallax: 0.1 },
  media: { scale: 1.0, opacity: 0.045, blur: 0, parallax: 0.25 },
  proxima: { scale: 1.4, opacity: 0.065, blur: 0, parallax: 0.45 },
} as const;

type LayerName = keyof typeof LAYERS;
const LAYER_NAMES = Object.keys(LAYERS) as LayerName[];

interface Particle {
  icon: number;
  layer: LayerName;
  xFrac: number;
  baseOffset: number; // position within the wrapping vertical band, px
  rotationBase: number;
  driftPeriodMs: number;
  driftPhase: number;
  pulsePeriodMs: number;
  pulsePhase: number;
  rotatePhase: number;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeParticles(count: number, bandHeight: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      icon: Math.floor(Math.random() * BACKGROUND_ICONS.length),
      layer: LAYER_NAMES[Math.floor(Math.random() * LAYER_NAMES.length)],
      xFrac: Math.random(),
      baseOffset: Math.random() * bandHeight,
      rotationBase: randomBetween(-6, 6),
      driftPeriodMs: randomBetween(8000, 20000),
      driftPhase: Math.random() * Math.PI * 2,
      pulsePeriodMs: randomBetween(4000, 7000),
      pulsePhase: Math.random() * Math.PI * 2,
      rotatePhase: Math.random() * Math.PI * 2,
    });
  }
  return particles;
}

function drawIcon(
  ctx: CanvasRenderingContext2D,
  drawFn: IconDrawFn,
  x: number,
  y: number,
  scale: number,
  rotationDeg: number,
  color: string,
  opacity: number,
  blurPx: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotationDeg * Math.PI) / 180);
  ctx.scale(scale, scale);
  ctx.lineWidth = 1.5 / scale;
  ctx.strokeStyle = color;
  ctx.globalAlpha = Math.min(opacity, 0.07);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.filter = blurPx ? `blur(${blurPx}px)` : "none";
  drawFn(ctx);
  ctx.restore();
}

/**
 * Single fixed canvas behind every section's content but above its flat
 * Óleo/Concreto background (see Section.tsx) — atmosphere, never the
 * protagonist. Icons live in a wrapping vertical band per layer so they
 * stay present across any page length regardless of parallax factor,
 * rather than being anchored to document coordinates that a slow parallax
 * factor would mostly never scroll into view.
 */
export function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const rootStyle = getComputedStyle(document.documentElement);
    const lightInk = rootStyle.getPropertyValue("--concreto").trim() || "#E8E4DC";
    const darkInk = rootStyle.getPropertyValue("--oleo").trim() || "#141210";

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let bandHeight = height * 1.6;
    let particles = makeParticles(width < 768 ? 10 : Math.round(randomBetween(18, 28)), bandHeight);
    let toneSections: { top: number; bottom: number; tone: string }[] = [];
    let rafId = 0;
    let frameCount = 0;
    const startTime = performance.now();

    function applyCanvasSize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function handleResize() {
      applyCanvasSize();
      bandHeight = height * 1.6;
      particles = makeParticles(width < 768 ? 10 : Math.round(randomBetween(18, 28)), bandHeight);
      if (reduceMotionQuery.matches) drawFrame(0);
    }

    function refreshToneSections() {
      const nodes = document.querySelectorAll<HTMLElement>("[data-bjr-tone]");
      const scrollY = window.scrollY;
      toneSections = Array.from(nodes).map((node) => {
        const rect = node.getBoundingClientRect();
        return { top: rect.top + scrollY, bottom: rect.bottom + scrollY, tone: node.dataset.bjrTone || "oleo" };
      });
    }

    function toneAtViewportY(viewportY: number): string {
      const docY = viewportY + window.scrollY;
      for (const s of toneSections) {
        if (docY >= s.top && docY < s.bottom) return s.tone;
      }
      return "oleo";
    }

    function drawFrame(elapsed: number) {
      ctx!.clearRect(0, 0, width, height);
      if (frameCount % 6 === 0 || elapsed === 0) refreshToneSections();
      frameCount++;

      const scrollY = window.scrollY;
      const reduced = reduceMotionQuery.matches;

      for (const p of particles) {
        const layer = LAYERS[p.layer];
        const rawY = p.baseOffset - (reduced ? 0 : scrollY * layer.parallax);
        let wrapped = rawY % bandHeight;
        if (wrapped < 0) wrapped += bandHeight;
        const y = wrapped - bandHeight * 0.2;
        const drift = reduced ? 0 : Math.sin((elapsed / p.driftPeriodMs) * Math.PI * 2 + p.driftPhase) * 12;
        const viewportY = y + drift;
        if (viewportY < -60 || viewportY > height + 60) continue;

        const x = p.xFrac * width;
        const rotationWobble = reduced ? 0 : Math.sin((elapsed / p.driftPeriodMs) * Math.PI * 2 + p.rotatePhase) * 6;
        const rotation = reduced ? p.rotationBase : rotationWobble;
        const pulse = reduced
          ? 1
          : 0.65 + 0.35 * ((Math.sin((elapsed / p.pulsePeriodMs) * Math.PI * 2 + p.pulsePhase) + 1) / 2);
        const tone = toneAtViewportY(viewportY);
        const color = tone === "concreto" ? darkInk : lightInk;

        drawIcon(ctx!, BACKGROUND_ICONS[p.icon], x, viewportY, layer.scale, rotation, color, layer.opacity * pulse, layer.blur);
      }
    }

    function loop(now: number) {
      if (document.hidden) {
        rafId = 0;
        return;
      }
      drawFrame(now - startTime);
      rafId = requestAnimationFrame(loop);
    }

    function handleVisibility() {
      if (!document.hidden && rafId === 0 && !reduceMotionQuery.matches) {
        rafId = requestAnimationFrame(loop);
      }
    }

    function handleMotionPreferenceChange() {
      if (reduceMotionQuery.matches) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
        drawFrame(0);
      } else if (!document.hidden && rafId === 0) {
        rafId = requestAnimationFrame(loop);
      }
    }

    applyCanvasSize();
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);
    reduceMotionQuery.addEventListener("change", handleMotionPreferenceChange);

    if (reduceMotionQuery.matches) {
      drawFrame(0);
    } else {
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      reduceMotionQuery.removeEventListener("change", handleMotionPreferenceChange);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-10" />;
}
