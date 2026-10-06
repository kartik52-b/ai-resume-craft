import type { CSSProperties } from 'react';

/**
 * ══════════════════════════════════════════════════════════════════════════
 * Motion tokens — the single source of truth for how the interface moves.
 *
 * The CSS side of this system lives in `src/index.css` (keyframes + the
 * `.animate-*` / `[data-reveal]` classes) and `tailwind.config.ts`
 * (`ease-premium`). This module is the TypeScript mirror: it holds the same
 * durations, curves and distances for code that needs them inline —
 * staggered entrances, pointer-driven transforms, tuned components — so no
 * component ever invents its own magic number.
 *
 * Philosophy: subtle → responsive → fast → premium → purposeful. If a value
 * is not here, it probably should not be in a component either.
 * ══════════════════════════════════════════════════════════════════════════
 */

/** Durations in milliseconds (spec §3). */
export const DURATION = {
  /** Buttons, inputs, icons — state changes you feel, not watch. */
  instant: 140,
  fast: 150,
  normal: 160,
  slow: 180,
  /** Cards, dropdowns, panels. */
  slower: 220,
  medium: 240,
  /** Page and section entrances. */
  extended: 300,
  /** Hero-scale elements (the big resume preview). */
  large: 400,
} as const;

/** Easing curves. One house curve, one spec curve, two plain workhorses. */
export const EASING = {
  /** The house curve: fast out of the gate, long soft settle. */
  premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** The spec curve (§3): expressive but never bouncy. */
  standard: 'cubic-bezier(0.22, 1, 0.36, 1)',
  /** UI state changes — short transitions read better with plain ease-out. */
  out: 'ease-out',
  inOut: 'ease-in-out',
} as const;

/** Travel distances in pixels. Entrances never move more than `xl`. */
export const DISTANCE = {
  /** Focus/active nudges. */
  xs: 2,
  /** Dropdown/tooltip travel. */
  sm: 4,
  /** Page entrance (translateY 8px). */
  md: 8,
  /** Card lift. */
  lg: 12,
  /** Scroll-reveal travel. */
  xl: 16,
} as const;

/** Scale factors — kept almost imperceptible on purpose. */
export const SCALE = {
  /** Press feedback for buttons. */
  press: 0.98,
  /** Card hover zoom. */
  lift: 1.01,
  /** Panel/modal enter. */
  panel: 0.98,
} as const;

/**
 * Pointer-driven 3D limits for the hero resume (spec §6–§7).
 * Rotation stays inside ±3°/±4° and the "push" never exceeds a few pixels —
 * the sheet must read as responsive, never as an effect.
 */
export const TILT = {
  rotateX: 3,
  rotateY: 4,
  /** Max translation toward the cursor, in px (spec: 4–10px). */
  push: 8,
} as const;

/** Elevation steps as CSS variable references (warm, paper-forward). */
export const ELEVATION = {
  rest: 'var(--shadow-xs)',
  hover: 'var(--shadow-md)',
  raised: 'var(--shadow-lg)',
  /** The A4 sheet resting on a desk. */
  desk: 'var(--canvas-shadow)',
} as const;

/**
 * Intensity hierarchy (spec §35): never make a normal interaction feel slow.
 * Use these instead of raw numbers when picking a duration.
 */
export const LEVEL = {
  /** Buttons, inputs, icons. */
  micro: DURATION.fast,
  /** Cards, dropdowns, panels. */
  component: DURATION.slower,
  /** Sections, page transitions. */
  page: DURATION.extended,
  /** The hero resume preview. */
  hero: DURATION.large,
} as const;

/** Format a token as a CSS time string. */
export const ms = (value: number): string => `${value}ms`;

/**
 * Inline style helper for staggered entrances.
 *
 * Pair with the `.stagger` class (which reads `--stagger`) plus an
 * `.animate-*` entrance: `style={stagger(index)}`. The cap keeps long grids
 * from trickling in — a list of 40 cards still lands almost immediately.
 */
export function stagger(index: number, step = 45, cap = 8): CSSProperties {
  return { '--stagger': `${Math.min(index, cap) * step}ms` } as CSSProperties;
}

/** Inline style helper for a fixed entrance delay used with `.stagger`. */
export function delay(msValue: number): CSSProperties {
  return { '--stagger': `${msValue}ms` } as CSSProperties;
}
