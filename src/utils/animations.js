import { motion } from "framer-motion";

// Optimized animation durations - faster for better mobile performance
// Using shorter durations that work well on both mobile and desktop
const FAST_DURATION = 0.3;
const MEDIUM_DURATION = 0.4;
const SLOW_DURATION = 0.5;

// Simplified easing for better performance
const EASE_OUT = "easeOut";
const EASE_IN_OUT = "easeInOut";

// Common animation variants - optimized for mobile performance
export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: MEDIUM_DURATION, ease: EASE_OUT }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: FAST_DURATION, ease: EASE_OUT }
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: MEDIUM_DURATION, ease: EASE_OUT }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: MEDIUM_DURATION, ease: EASE_OUT }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: MEDIUM_DURATION, ease: EASE_OUT }
};

export const slideInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: MEDIUM_DURATION, ease: EASE_OUT }
};

// Stagger container for lists - faster stagger for mobile
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

// Stagger item - faster for mobile
export const staggerItem = {
  initial: { opacity: 0, y: 15 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: MEDIUM_DURATION, ease: EASE_OUT }
  }
};

// Scroll reveal animation - faster and less movement for mobile
export const scrollReveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: MEDIUM_DURATION, ease: EASE_OUT }
};

// Hover animations
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.15 }
};

export const hoverLift = {
  whileHover: { y: -5, transition: { duration: 0.15 } },
  transition: { duration: 0.15 }
};

// Button animations
export const buttonHover = {
  whileHover: { 
    scale: 1.02,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)"
  },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.15 }
};

// Card animations - faster for mobile
export const cardHover = {
  whileHover: { 
    y: -8,
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.2 }
  },
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-30px" },
  transition: { duration: MEDIUM_DURATION, ease: EASE_OUT }
};

// Image animations - faster for mobile
export const imageReveal = {
  initial: { opacity: 0, scale: 1.05 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: SLOW_DURATION, ease: EASE_OUT }
};

// Text reveal animation - faster for mobile
export const textReveal = {
  initial: { opacity: 0, y: 15 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-30px" },
  transition: { duration: MEDIUM_DURATION, ease: EASE_OUT }
};

// Sequential reveal for steps - much faster for mobile
export const stepReveal = (index) => ({
  initial: { opacity: 0, x: -20 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: "-30px" },
  transition: { 
    duration: MEDIUM_DURATION, 
    delay: index * 0.08,
    ease: EASE_OUT 
  }
});

// Page transition
export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

