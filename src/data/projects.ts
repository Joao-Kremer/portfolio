export type Project = {
  id: string;
  image: string;
  tags: string[];
  github?: string;
  demo?: string;
  featured: boolean;
};

export const projects: Project[] = [
  {
    id: "project-1",
    image: "/images/projects/project-1.jpg",
    tags: ["React", "TypeScript", "Node.js"],
    github: "https://github.com/yourusername/project-1",
    demo: "https://project-1.vercel.app",
    featured: true,
  },
  {
    id: "project-2",
    image: "/images/projects/project-2.jpg",
    tags: ["Next.js", "Tailwind", "PostgreSQL"],
    github: "https://github.com/yourusername/project-2",
    demo: "https://project-2.vercel.app",
    featured: true,
  },
  {
    id: "project-3",
    image: "/images/projects/project-3.jpg",
    tags: ["React", "GraphQL", "MongoDB"],
    github: "https://github.com/yourusername/project-3",
    featured: false,
  },
];
