/**
 * StaggeredList Component
 *
 * Wrapper component for list item stagger animations.
 * Items appear sequentially with a configurable delay between each.
 */

import { ReactNode, useMemo } from 'react';
import { motion } from 'framer-motion';
import { listItemVariants } from '../variants';
import { prefersReducedMotion } from '../utils';

interface StaggeredListProps {
  children: ReactNode;
  /** Delay between each item animation in seconds (default: 0.03 = 30ms) */
  staggerDelay?: number;
  /** Disable stagger animation for large lists */
  disabled?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Auto-disable threshold (default: 100 items). Set to 0 to disable auto-threshold. */
  threshold?: number;
}

/**
 * StaggeredList provides sequential entrance animations for list items.
 * Each child is wrapped with a motion.div that delays its animation
 * based on its index in the list.
 *
 * @example
 * ```tsx
 * <StaggeredList staggerDelay={0.03}>
 *   {items.map((item) => (
 *     <div key={item.id}>{item.name}</div>
 *   ))}
 * </StaggeredList>
 * ```
 */
export function StaggeredList({
  children,
  staggerDelay = 0.03,
  disabled = false,
  className = '',
  threshold = 100,
}: StaggeredListProps) {
  // Convert children to array and filter out falsy values
  const childrenArray = useMemo(() => {
    const array = Array.isArray(children) ? children : [children];
    return array.filter(Boolean);
  }, [children]);

  // Auto-disable if user prefers reduced motion or list exceeds threshold
  const shouldDisable =
    disabled ||
    prefersReducedMotion() ||
    (threshold > 0 && childrenArray.length > threshold);

  // If stagger is disabled, render children without animation
  if (shouldDisable) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <motion.div
          key={`stagger-${index}`}
          custom={index * staggerDelay}
          variants={listItemVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            delay: index * staggerDelay,
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

export default StaggeredList;
