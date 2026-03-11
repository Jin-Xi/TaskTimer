/**
 * MotionButton Component
 *
 * A button wrapper component that provides tactile feedback animations.
 * Includes whileTap (shrink on press) and whileHover (grow on hover) effects.
 */

import { ReactNode, Ref, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { snappy, smooth } from '../springs';
import { prefersReducedMotion } from '../utils';

interface MotionButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  /** Scale on press (default: 0.95) */
  pressScale?: number;
  /** Scale on hover (default: 1.02) */
  hoverScale?: number;
  /** Disable hover effect */
  disableHover?: boolean;
  /** Disable press effect */
  disablePress?: boolean;
  /** Disable all animations */
  disabled?: boolean;
}

/**
 * MotionButton provides tactile feedback for button interactions.
 * Wraps content with motion.div for smooth spring animations.
 *
 * @example
 * ```tsx
 * <MotionButton onPress={handleClick}>
 *   Click me
 * </MotionButton>
 *
 * <MotionButton
 *   pressScale={0.9}
 *   hoverScale={1.05}
 *   className="bg-blue-500"
 * >
 *   Custom scales
 * </MotionButton>
 * ```
 */
export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({
    children,
    pressScale = 0.95,
    hoverScale = 1.02,
    disableHover = false,
    disablePress = false,
    disabled = false,
    className = '',
    ...props
  }, ref) => {
    // Auto-disable animations if user prefers reduced motion
    const shouldDisableAnimation = disabled || prefersReducedMotion();

    // If all animations are disabled, render without motion wrapper
    if (shouldDisableAnimation) {
      return (
        <button
          ref={ref}
          className={className}
          disabled={disabled}
          {...(props as any)}
        >
          {children}
        </button>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={className}
        disabled={disabled}
        whileTap={!disablePress ? { scale: pressScale } : undefined}
        whileHover={!disableHover ? { scale: hoverScale } : undefined}
        transition={!disablePress ? snappy : smooth}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

MotionButton.displayName = 'MotionButton';

export default MotionButton;
