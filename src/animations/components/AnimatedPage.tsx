/**
 * AnimatedPage Component
 *
 * Wrapper component for page/tab transitions using AnimatePresence.
 * Provides smooth fade-in/out and directional slide animations.
 */

import { ReactNode, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { pageVariants } from '../variants';
import { prefersReducedMotion } from '../utils';

interface AnimatedPageProps {
  children: ReactNode;
  /** Direction for the transition: 1 (forward) or -1 (backward) */
  direction?: number;
  /** Unique key for AnimatePresence to detect component changes */
  className?: string;
  /** Force disable animations (overrides system preference) */
  disableAnimation?: boolean;
}

/**
 * AnimatedPage wraps children with motion.div for smooth page transitions.
 * Used primarily for tab switching in the main App.
 *
 * @example
 * ```tsx
 * <AnimatePresence mode="wait" initial={false}>
 *   <AnimatedPage key="tab1" direction={1}>
 *     <TabContent />
 *   </AnimatedPage>
 * </AnimatePresence>
 * ```
 */
export function AnimatedPage({
  children,
  direction = 1,
  className = '',
  disableAnimation = false,
}: AnimatedPageProps) {
  const shouldDisableAnimation = disableAnimation || prefersReducedMotion();

  const variants = useMemo(() => {
    if (shouldDisableAnimation) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
      };
    }
    return pageVariants;
  }, [shouldDisableAnimation]);

  return (
    <motion.div
      className={className}
      custom={direction}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={shouldDisableAnimation ? { duration: 0 } : undefined}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedPage;
