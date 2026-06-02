import { elevation } from './elevation';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const spring = {
  type: 'spring',
  stiffness: 380,
  damping: 32,
};

export const variants = {
  fadeUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: spring },
    exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1, transition: spring },
  },
  stagger: {
    animate: { transition: { staggerChildren: 0.05 } },
  },
  staggerItem: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: spring },
  },
  pressable: {
    whileTap: { scale: 0.98 },
    whileHover: { scale: 1.01 },
  },
};

export function safeMotion(variantSettings) {
  if (prefersReducedMotion) return {};
  return variantSettings;
}
