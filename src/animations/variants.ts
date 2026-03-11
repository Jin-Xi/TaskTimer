/**
 * Animation variants for Framer Motion
 *
 * Reusable animation variants for common UI patterns
 * including page transitions, list items, and modals.
 */

import type { Variants } from 'framer-motion';
import { smooth } from './springs';

/**
 * Page transition variants with directional slide
 */
export const pageVariants: Variants = {
  initial: (direction: number) => ({
    x: direction > 0 ? '5%' : '-5%',
    opacity: 0,
    scale: 0.98,
  }),
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      ...smooth,
      duration: 0.3,
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '5%' : '-5%',
    opacity: 0,
    scale: 0.98,
    transition: {
      ...smooth,
      duration: 0.25,
    },
  }),
};

/**
 * List item stagger animation variants
 */
export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ...smooth,
      duration: 0.25,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.15,
    },
  },
};

/**
 * Modal enter/exit variants
 */
export const modalVariants: Variants = {
  initial: {
    scale: 0.95,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      ...smooth,
      duration: 0.2,
    },
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

/**
 * Drawer slide-in variants
 */
export const drawerVariants: Variants = {
  initial: (placement: 'left' | 'right' | 'top' | 'bottom' = 'right') => {
    const offset = '100%';
    return {
      [placement === 'left' || placement === 'right' ? 'x' : 'y']:
        placement === 'left' || placement === 'top' ? offset : `-${offset}`,
      opacity: 0,
    };
  },
  animate: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type: 'tween',
      ease: [0.32, 0.72, 0, 1],
      duration: 0.5,
    },
  },
  exit: (placement: 'left' | 'right' | 'top' | 'bottom' = 'right') => {
    const offset = '100%';
    return {
      [placement === 'left' || placement === 'right' ? 'x' : 'y']:
        placement === 'left' || placement === 'top' ? offset : `-${offset}`,
      opacity: 0,
      transition: {
        type: 'tween',
        ease: 'easeIn',
        duration: 0.3,
      },
    };
  },
};

/**
 * Fade in/out variants
 */
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Scale pulse variants
 */
export const scaleVariants: Variants = {
  initial: { scale: 1 },
  animate: { scale: 1.02 },
  exit: { scale: 1 },
};
