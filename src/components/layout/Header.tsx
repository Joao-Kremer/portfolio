"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, Orbit, Briefcase, MessageCircle, Github, Linkedin, Mail } from "lucide-react";
import ThemePanel from "@/components/ui/ThemePanel";
import LangToggle from "@/components/ui/LangToggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { key: "about", icon: User },
  { key: "skills", icon: Orbit },
  { key: "experience", icon: Briefcase },
  { key: "contact", icon: MessageCircle },
];

const mobileSocials = [
  { icon: Github, href: "https://github.com/Joao-Kremer", label: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/joaokremer/", label: "LinkedIn" },
  { icon: Mail, href: "mailto:joaokremer.developer@gmail.com", label: "Email" },
];

export default function Header() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const progress = scrollTop / (scrollHeight - clientHeight);
      setScrollProgress(Math.min(progress, 1));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/60 backdrop-blur-xl border-b border-border/30 shadow-lg shadow-black/5 dark:bg-background/40 dark:border-white/[0.08]"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-lg font-bold tracking-tight transition-colors hover:text-primary"
        >
          JV<span className="text-primary">K</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ key }) => (
            <div
              key={key}
              className="relative"
              onMouseEnter={() => setHoveredLink(key)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <button
                onClick={() => scrollTo(key)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {t(key)}
              </button>

              <AnimatePresence>
                {hoveredLink === key && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={cn(
                      "absolute left-1/2 top-full mt-2 w-56 -translate-x-1/2",
                      "rounded-xl border border-border/50 bg-card p-3 shadow-xl shadow-black/10",
                      "pointer-events-none"
                    )}
                  >
                    <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-border/50 bg-card" />
                    <p className="relative text-xs leading-relaxed text-muted-foreground">
                      {t(`preview_${key}`)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LangToggle />
          <ThemePanel />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/50 md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border/30 bg-background/80 backdrop-blur-xl md:hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ key, icon: Icon }, i) => (
                <motion.button
                  key={key}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                  onClick={() => scrollTo(key)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-3",
                    "text-left transition-colors hover:bg-muted/50 active:bg-muted/70"
                  )}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">
                      {t(key)}
                    </span>
                    <span className="block text-[11px] leading-tight text-muted-foreground line-clamp-1">
                      {t(`preview_${key}`)}
                    </span>
                  </div>
                </motion.button>
              ))}

              {/* Divider */}
              <div className="!my-3 h-px bg-border/30" />

              {/* Social links */}
              <div className="flex items-center justify-center gap-3 pb-1">
                {mobileSocials.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      "bg-muted/50 text-muted-foreground transition-colors",
                      "hover:bg-primary/10 hover:text-primary active:bg-primary/20"
                    )}
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Scroll progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] transition-none"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>
    </header>
  );
}
