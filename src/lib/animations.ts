
export const ANIMATION_DURATION = 500; // in milliseconds

// Staggered animation for multiple items
export const getStaggeredAnimation = (index: number, baseDelay: number = 50) => {
  return {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
      delay: index * baseDelay / 1000,
    }
  };
};

// Subtle pulse animation for data updates
export const pulseAnimation = {
  initial: { opacity: 1, scale: 1 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
  transition: { duration: 0.3, ease: "easeInOut" }
};

// Easing functions
export const easings = {
  spring: [0.5, 0, 0, 1.25],
  bounce: [0.4, 0, 0.2, 1.5],
  smooth: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
};
