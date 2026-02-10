"use client";

import { useTranslations } from "next-intl";
import { Github, Linkedin, Mail } from "lucide-react";

const navLinks = ["about", "skills", "experience", "contact"];

const socials = [
  { icon: Github, href: "https://github.com/Joao-Kremer", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/in/joaokremer", label: "LinkedIn" },
  { icon: Mail, href: "mailto:joao@enhancefitness.com", label: "Email" },
];

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/50 bg-muted/30">
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--gradient-from)] to-transparent opacity-50" />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Logo + description */}
          <div className="space-y-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-xl font-bold tracking-tight transition-colors hover:text-primary"
            >
              JV<span className="text-primary">K</span>
            </button>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("description")}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              {t("nav_title")}
            </h4>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link}
                  onClick={() => scrollTo(link)}
                  className="w-fit text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {tNav(link)}
                </button>
              ))}
            </nav>
          </div>

          {/* Social links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              {t("social_title")}
            </h4>
            <div className="flex flex-col gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/30 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {year} João Vitor Melo Kremer. {t("copyright")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("built_with")} Next.js & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
