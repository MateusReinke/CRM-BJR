import { useEffect, useRef } from "react";

/** Subtle scroll-linked translateY. Disabled under 768px and for reduced motion. */
export function useParallax<T extends HTMLElement>(factor: number) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 768) return;

    let rafId = 0;
    function update() {
      const offset = Math.min(window.scrollY * factor, 120);
      if (node) node.style.transform = `translateY(${offset}px)`;
      rafId = 0;
    }
    function onScroll() {
      if (!rafId) rafId = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [factor]);

  return ref;
}
