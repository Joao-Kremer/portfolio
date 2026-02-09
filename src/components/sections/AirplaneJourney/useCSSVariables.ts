"use client";

import { useState, useEffect } from "react";

export type ThemeColors = {
  primary: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  background: string;
  foreground: string;
  card: string;
  isDark: boolean;
};

const DEFAULT_COLORS: ThemeColors = {
  primary: "#6d28d9",
  gradientFrom: "#6d28d9",
  gradientVia: "#a78bfa",
  gradientTo: "#c084fc",
  background: "#fafafa",
  foreground: "#0a0a0a",
  card: "#ffffff",
  isDark: false,
};

function readColors(): ThemeColors {
  if (typeof window === "undefined") return DEFAULT_COLORS;
  const styles = getComputedStyle(document.documentElement);
  const get = (v: string) => styles.getPropertyValue(v).trim();
  return {
    primary: get("--primary") || DEFAULT_COLORS.primary,
    gradientFrom: get("--gradient-from") || DEFAULT_COLORS.gradientFrom,
    gradientVia: get("--gradient-via") || DEFAULT_COLORS.gradientVia,
    gradientTo: get("--gradient-to") || DEFAULT_COLORS.gradientTo,
    background: get("--background") || DEFAULT_COLORS.background,
    foreground: get("--foreground") || DEFAULT_COLORS.foreground,
    card: get("--card") || DEFAULT_COLORS.card,
    isDark: document.documentElement.classList.contains("dark"),
  };
}

export default function useCSSVariables(): ThemeColors {
  // Lazy initializer: since this hook only runs inside AirplaneScene (ssr: false),
  // we can safely read CSS variables synchronously on the very first render.
  // This eliminates the wrong-colors flash (e.g. light-mode fog in dark mode).
  const [colors, setColors] = useState<ThemeColors>(() =>
    typeof window !== "undefined" ? readColors() : DEFAULT_COLORS
  );

  useEffect(() => {
    // Re-read in case the lazy init ran before CSS was fully applied
    setColors(readColors());

    const observer = new MutationObserver(() => {
      requestAnimationFrame(() => setColors(readColors()));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-palette"],
    });

    return () => observer.disconnect();
  }, []);

  return colors;
}
