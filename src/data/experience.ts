export type Experience = {
  id: string;
  current: boolean;
  technologies: string[];
};

export const experiences: Experience[] = [
  {
    id: "exp-1",
    current: true,
    technologies: ["React", "Next.js", "Angular", "TypeScript", "Node.js", "NestJS", "MongoDB"],
  },
  {
    id: "exp-2",
    current: false,
    technologies: ["React", "React Native", "Next.js", "JavaScript", "Node.js"],
  },
];
