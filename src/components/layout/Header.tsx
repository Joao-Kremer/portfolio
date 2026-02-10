"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, Orbit, Briefcase, MessageCircle, Github, Linkedin, Mail, Info, Monitor, Sparkles } from "lucide-react";
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
  const tTip = useTranslations("mobile_tip");
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [tipOpen, setTipOpen] = useState(false);

  // Console Easter egg — runs once
  useEffect(() => {
    console.log(
      `%c
     ╔══════════════════════════════════════════╗
     ║                                          ║
     ║          👀  Hey, developer!              ║
     ║                                          ║
     ╚══════════════════════════════════════════╝`,
      "color: #ff6b35; font-family: monospace; font-size: 12px; font-weight: bold;"
    );
    console.log(
      "%c I see you poking around the code... I like that! 🔍",
      "color: #4ecdc4; font-size: 14px; font-weight: bold; padding: 4px 0;"
    );
    console.log(
      "%c This portfolio was built with Next.js, Three.js, Framer Motion & a lot of ☕",
      "color: #a0a0a0; font-size: 12px; padding: 2px 0;"
    );
    console.log(
      "%c ─────────────────────────────────────────────",
      "color: #333;"
    );
    console.log(
      "%c 🚀 Looking for a Full Stack Developer?",
      "color: #ff6b35; font-size: 16px; font-weight: bold; padding: 4px 0;"
    );
    console.log(
      "%c Let's build something amazing together!\n\n" +
      "   📧 joaokremer.developer@gmail.com\n" +
      "   💼 linkedin.com/in/joaokremer\n" +
      "   🐙 github.com/Joao-Kremer\n",
      "color: #e0e0e0; font-size: 12px; line-height: 1.8;"
    );
    console.log(
      "%c ✨ Obrigado pela visita! | Thanks for visiting! ✨",
      "background: linear-gradient(90deg, #ff6b35, #4ecdc4); color: #fff; font-size: 13px; font-weight: bold; padding: 8px 16px; border-radius: 6px;"
    );
  }, []);

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

  // Close tip on scroll
  useEffect(() => {
    if (!tipOpen) return;
    const close = () => setTipOpen(false);
    window.addEventListener("scroll", close, { passive: true, once: true });
    return () => window.removeEventListener("scroll", close);
  }, [tipOpen]);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    // Small delay so the menu exit animation doesn't interfere with scroll
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 50);
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-lg font-bold tracking-tight transition-colors hover:text-primary"
          >
            JV<span className="text-primary">K</span>
          </button>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            Beta
          </span>
        </div>

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
          {/* Mobile info tip */}
          <button
            onClick={() => setTipOpen(true)}
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-full md:hidden",
              "bg-primary/10 text-primary transition-colors active:bg-primary/20"
            )}
            aria-label="Info"
          >
            <Info className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
          </button>
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

      {/* Mobile tip modal */}
      <AnimatePresence>
        {tipOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTipOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            />
            {/* Bottom sheet */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "fixed bottom-0 left-0 right-0 z-[61] mx-auto max-w-lg",
                "rounded-t-3xl border-t border-border/30",
                "bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/20"
              )}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="h-1 w-10 rounded-full bg-border/50" />
              </div>

              <div className="px-6 pb-8 pt-2 text-center">
                {/* Icon */}
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-via)] shadow-lg shadow-primary/20">
                  <Monitor className="h-7 w-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="mb-2 text-lg font-bold">
                  <span className="gradient-text">{tTip("title")}</span>
                  {" "}
                  <Sparkles className="inline h-4 w-4 text-primary" />
                </h3>

                {/* Message */}
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {tTip("message")}
                </p>

                <p className="mb-5 text-xs font-medium text-primary/70">
                  {tTip("thanks")}
                </p>

                {/* Close button */}
                <button
                  onClick={() => setTipOpen(false)}
                  className={cn(
                    "w-full rounded-xl px-6 py-3 text-sm font-semibold",
                    "bg-primary text-primary-foreground",
                    "shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
                  )}
                >
                  {tTip("close")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
