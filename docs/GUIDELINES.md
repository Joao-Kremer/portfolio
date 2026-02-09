# Diretrizes do Projeto - Portfolio João Vitor Melo Kremer

## Visão Geral

Portfolio pessoal de João Vitor Melo Kremer, desenvolvedor Full Stack brasileiro baseado em Dubai. Single-page application com seções: Hero, VideoIntro, Journey, PhotoGallery, About, Skills, Projects, Experience e Contact.

**URL de produção:** https://joaokremer.dev

---

## Stack Tecnológica

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 16.1.6 | Framework principal (App Router) |
| React | 19.2.3 | UI Library |
| TypeScript | ^5 | Tipagem estática |
| Tailwind CSS | v4 | Estilização (via `@tailwindcss/postcss`) |
| Framer Motion | ^12.33.0 | Animações e transições |
| next-intl | ^4.8.2 | Internacionalização (PT/EN) |
| next-themes | ^0.4.6 | Dark/Light mode |
| Embla Carousel | ^8.6.0 | Carrosséis de imagens |
| Lucide React | ^0.563.0 | Ícones |
| sharp | - | Otimização de imagens |

---

## Estrutura do Projeto

```
portfolio/
├── docs/                          # Documentação do projeto
├── public/                        # Assets estáticos (imagens, vídeos, etc.)
├── src/
│   ├── app/
│   │   ├── globals.css            # Estilos globais + design tokens (CSS vars)
│   │   ├── layout.tsx             # Root layout (html/body + fonts)
│   │   ├── sitemap.ts             # Geração do sitemap
│   │   ├── robots.ts              # Configuração robots.txt
│   │   └── [locale]/
│   │       ├── layout.tsx         # Layout com i18n, theme, SEO, JSON-LD
│   │       └── page.tsx           # Página principal (composição das seções)
│   ├── components/
│   │   ├── layout/                # Header, Footer
│   │   ├── sections/              # Seções da página (Hero, About, Skills, etc.)
│   │   └── ui/                    # Componentes reutilizáveis (ThemeToggle, etc.)
│   ├── data/                      # Dados estáticos (projects, skills, experience, gallery)
│   ├── i18n/
│   │   ├── messages/              # Traduções: pt.json, en.json
│   │   ├── routing.ts             # Config de locales (pt default, en)
│   │   ├── request.ts             # Config server-side do next-intl
│   │   └── navigation.ts          # Helpers de navegação i18n
│   └── lib/
│       └── utils.ts               # Utilitário cn() (clsx + tailwind-merge)
├── eslint.config.mjs              # ESLint 9 flat config
├── postcss.config.mjs             # PostCSS com Tailwind v4
├── tsconfig.json                  # TypeScript config (paths: @/* -> ./src/*)
└── package.json
```

---

## Convenções de Código

### Componentes

- **Organização:** Componentes são divididos em 3 categorias:
  - `sections/` — seções completas da página (Hero, About, Skills, etc.)
  - `ui/` — componentes reutilizáveis e genéricos
  - `layout/` — componentes estruturais (Header, Footer)
- **Padrão de export:** `export default function ComponentName()`
- **Client Components:** Marcar com `"use client"` apenas quando necessário (hooks, interatividade)
- **Tipagem:** Usar `type Props = {}` para props de componentes

### Estilização

- **Tailwind CSS v4** com design tokens via CSS custom properties em `globals.css`
- **Utilitário `cn()`** para merge condicional de classes: `cn("base-class", condition && "conditional-class")`
- **Tema:** Tokens definidos em `:root` (light) e `.dark` (dark)
- **Cores principais:**
  - Primary: `#6d28d9` (light) / `#a78bfa` (dark) — violeta
  - Background: `#fafafa` (light) / `#09090b` (dark)
- **Classes utilitárias customizadas:** `.glass`, `.gradient-text`
- **Animações:** Usar Framer Motion. Respeitar `prefers-reduced-motion`

### Internacionalização (i18n)

- **Idiomas:** Português (default) e Inglês
- **Mensagens:** `src/i18n/messages/pt.json` e `en.json`
- **Uso em componentes:**
  - Client: `const t = useTranslations("section_key")`
  - Server: `const messages = await getMessages({ locale })`
- **Roteamento:** `/pt/...` e `/en/...` via `[locale]` dinâmico
- **Regra:** Todo texto visível ao usuário DEVE estar nos arquivos de tradução. Nunca hardcode strings de UI.

### Dados

- **Dados estáticos** ficam em `src/data/` com tipos exportados
- **Padrão:** Cada arquivo exporta um `type` e um array `const`
- Exemplos: `projects.ts`, `skills.ts`, `experience.ts`, `gallery.ts`

### Path Aliases

- `@/*` mapeia para `./src/*`
- Sempre usar imports com `@/` em vez de caminhos relativos

---

## Design System

### Tokens de Cor (CSS Custom Properties)

```
--background, --foreground
--muted, --muted-foreground
--accent, --accent-foreground
--border
--card, --card-foreground
--primary, --primary-foreground
```

### Fontes

- **Sans:** Geist Sans (`--font-geist-sans`)
- **Mono:** Geist Mono (`--font-geist-mono`)

### Padrões Visuais

- **Glass morphism:** Classe `.glass` para cards com blur
- **Gradient text:** Classe `.gradient-text` para textos com gradiente violeta
- **Animações de entrada:** Staggered animations com Framer Motion (`container` + `item` variants)
- **Scroll suave:** `scroll-behavior: smooth` no HTML
- **Scrollbar customizada:** `scrollbar-width: thin`

---

## Scripts

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # ESLint
```

---

## SEO

- **Metadata dinâmica** por locale em `[locale]/layout.tsx`
- **OpenGraph e Twitter Cards** configurados
- **JSON-LD** com schema Person
- **Sitemap** gerado automaticamente (`src/app/sitemap.ts`)
- **Robots.txt** configurado (`src/app/robots.ts`)
- **Alternates** para hreflang entre PT e EN

---

## Regras para Sessões Futuras

1. **Sempre manter a paridade i18n** — ao adicionar/alterar texto, atualizar AMBOS `pt.json` e `en.json`
2. **Respeitar a estrutura de pastas** — novas seções em `sections/`, UI genérica em `ui/`
3. **Usar `cn()` para classes condicionais** — nunca concatenar strings de classes manualmente
4. **Acessibilidade** — manter suporte a `prefers-reduced-motion`, usar semântica HTML
5. **Performance** — componentes server-side por padrão, `"use client"` apenas quando necessário
6. **Dados em `src/data/`** — não misturar dados hardcoded nos componentes
7. **Tipagem forte** — todos os dados e props devem ser tipados com TypeScript
8. **Deploy:** Vercel (verificar se build passa antes de fazer push)
