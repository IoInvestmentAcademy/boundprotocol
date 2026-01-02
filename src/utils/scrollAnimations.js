import { useReducedMotion } from "../hooks/useReducedMotion";

/**
 * Professional scroll animation configurations
 * Lightweight and optimized for performance
 */

// Base animation variants
export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

// Stagger container for children
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Stagger item for children
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Default viewport settings
export const defaultViewport = {
  once: true,
  margin: "-100px",
};

// Lightweight viewport (triggers earlier)
export const earlyViewport = {
  once: true,
  margin: "-50px",
};

// Transition settings
export const defaultTransition = {
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1], // Custom easing for smooth feel
};

export const fastTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

export const slowTransition = {
  duration: 0.7,
  ease: [0.4, 0, 0.2, 1],
};

/**
 * Hook to get animation props with reduced motion support
 */
export function useScrollAnimation(variant = fadeInUp, options = {}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return {
      initial: { opacity: 1 },
      whileInView: { opacity: 1 },
      viewport: options.viewport || defaultViewport,
    };
  }

  return {
    initial: "hidden",
    whileInView: "visible",
    viewport: options.viewport || defaultViewport,
    transition: options.transition || defaultTransition,
    variants: variant,
  };
}

/**
 * Section wrapper animation props
 */
export function getSectionAnimation() {
  return {
    initial: "hidden",
    whileInView: "visible",
    viewport: defaultViewport,
    transition: defaultTransition,
    variants: fadeIn,
  };
}

/**
 * Header animation props (titles, headings)
 */
export function getHeaderAnimation() {
  return {
    initial: "hidden",
    whileInView: "visible",
    viewport: defaultViewport,
    transition: { ...defaultTransition, delay: 0.1 },
    variants: fadeInUp,
  };
}

/**
 * Content animation props (text, descriptions)
 */
export function getContentAnimation(delay = 0.2) {
  return {
    initial: "hidden",
    whileInView: "visible",
    viewport: defaultViewport,
    transition: { ...defaultTransition, delay },
    variants: fadeInUp,
  };
}

/**
 * Card/item animation props
 */
export function getItemAnimation(index = 0) {
  return {
    initial: "hidden",
    whileInView: "visible",
    viewport: defaultViewport,
    transition: { ...defaultTransition, delay: index * 0.1 },
    variants: fadeInUp,
  };
}

/**
 * Image animation props
 */
export function getImageAnimation() {
  return {
    initial: "hidden",
    whileInView: "visible",
    viewport: defaultViewport,
    transition: { ...defaultTransition, delay: 0.15 },
    variants: scaleIn,
  };
}

