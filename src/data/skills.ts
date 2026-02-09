export type Skill = {
  name: string;
  category: "frontend" | "backend" | "tools" | "database";
};

export const skills: Skill[] = [
  // Frontend
  { name: "React", category: "frontend" },
  { name: "Next.js", category: "frontend" },
  { name: "TypeScript", category: "frontend" },
  { name: "JavaScript", category: "frontend" },
  { name: "Tailwind CSS", category: "frontend" },
  { name: "HTML5", category: "frontend" },
  { name: "CSS3", category: "frontend" },
  { name: "Framer Motion", category: "frontend" },

  // Backend
  { name: "Node.js", category: "backend" },
  { name: "Express", category: "backend" },
  { name: "NestJS", category: "backend" },
  { name: "REST APIs", category: "backend" },
  { name: "GraphQL", category: "backend" },

  // Database
  { name: "PostgreSQL", category: "database" },
  { name: "MongoDB", category: "database" },
  { name: "Redis", category: "database" },
  { name: "Prisma", category: "database" },

  // Tools
  { name: "Git", category: "tools" },
  { name: "Docker", category: "tools" },
  { name: "AWS", category: "tools" },
  { name: "Vercel", category: "tools" },
  { name: "GitHub Actions", category: "tools" },
  { name: "Figma", category: "tools" },
];
