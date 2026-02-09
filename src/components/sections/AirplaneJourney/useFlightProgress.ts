"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Tracks scroll progress (0-1) of a tall container element.
 * Returns a mutable ref for use inside R3F useFrame (avoids React re-renders).
 */
export default function useFlightProgress(
  containerRef: RefObject<HTMLDivElement | null>
) {
  const progressRef = useRef(0);

  useEffect(() => {
    // Read containerRef.current fresh on every callback instead of capturing once.
    // This handles cases where the ref is set after the effect runs (dynamic imports,
    // conditional rendering) and avoids stale closures over detached DOM elements.
    const update = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollRange = container.offsetHeight - window.innerHeight;
      if (scrollRange <= 0) return;
      const scrolled = -rect.top;
      progressRef.current = Math.max(0, Math.min(1, scrolled / scrollRange));
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [containerRef]);

  return progressRef;
}
