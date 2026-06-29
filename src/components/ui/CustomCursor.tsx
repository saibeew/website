"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { usePathname } from "next/navigation";

// Cursor V3: The Mercury Lens (Fluid-Organic Physics)
export default function CustomCursor() {
  const pathname = usePathname();
  // Only active on Landing Page ("/")
  const isLandingPage = pathname === "/";
  // ... rest of the file ...

  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [clickState, setClickState] = useState<"idle" | "implode" | "explode">("idle");
  const [hoverState, setHoverState] = useState(false);

  // Surface Position (Smoothed)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Spring Physics for organic movement
  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  // Velocity Engine
  const velocityX = useMotionValue(0);
  const velocityY = useMotionValue(0);
  const scaleX = useSpring(1, springConfig);
  const scaleY = useSpring(1, springConfig);
  const rotate = useMotionValue(0);

  useEffect(() => {
    // Global Cursor Logic
    if (isLandingPage) {
        document.body.classList.add("custom-cursor-active");
    } else {
        document.body.classList.remove("custom-cursor-active");
        return; // Don't run physics loop if not on landing page
    }

    // 1. Accessibility: Detect Touch
    const checkTouch = () => setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    checkTouch();
    window.addEventListener('resize', checkTouch);

    let lastX = 0;
    let lastY = 0;
    let timeout: NodeJS.Timeout;

    const updatePhysics = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      
      // 2. Velocity Calculation
      const dx = clientX - lastX;
      const dy = clientY - lastY;
      const velocity = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      // 3. Fluid Dynamics (Stretch & Rotate)
      velocityX.set(dx);
      velocityY.set(dy);
      rotate.set(angle);
      
      // Elastic Stretch Logic
      const stretch = Math.min(velocity / 20, 1.2); 
      scaleX.set(1 + stretch);
      scaleY.set(1 - stretch * 0.4); 

      cursorX.set(clientX);
      cursorY.set(clientY);
      
      lastX = clientX;
      lastY = clientY;

      if (!isVisible) setIsVisible(true);
      
      // 4. Magnetism / Hover Detection
      const target = e.target as HTMLElement;
      const isClickable = target?.closest("button, a, [data-clickable='true'], input, textarea, select");
      setHoverState(!!isClickable);

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        scaleX.set(1);
        scaleY.set(1);
      }, 100);
    };

    const handleMouseDown = () => {
        setClickState("implode");
        setTimeout(() => setClickState("explode"), 150);
        setTimeout(() => setClickState("idle"), 400);
    };

    if (!isTouch) {
        window.addEventListener("mousemove", updatePhysics);
        window.addEventListener("mousedown", handleMouseDown);
    }

    return () => {
      document.body.classList.remove("custom-cursor-active"); // Cleanup
      window.removeEventListener("resize", checkTouch);
      window.removeEventListener("mousemove", updatePhysics);
      window.removeEventListener("mousedown", handleMouseDown);
      clearTimeout(timeout);
    };
  }, [isTouch, isVisible, cursorX, cursorY, scaleX, scaleY, rotate, velocityX, velocityY, isLandingPage]);

  // Don't render on touch or if not on landing page
  if (isTouch || !isVisible || !isLandingPage) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform"
      style={{
        x: smoothX,
        y: smoothY,
        rotate: rotate,
        translateX: "-50%",
        translateY: "-50%",
        mixBlendMode: "difference" // High Vision Contrast
      }}
    >
      {/* The Mercury Lens Element */}
      <motion.div
        animate={{
            // Interaction States
            scale: clickState === "implode" ? 0.2 : (clickState === "explode" ? 1.4 : (hoverState ? 1.5 : 1)),
            opacity: clickState === "explode" ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        style={{ scaleX, scaleY }}
        className="w-[20px] h-[20px] bg-white rounded-full backdrop-blur-[4px] brightness-125 border-[1.5px] border-cyan-400/50 shadow-[0_0_15px_rgba(0,242,254,0.4)]"
      >
          {/* Internal Fluid Glow (The 'Aura') */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-purple-500/20 rounded-full blur-[1px]" />
      </motion.div>
    </motion.div>
  );
}
