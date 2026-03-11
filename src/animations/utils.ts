/**
 * Animation utilities
 *
 * Helper functions for animation-related utilities including
 * accessibility checks and performance optimizations.
 */

/**
 * Check if the user prefers reduced motion
 *
 * Uses the `prefers-reduced-motion` media query to detect
 * if the user has requested reduced motion in their system settings.
 *
 * @returns `true` if user prefers reduced motion, `false` otherwise
 *
 * @example
 * ```tsx
 * if (prefersReducedMotion()) {
 *   // Use simplified or no animations
 * }
 * ```
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation transition based on reduced motion preference
 *
 * Returns appropriate transition settings based on whether
 * the user prefers reduced motion.
 *
 * @param normalTransition - The normal transition to use when reduced motion is off
 * @param reducedTransition - The simplified transition for reduced motion (optional)
 * @returns The appropriate transition object
 *
 * @example
 * ```tsx
 * const transition = getAccessibleTransition(
 *   { type: 'spring', stiffness: 300, damping: 30 },
 *   { duration: 0.1 }
 * );
 * ```
 */
export function getAccessibleTransition<T = any>(
  normalTransition: T,
  reducedTransition?: T
): T {
  if (prefersReducedMotion()) {
    return reducedTransition || ({ duration: 0.01 } as T);
  }
  return normalTransition;
}

/**
 * Subscribe to reduced motion preference changes
 *
 * Allows components to react when the user changes their
 * reduced motion preference.
 *
 * @param callback - Function to call when preference changes
 * @returns Unsubscribe function
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const unsubscribe = subscribeToReducedMotion((prefersReduced) => {
 *     setDisableAnimations(prefersReduced);
 *   });
 *   return unsubscribe;
 * }, []);
 * ```
 */
export function subscribeToReducedMotion(
  callback: (prefersReduced: boolean) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', (e) => callback(e.matches));
    return () => mediaQuery.removeEventListener('change', (e) => callback(e.matches));
  }

  // Legacy browsers
  if (mediaQuery.addListener) {
    mediaQuery.addListener((e: any) => callback(e.matches));
    return () => mediaQuery.removeListener((e: any) => callback(e.matches));
  }

  return () => {};
}

/**
 * Memoized value that respects reduced motion preference
 *
 * @param value - The value to use when reduced motion is off
 * @param reducedValue - The value to use when reduced motion is on
 * @returns The appropriate value based on preference
 *
 * @example
 * ```tsx
 * const stagger = useReducedMotion(0.03, 0);
 * ```
 */
export function useReducedMotion<T>(value: T, reducedValue: T): T {
  return prefersReducedMotion() ? reducedValue : value;
}
