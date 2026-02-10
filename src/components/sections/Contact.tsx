"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, MessageCircle, ArrowUpRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMBER = "5521998090895";
const WHATSAPP_MESSAGE_PT =
  "Olá João! Vi seu portfólio e gostaria de conversar sobre um projeto. Podemos marcar uma call?";
const WHATSAPP_MESSAGE_EN =
  "Hi João! I saw your portfolio and would like to discuss a project. Can we schedule a call?";

const socials = [
  {
    key: "github",
    icon: Github,
    href: "https://github.com/Joao-Kremer",
    label: "GitHub",
  },
  {
    key: "linkedin",
    icon: Linkedin,
    href: "https://linkedin.com/in/joaokremer",
    label: "LinkedIn",
  },
  {
    key: "email",
    icon: Mail,
    href: "mailto:joao@enhancefitness.com",
    label: "E-mail",
  },
];

export default function Contact() {
  const t = useTranslations("contact");

  const whatsappMessage =
    t("cta_whatsapp") === "Chamar no WhatsApp"
      ? WHATSAPP_MESSAGE_PT
      : WHATSAPP_MESSAGE_EN;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section id="contact" className="py-24 px-4">
      <div className="mx-auto max-w-2xl text-center">
        <AnimatedSection>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="gradient-text">{t("heading")}</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
        </AnimatedSection>

        {/* CTA buttons */}
        <AnimatedSection delay={0.2}>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {/* WhatsApp - primary */}
            <motion.a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "inline-flex items-center gap-2.5 rounded-full px-8 py-4",
                "bg-[#25D366] text-white font-medium text-lg",
                "shadow-lg shadow-[#25D366]/25 transition-shadow hover:shadow-xl hover:shadow-[#25D366]/30"
              )}
            >
              <MessageCircle className="h-5 w-5" />
              {t("cta_whatsapp")}
            </motion.a>

            {/* Email - secondary */}
            <motion.a
              href="mailto:joao@enhancefitness.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "inline-flex items-center gap-2.5 rounded-full px-8 py-4",
                "border border-border/50 bg-card/50 font-medium text-lg text-foreground",
                "transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              )}
            >
              <Mail className="h-5 w-5" />
              {t("cta_email")}
            </motion.a>
          </div>
        </AnimatedSection>

        {/* Social links */}
        <AnimatedSection delay={0.3}>
          <p className="mt-12 text-sm text-muted-foreground">{t("or")}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {socials.map(({ key, icon: Icon, href, label }, i) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -3 }}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl border border-border/50 bg-card/50 px-5 py-4",
                  "transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-semibold text-foreground">
                    {label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {t(`socials.${key}`)}
                  </span>
                </div>
                <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </motion.a>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
