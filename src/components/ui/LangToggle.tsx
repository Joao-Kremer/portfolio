"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

export default function LangToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const newLocale = locale === "pt" ? "en" : "pt";

  return (
    <Link
      href={pathname}
      locale={newLocale}
      className={cn(
        "flex h-9 items-center gap-1.5 rounded-full px-3",
        "bg-muted/50 text-sm font-medium text-foreground transition-all duration-300",
        "hover:bg-muted hover:scale-105",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      )}
      aria-label="Toggle language"
    >
      <Globe className="h-3.5 w-3.5" />
      <span className="uppercase">{locale === "pt" ? "EN" : "PT"}</span>
    </Link>
  );
}
