"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Sun, Moon, Monitor, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePalette, PALETTES } from "./PaletteProvider";

export default function ThemePanel() {
  const t = useTranslations("theme_panel");
  const { theme, setTheme } = useTheme();
  const { palette, setPalette } = usePalette();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  const modes = [
    { id: "light", icon: Sun, label: t("light") },
    { id: "dark", icon: Moon, label: t("dark") },
    { id: "system", icon: Monitor, label: t("system") },
  ] as const;

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-full",
          "bg-muted/50 text-foreground transition-all duration-300",
          "hover:bg-muted hover:scale-110",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        )}
        aria-label={t("title")}
      >
        <Settings className="h-4 w-4" />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                {/* Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
                  onClick={() => setOpen(false)}
                />

                {/* Panel */}
                <motion.div
                  ref={panelRef}
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed right-0 top-0 z-[101] h-full w-80 border-l border-border/50 bg-background shadow-2xl"
                >
                  <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
                      <h2 className="text-lg font-bold">{t("title")}</h2>
                      <button
                        onClick={() => setOpen(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
                      {/* Mode Section */}
                      <div>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          {t("mode")}
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          {modes.map(({ id, icon: Icon, label }) => (
                            <button
                              key={id}
                              onClick={() => setTheme(id)}
                              className={cn(
                                "flex flex-col items-center gap-2 rounded-xl px-3 py-3",
                                "border transition-all duration-200",
                                theme === id
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                              <span className="text-xs font-medium">
                                {label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color Section */}
                      <div>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          {t("color")}
                        </h3>
                        <div className="grid grid-cols-5 gap-3">
                          {PALETTES.map(({ id, color }) => (
                            <button
                              key={id}
                              onClick={() => setPalette(id)}
                              className={cn(
                                "group relative flex h-10 w-10 items-center justify-center rounded-full",
                                "transition-all duration-200 hover:scale-110"
                              )}
                              style={{
                                backgroundColor: color,
                                boxShadow:
                                  palette === id
                                    ? `0 0 0 2px var(--background), 0 0 0 4px ${color}`
                                    : undefined,
                              }}
                              aria-label={id}
                            >
                              {palette === id && (
                                <Check className="h-4 w-4 text-white" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
