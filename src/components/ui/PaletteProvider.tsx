"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const PALETTES = [
  { id: "violet", color: "#6d28d9" },
  { id: "blue", color: "#2563eb" },
  { id: "emerald", color: "#059669" },
  { id: "rose", color: "#e11d48" },
  { id: "amber", color: "#d97706" },
  { id: "cyan", color: "#0891b2" },
  { id: "orange", color: "#ea580c" },
  { id: "pink", color: "#db2777" },
  { id: "indigo", color: "#4f46e5" },
  { id: "slate", color: "#475569" },
] as const;

export type PaletteId = (typeof PALETTES)[number]["id"];

type PaletteContextType = {
  palette: PaletteId;
  setPalette: (palette: PaletteId) => void;
};

const PaletteContext = createContext<PaletteContextType>({
  palette: "violet",
  setPalette: () => {},
});

export function usePalette() {
  return useContext(PaletteContext);
}

const STORAGE_KEY = "portfolio-palette";

export default function PaletteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [palette, setPaletteState] = useState<PaletteId>("violet");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as PaletteId | null;
    if (stored && PALETTES.some((p) => p.id === stored)) {
      setPaletteState(stored);
      document.documentElement.setAttribute("data-palette", stored);
    }
    setMounted(true);
  }, []);

  const setPalette = (newPalette: PaletteId) => {
    setPaletteState(newPalette);
    localStorage.setItem(STORAGE_KEY, newPalette);
    if (newPalette === "violet") {
      document.documentElement.removeAttribute("data-palette");
    } else {
      document.documentElement.setAttribute("data-palette", newPalette);
    }
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <PaletteContext.Provider value={{ palette, setPalette }}>
      {children}
    </PaletteContext.Provider>
  );
}
