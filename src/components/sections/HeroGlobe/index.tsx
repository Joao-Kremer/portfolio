"use client";

import { useState, useEffect, type ComponentType } from "react";

export default function HeroGlobe() {
  const [Scene, setScene] = useState<ComponentType | null>(null);

  useEffect(() => {
    import("./GlobeScene").then((mod) => {
      setScene(() => mod.default);
    });
  }, []);

  if (!Scene) return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Scene />
    </div>
  );
}
