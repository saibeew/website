"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CyberButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  variant?: "action" | "glass" | "danger";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  glowColor?: string; // Hex or tailwind color class
}

export default function CyberButton({
  children,
  variant = "glass",
  className,
  startIcon,
  endIcon,
  glowColor = "#00f2fe",
  ...props
}: CyberButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Measure for SVG perimeter
  useEffect(() => {
    if (buttonRef.current) {
      setDimensions({
        width: buttonRef.current.offsetWidth,
        height: buttonRef.current.offsetHeight,
      });
    }
  }, []);

  // --- LASER BORDER LOGIC (Action Variant) ---
  const perimeter = (dimensions.width + dimensions.height) * 2;
  
  return (
    <motion.button
      ref={buttonRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        y: -2, 
        scale: 1.02,
        boxShadow: variant === 'action' ? `0 0 20px ${glowColor}66` : 'none' 
      }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25 
      }}
      className={cn(
        "relative flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold tracking-wide uppercase transition-all overflow-hidden",
        
        // Glass Variant (Navigation)
        variant === "glass" && "bg-surface/30 backdrop-blur-md border border-white/10 text-text-muted hover:text-white hover:bg-white/5",
        
        // Action Variant (Buy/Execute)
        variant === "action" && "bg-surface/80 text-white border border-transparent",
        
        // Danger Variant (Sell/Stop)
        variant === "danger" && "bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20",

        className
      )}
      {...props}
    >
      {/* 1. GLASS REFRACTION EFFECT (Sweep) */}
      {variant === "glass" && (
        <div className="absolute inset-0 -skew-x-[20deg] overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ left: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
          />
        </div>
      )}

      {/* 2. LASER BORDER TRACE (Action) */}
      {variant === "action" && dimensions.width > 0 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0">
           <defs>
             <linearGradient id={`${glowColor}-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
               <stop offset="0%" stopColor="transparent" />
               <stop offset="50%" stopColor={glowColor} />
               <stop offset="100%" stopColor="transparent" />
             </linearGradient>
           </defs>
           <motion.rect
             x="1" y="1"
             width={dimensions.width - 2}
             height={dimensions.height - 2}
             rx="6" ry="6" // Match rounded-lg approx
             fill="none"
             stroke={glowColor}
             strokeWidth="2"
             strokeDasharray={`${perimeter / 3} ${perimeter}`} // 1/3rd line, rest gap
             animate={{ strokeDashoffset: [perimeter, -perimeter] }} // Animate full cycles
             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
             style={{ filter: `drop-shadow(0 0 5px ${glowColor})` }}
           />
        </svg>
      )}

      {/* Button Content (Z-Index above effects) */}
      <span className="relative z-10 flex items-center gap-2">
        {startIcon}
        {children}
        {endIcon}
      </span>

      {/* Click Ripple Ripple (Optional, relying on Framer tap for now) */}
    </motion.button>
  );
}
