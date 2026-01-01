import { motion } from "framer-motion";

// Ultra-fast animation durations for snappy performance
const FAST_DURATION = 0.2;
const MEDIUM_DURATION = 0.25;
const SLOW_DURATION = 0.3;

// Linear easing for maximum performance (no easing calculations)
const LINEAR = "linear";
const EASE_OUT = "easeOut";

// Common animation variants - ultra-optimized for performance
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: MEDIUM_DURATION, ease: LINEAR }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: FAST_DURATION, ease: LINEAR }
};

export const fadeInDown = {
  initial: { opacity: 0, y: -15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: MEDIUM_DURATION, ease: LINEAR }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: MEDIUM_DURATION, ease: LINEAR }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: MEDIUM_DURATION, ease: LINEAR }
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: MEDIUM_DURATION, ease: LINEAR }
};

// Stagger container for lists - minimal delays
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05
    }
  }
};

// Stagger item - minimal movement
export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: MEDIUM_DURATION, ease: LINEAR }
  }
};

// Scroll reveal animation - minimal movement and faster
// Increased margin to reduce observer firing frequency
export const scrollReveal = {
  initial: { opacity: 0, y: 15 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: MEDIUM_DURATION, ease: LINEAR }
};

// Hover animations - instant response
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.1 }
};

export const hoverLift = {
  whileHover: { y: -5, transition: { duration: 0.1 } },
  transition: { duration: 0.1 }
};

// Button animations - instant response
export const buttonHover = {
  whileHover: { 
    scale: 1.02,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)"
  },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.1 }
};

// Card animations - minimal movement
// Increased margin to reduce observer firing frequency
export const cardHover = {
  whileHover: { 
    y: -8,
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.15 }
  },
  initial: { opacity: 0, y: 15 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: MEDIUM_DURATION, ease: LINEAR }
};

// Image animations - minimal scale change
// Increased margin to reduce observer firing frequency
export const imageReveal = {
  initial: { opacity: 0, scale: 1.02 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: SLOW_DURATION, ease: LINEAR }
};

// Text reveal animation - minimal movement
// Increased margin to reduce observer firing frequency
export const textReveal = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: MEDIUM_DURATION, ease: LINEAR }
};

// Sequential reveal for steps - minimal delays
// Increased margin to reduce observer firing frequency
export const stepReveal = (index) => ({
  initial: { opacity: 0, x: -15 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { 
    duration: MEDIUM_DURATION, 
    delay: index * 0.03,
    ease: LINEAR 
  }
});

// Page transition
export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

