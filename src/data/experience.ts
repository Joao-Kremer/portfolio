export type Experience = {
  id: string;
  current: boolean;
  technologies: string[];
};

export const experiences: Experience[] = [
  {
    id: "enhance-fitness",
    current: true,
    technologies: ["React", "Next.js", "Angular", "TypeScript", "Node.js", "NestJS", "MongoDB", "Tailwind CSS"],
  },
  {
    id: "dopster-pl",
    current: false,
    technologies: ["React", "React Native", "Next.js", "TypeScript", "Zustand", "Tailwind CSS"],
  },
  {
    id: "dopster-jr",
    current: false,
    technologies: ["JavaScript", "React.js", "React Native", "Next.js", "Node.js"],
  },
  {
    id: "soujunior",
    current: false,
    technologies: ["React", "JavaScript", "CSS", "Git", "Scrum"],
  },
];
