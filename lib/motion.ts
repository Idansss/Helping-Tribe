/**
 * Shared motion tokens.
 *
 * Every animation on the public site imports its timing from here — no inline
 * magic numbers. The CSS custom properties in globals.css mirror these values,
 * so JS-driven and CSS-driven motion stay in step.
 */

/** Easing curves as control points, for JS animation libraries. */
export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const

/** The same curves as CSS `cubic-bezier()` strings. */
export const easeCss = {
  out: `cubic-bezier(${ease.out.join(', ')})`,
  inOut: `cubic-bezier(${ease.inOut.join(', ')})`,
} as const

/** GSAP's named equivalents. `power3.out` is the brief's hero curve. */
export const easeGsap = {
  out: 'power3.out',
  inOut: 'power2.inOut',
} as const

/** Durations in seconds (GSAP / Motion take seconds). */
export const dur = {
  fast: 0.25,
  base: 0.5,
  slow: 0.8,
} as const

/** The same durations in milliseconds, for the Web Animations API and CSS. */
export const durMs = {
  fast: dur.fast * 1000,
  base: dur.base * 1000,
  slow: dur.slow * 1000,
} as const

/** Stagger steps used by the shared reveal patterns. */
export const stagger = {
  words: 0.06,
  items: 0.12,
} as const
