/**
 * Animation spring configurations for Framer Motion
 *
 * These pre-configured spring parameters provide consistent
 * physics-based animations throughout the application.
 */

import type { Transition } from 'framer-motion';

/**
 * Spring configuration types
 */
export type SpringConfig = Transition & { type: 'spring' };

/**
 * Quick, responsive spring for button taps and small interactions
 */
export const snappy: SpringConfig = {
  type: 'spring',
  stiffness: 400,
  damping: 17,
};

/**
 * Smooth, balanced spring for general UI transitions
 */
export const smooth: SpringConfig = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

/**
 * Bouncy spring for playful interactions
 */
export const bouncy: SpringConfig = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
};

/**
 * Animation duration constants (in seconds)
 */
export const durations = {
  /** 100ms - Instant feedback */
  fast: 0.1,
  /** 200ms - Quick transitions */
  medium: 0.2,
  /** 300ms - Comfortable animations */
  slow: 0.3,
  /** 500ms - Deliberate, noticeable animations */
  xslow: 0.5,
} as const;

/**
 * Default spring configuration (used when no specific spring is specified)
 */
export const defaultSpring = smooth;

/**
 * Pre-configured spring presets object
 */
export const springs = {
  snappy,
  smooth,
  bouncy,
  default: defaultSpring,
} as const;
