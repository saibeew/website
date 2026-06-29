import { Variants } from "framer-motion";

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6 }
  }
};

export const slideUp: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const float: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const hologramFlicker: Variants = {
  hidden: { opacity: 0.8 },
  visible: {
    opacity: [0.8, 1, 0.4, 1, 0.8],
    transition: {
      duration: 0.2,
      repeat: Infinity,
      repeatDelay: 5
    }
  }
};

export const glowPulse: Variants = {
  initial: { boxShadow: "0 0 0 rgba(0, 246, 255, 0)" },
  animate: {
    boxShadow: [
      "0 0 5px rgba(0, 246, 255, 0.2)",
      "0 0 20px rgba(0, 246, 255, 0.6)",
      "0 0 5px rgba(0, 246, 255, 0.2)",
    ],
    transition: {
      duration: 2, 
      repeat: Infinity, 
      ease: "easeInOut"
    }
  }
};

export const zoomIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export const rotatePerspective: Variants = {
  hidden: { rotateX: 45, opacity: 0, z: -200 },
  visible: { 
    rotateX: 0, 
    opacity: 1, 
    z: 0,
    transition: { type: "spring", stiffness: 60, damping: 20 }
  }
};

export const slideFromRight: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 100 }
  }
};

export const cyberGlitch: Variants = {
  hidden: { opacity: 0, clipPath: "inset(50% 0 50% 0)" },
  visible: { 
    opacity: 1, 
    clipPath: "inset(0 0 0 0)",
    transition: { 
      duration: 0.5, 
      ease: "linear"
    }
  }
};
