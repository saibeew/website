"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function NeonCursor() {
  const [clicked, setClicked] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Use springs for smooth movement
  const springConfig = { damping: 25, stiffness: 400 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    const mouseDown = () => setClicked(true);
    const mouseUp = () => setClicked(false);

    const onMouseEnter = () => setHidden(false);
    const onMouseLeave = () => setHidden(true);

    // Link hover detection
    const handleLinkHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button')
      ) {
        setLinkHovered(true);
      } else {
        setLinkHovered(false);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousedown", mouseDown);
    window.addEventListener("mouseup", mouseUp);
    window.addEventListener("mouseenter", onMouseEnter);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mouseover", handleLinkHover);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", mouseDown);
      window.removeEventListener("mouseup", mouseUp);
      window.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mouseover", handleLinkHover);
    };
  }, [cursorX, cursorY]);

  // Hide on mobile/touch devices
  if (typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent)) {
    return null;
  }

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-screen"
      style={{
        x: cursorX,
        y: cursorY,
        opacity: hidden ? 0 : 1,
      }}
    >
      {/* Main Cursor Dot */}
      <motion.div
        className="relative flex items-center justify-center rounded-full bg-primary"
        animate={{
          scale: clicked ? 0.8 : linkHovered ? 1.5 : 1,
          width: linkHovered ? 64 : 12,
          height: linkHovered ? 64 : 12,
          backgroundColor: linkHovered ? "rgba(14, 242, 177, 0.1)" : "#0EF2B1",
          border: linkHovered ? "1px solid rgba(14, 242, 177, 0.5)" : "none",
        }} // Tailwind colors: primary is #0EF2B1
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
          {/* Inner Dot (visible when hovering links) */}
         {linkHovered && (
             <motion.div 
                className="w-2 h-2 rounded-full bg-primary"
                layoutId="cursor-inner"
             />
         )}
      </motion.div>
      
      {/* Outer Glow */}
      <motion.div 
         className="absolute -inset-4 -z-10 bg-primary/40 blur-xl rounded-full"
         animate={{
             scale: clicked ? 1.2 : 1,
             opacity: linkHovered ? 0.6 : 0.4
         }}
      />
    </motion.div>
  );
}
