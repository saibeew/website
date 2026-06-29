"use client";

import { motion } from "framer-motion";
import React from "react";

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  id?: string;
  variant?: "primary" | "secondary" | "accent" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function NeonButton({ 
  children, 
  onClick, 
  id,
  variant = "primary", 
  size = "md",
  className = "",
  icon,
  style,
  disabled = false,
  fullWidth = false
}: NeonButtonProps) {
    
  // Base styles
  const baseStyles = "relative bg-white/5 rounded-xl font-semibold cursor-pointer overflow-hidden backdrop-blur-md inline-flex items-center justify-center z-10 transition-all duration-300";
  
  // Variants
  const variants = {
    primary: "border border-[#0EF2B1]/30 shadow-[0_0_10px_rgba(14,242,177,0.1)] text-[#0EF2B1] hover:bg-[#0EF2B1]/10 hover:shadow-[0_0_20px_rgba(14,242,177,0.4)] hover:border-[#0EF2B1] hover:text-white",
    secondary: "border border-[#5B8CFF]/30 shadow-[0_0_10px_rgba(91,140,255,0.1)] text-[#5B8CFF] hover:bg-[#5B8CFF]/10 hover:shadow-[0_0_20px_rgba(91,140,255,0.4)] hover:border-[#5B8CFF] hover:text-white",
    accent: "border border-[#00EF6B]/30 shadow-[0_0_10px_rgba(0,239,107,0.1)] text-[#00EF6B] hover:bg-[#00EF6B]/10 hover:shadow-[0_0_20px_rgba(0,239,107,0.4)] hover:border-[#00EF6B] hover:text-white",
    success: "border border-green-500/30 text-green-500 hover:bg-green-500/10 hover:border-green-500",
    danger: "border border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500"
  };

  // Sizes
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-9 py-4 text-lg"
  };

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled ? "opacity-60 cursor-not-allowed grayscale pointer-events-none" : "";

  return (
    <motion.button
      id={id}
      data-magnetic="true"
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${disabledClass} ${className}`}
      onClick={!disabled ? onClick : undefined}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      style={style}
      disabled={disabled}
    >
      {/* Glow Effect */}
      <span className="absolute inset-0 w-0 h-0 m-auto rounded-full bg-radial-gradient from-current to-transparent opacity-0 transition-all duration-400 group-hover:w-[200px] group-hover:h-[200px] group-hover:opacity-20" />
      
      {/* Content */}
      <span className="relative z-20 flex items-center gap-2">
        {icon && <span className="flex items-center">{icon}</span>}
        {children}
      </span>
    </motion.button>
  );
}
