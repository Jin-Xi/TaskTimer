import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { prefersReducedMotion } from '../animations/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right';
  ariaLabel?: string;
  title?: string;
}

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const drawerVariants = {
  initial: (position: 'left' | 'right') => ({
    x: position === 'left' ? '-100%' : '100%',
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: (position: 'left' | 'right') => ({
    x: position === 'left' ? '-100%' : '100%',
    opacity: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 35,
      mass: 0.5,
    },
  }),
};

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  position = 'left',
  ariaLabel = 'Drawer',
  title
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = prefersReducedMotion();

  // Store the trigger element when drawer opens
  useEffect(() => {
    if (isOpen && !triggerRef.current) {
      triggerRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus on first interactive element
      const timeoutId = setTimeout(() => {
        const firstFocusable = drawerRef.current?.querySelector(
          'button, a, input, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }, 100);

      // Disable body scroll
      document.body.style.overflow = 'hidden';

      return () => clearTimeout(timeoutId);
    } else {
      // Restore body scroll
      document.body.style.overflow = '';

      // Return focus to trigger
      if (triggerRef.current) {
        triggerRef.current.focus();
        triggerRef.current = null;
      }
    }
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = drawerRef.current?.querySelectorAll(
        'button, a, input, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleTab);
    return () => window.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  const transition = shouldReduceMotion ? { duration: 0.15 } : undefined;

  return (
    <AnimatePresence mode="wait" onExitComplete={() => {
      // Restore body scroll after animation completes
      if (!isOpen) {
        document.body.style.overflow = '';
      }
    }}>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            role="presentation"
            aria-hidden="true"
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            variants={drawerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            custom={position}
            transition={transition}
            className={`
              fixed top-0 bottom-0 z-[70]
              w-[80%] max-w-[320px]
              md:w-[60%] md:max-w-[400px]
              lg:w-[400px] lg:max-w-[400px]
              ${position === 'left' ? 'left-0' : 'right-0'}
              bg-white dark:bg-slate-900
              shadow-2xl
              border-r border-neutral-200 dark:border-neutral-700
              flex flex-col
            `}
          >
            {/* Header with Title and Close Button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
              {title && (
                <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{title}</h2>
              )}
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={onClose}
                aria-label="关闭"
                className={`motion-animate ${!title ? 'ml-auto' : ''}`}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
