/**
 * Reusable animation variants for Framer Motion
 * Enterprise dashboard animation system
 */

import { Variants, Transition } from 'motion/react';

// Easing curves
export const easings = {
  easeOut: [0.4, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: { type: 'spring', stiffness: 400, damping: 30 },
  bounce: { type: 'spring', stiffness: 300, damping: 20 }
};

// Fade in from bottom
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// Fade in from left
export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

// Fade in from right
export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

// Simple fade
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

// Scale in
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
};

// Stagger container
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

// Fast stagger
export const fastStagger: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

// Slow stagger
export const slowStagger: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

// Card hover effect
export const cardHover = {
  whileHover: {
    y: -2,
    transition: { duration: 0.3, ease: easings.easeOut }
  },
  whileTap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

// Scale on hover
export const scaleOnHover = {
  whileHover: {
    scale: 1.02,
    transition: { duration: 0.3, ease: easings.easeOut }
  },
  whileTap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

// Button press effect
export const buttonPress = {
  whileTap: { scale: 0.95 }
};

// Page transition
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

// Slide in from bottom
export const slideInBottom: Variants = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' }
};

// Slide in from right
export const slideInRight: Variants = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' }
};

// Path draw for SVG/sparklines
export const pathDraw: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1, ease: easings.easeOut },
      opacity: { duration: 0.3 }
    }
  },
  exit: {
    pathLength: 0,
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

// Counter animation helper
export const countUpTransition: Transition = {
  duration: 1,
  ease: easings.easeOut
};

// Number counter spring
export const countUpSpring: Transition = {
  type: 'spring',
  stiffness: 50,
  damping: 20,
  duration: 1.5
};

// Menu item stagger (for dropdowns/menus)
export const menuStagger: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1
    }
  }
};

// Menu item
export const menuItem: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 }
};

// Arc menu item (for FAB)
export const arcMenuItem = (index: number, total: number): Variants => {
  const angle = (index / (total - 1)) * 90 + 135; // Spread in arc
  const distance = 80;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;

  return {
    initial: { opacity: 0, scale: 0, x: 0, y: 0 },
    animate: {
      opacity: 1,
      scale: 1,
      x,
      y,
      transition: {
        delay: index * 0.05,
        duration: 0.3,
        ease: easings.easeOut
      }
    },
    exit: {
      opacity: 0,
      scale: 0,
      x: 0,
      y: 0,
      transition: {
        delay: (total - index - 1) * 0.03,
        duration: 0.2
      }
    }
  };
};

// Pulse animation
export const pulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Shimmer animation
export const shimmer: Variants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// Checkmark animation
export const checkmark: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.4, ease: easings.easeOut }
  }
};

// Modal/Dialog backdrop
export const backdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

// Modal/Dialog content
export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: easings.easeOut }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 }
  }
};

// Confetti particle
export const confettiParticle = (index: number): Variants => {
  const angle = Math.random() * 360;
  const velocity = 100 + Math.random() * 200;
  const x = Math.cos((angle * Math.PI) / 180) * velocity;
  const y = Math.sin((angle * Math.PI) / 180) * velocity;
  const rotation = Math.random() * 720 - 360;

  return {
    initial: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0
    },
    animate: {
      opacity: [1, 1, 0],
      x,
      y: [y, y + 100 + Math.random() * 100],
      scale: [1, 0.5, 0],
      rotate: rotation,
      transition: {
        duration: 1 + Math.random() * 0.5,
        ease: easings.easeOut
      }
    }
  };
};

// Default transition
export const defaultTransition: Transition = {
  duration: 0.3,
  ease: easings.easeOut
};

// Slow transition
export const slowTransition: Transition = {
  duration: 0.5,
  ease: easings.easeOut
};

// Fast transition
export const fastTransition: Transition = {
  duration: 0.15,
  ease: easings.easeOut
};
