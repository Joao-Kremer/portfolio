"use client";

export default function StarryBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background"
    >
      <div className="stars-small" />
      <div className="stars-medium" />
      <div className="stars-large" />
    </div>
  );
}
