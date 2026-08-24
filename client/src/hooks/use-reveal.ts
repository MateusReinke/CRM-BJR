import { useEffect, useRef, useState } from "react";

// Marks <html> as JS-capable once. Every .bjr-reveal element is opacity:1
// in plain CSS (see index.css); only html.js-ready hides it pending its
// own is-visible flip. Idempotent, safe to call from every hook instance.
function markJsReady() {
  document.documentElement.classList.add("js-ready");
}

/**
 * One independent IntersectionObserver per call site — deliberately not a
 * single hook tracking a list by index. Each revealed element (a ficha
 * card, a promo card, a heading) owns its own ref/observer/state, so one
 * element failing to intersect can never leave a sibling stuck invisible.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(delayMs = 0) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    markJsReady();

    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "-10% 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return {
    ref,
    isVisible,
    className: `bjr-reveal${isVisible ? " is-visible" : ""}`,
    style: delayMs ? { transitionDelay: `${delayMs}ms` } : undefined,
  };
}
