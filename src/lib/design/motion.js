// src/lib/design/motion.js
// Framer Motion preset library. Every interactive component imports from here.

export const spring = {
  soft:    { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 },
  default: { type: 'spring', stiffness: 380, damping: 32, mass: 0.8 },
  snappy:  { type: 'spring', stiffness: 520, damping: 36, mass: 0.7 },
};

export const ease = {
  out:    [0.16, 1, 0.3, 1],
  in:     [0.7, 0, 0.84, 0],
  inOut:  [0.65, 0, 0.35, 1],
};

export const variants = {
  fadeUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: spring.default },
    exit:    { opacity: 0, y: 8, transition: { duration: 0.15 } },
  },

  stagger: {
    initial: {},
    animate: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
  },

  staggerItem: {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0, transition: spring.soft },
  },

  pressable: {
    whileTap:   { scale: 0.97 },
    whileHover: { y: -2 },
    transition: spring.snappy,
  },

  sheet: {
    initial: { y: '100%' },
    animate: { y: 0, transition: spring.default },
    exit:    { y: '100%', transition: { duration: 0.2 } },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1, transition: spring.default },
    exit:    { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
  },
};

/** Wraps variants with prefers-reduced-motion guard. */
export const safeMotion = (variant) => {
  if (typeof window === 'undefined') return variant;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) return variant;
  return { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } };
};
