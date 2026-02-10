import { Vector3, CatmullRomCurve3, Color } from "three";
import type { ThemeColors } from "@/components/sections/AirplaneJourney/useCSSVariables";

/* ───── Ring configurations ───── */
export type RingConfig = {
  key: string;
  radius: number;
  tiltDeg: number;
  tiltRad: number;
  skillCount: number;
  startIndex: number; // offset into the flat skill array
  rotSpeed: number;
};

const DEG = Math.PI / 180;

export const RING_CONFIGS: RingConfig[] = [
  { key: "frontend", radius: 4.0, tiltDeg: 5, tiltRad: 5 * DEG, skillCount: 27, startIndex: 0, rotSpeed: 0.03 },
  { key: "mobile", radius: 6.5, tiltDeg: 8, tiltRad: 8 * DEG, skillCount: 7, startIndex: 27, rotSpeed: 0.05 },
  { key: "backend", radius: 9.0, tiltDeg: -6, tiltRad: -6 * DEG, skillCount: 12, startIndex: 34, rotSpeed: 0.04 },
  { key: "database", radius: 11.5, tiltDeg: 10, tiltRad: 10 * DEG, skillCount: 9, startIndex: 46, rotSpeed: 0.06 },
  { key: "tools", radius: 14.0, tiltDeg: -4, tiltRad: -4 * DEG, skillCount: 18, startIndex: 55, rotSpeed: 0.035 },
];

export const TOTAL_SKILLS = 73; // sum of all skillCounts

/* ───── Node positioning ───── */
export function getNodePosition(
  radius: number,
  tiltRad: number,
  angle: number,
  target: Vector3
): Vector3 {
  const x = radius * Math.cos(angle);
  const rawZ = radius * Math.sin(angle);
  const y = rawZ * Math.sin(tiltRad);
  const z = rawZ * Math.cos(tiltRad);
  return target.set(x, y, z);
}

export function getSkillAngle(index: number, total: number, timeOffset: number): number {
  return (index / total) * Math.PI * 2 + timeOffset;
}

/* ───── Ring ellipse points (for Line) ───── */
export function getRingPoints(radius: number, tiltRad: number, segments = 100): Vector3[] {
  const pts: Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    pts.push(getNodePosition(radius, tiltRad, angle, new Vector3()));
  }
  return pts;
}

/* ───── Scroll → category mapping ───── */
// Each category occupies a 0.16 range within progress 0–1
const CATEGORY_RANGES = [
  { center: 0.16, start: 0.08, end: 0.24 }, // Frontend
  { center: 0.32, start: 0.24, end: 0.40 }, // Mobile
  { center: 0.48, start: 0.40, end: 0.56 }, // Backend
  { center: 0.64, start: 0.56, end: 0.72 }, // Database
  { center: 0.80, start: 0.72, end: 0.88 }, // Tools
];

export function getActiveCategoryIndex(progress: number): number {
  for (let i = 0; i < CATEGORY_RANGES.length; i++) {
    if (progress >= CATEGORY_RANGES[i].start && progress < CATEGORY_RANGES[i].end) {
      return i;
    }
  }
  return -1; // overview
}

/** Returns 0–1 indicating how focused we are on this ring (0=not focused, 1=center) */
export function getCategoryFocus(progress: number, ringIndex: number): number {
  const range = CATEGORY_RANGES[ringIndex];
  if (!range) return 0;
  const dist = Math.abs(progress - range.center);
  const halfWidth = (range.end - range.start) / 2;
  if (dist > halfWidth) return 0;
  return 1 - dist / halfWidth;
}

/* ───── Camera curve ───── */
const CAMERA_WAYPOINTS = [
  new Vector3(0, 12, 25),   // t=0.00: overview from above
  new Vector3(3, 2, 6),     // t~0.16: near Frontend ring (r=4)
  new Vector3(5, 3, 9),     // t~0.32: near Mobile ring (r=6.5)
  new Vector3(7, 2, 12),    // t~0.48: near Backend ring (r=9)
  new Vector3(9, 4, 15),    // t~0.64: near Database ring (r=11.5)
  new Vector3(11, 2, 18),   // t~0.80: near Tools ring (r=14)
  new Vector3(0, 14, 28),   // t=1.00: pull back to overview
];

export const cameraCurve = new CatmullRomCurve3(CAMERA_WAYPOINTS, false, "catmullrom", 0.3);

/** Get camera lookAt target based on progress */
export function getCameraTarget(progress: number): Vector3 {
  const idx = getActiveCategoryIndex(progress);
  if (idx < 0) return new Vector3(0, 0, 0);
  const ring = RING_CONFIGS[idx];
  // Look at the ring's center point (slightly offset in Y for the tilt)
  return new Vector3(0, 0, 0); // center of the orbital system
}

/* ───── Category colors ───── */
export function getCategoryColor(ringIndex: number, colors: ThemeColors): Color {
  const t = RING_CONFIGS.length > 1 ? ringIndex / (RING_CONFIGS.length - 1) : 0;
  const from = new Color(colors.gradientFrom);
  const via = new Color(colors.gradientVia);
  const to = new Color(colors.gradientTo);

  if (t < 0.5) {
    return from.clone().lerp(via, t * 2);
  }
  return via.clone().lerp(to, (t - 0.5) * 2);
}
