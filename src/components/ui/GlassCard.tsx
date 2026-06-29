"use client";

import { motion } from "framer-motion";
import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "primary" | "secondary" | "accent" | "success" | "danger";
  hoverEffect?: boolean;
  style?: React.CSSProperties;
}

export default function GlassCard({
  children,
  className = "",
  glowColor = "primary",
  hoverEffect = true,
  style,
}: GlassCardProps) {
  
  // High-Fidelity Solid Glow Borders
  const glowColors = {
    primary: "border-t-[#0EF2B1]/20 hover:border-[#0EF2B1]/40",
    secondary: "border-t-[#5B8CFF]/20 hover:border-[#5B8CFF]/40",
    accent: "border-t-[#00EF6B]/20 hover:border-[#00EF6B]/40",
    success: "border-t-green-500/20 hover:border-green-500/40",
    danger: "border-t-red-500/20 hover:border-red-500/40"
  };

  const shadowColors = {
    primary: "rgba(14,242,177,0.15)", 
    secondary: "rgba(91,140,255,0.15)", 
    accent: "rgba(0,239,107,0.15)",    
    success: "rgba(34,197,94,0.15)",
    danger: "rgba(239,68,68,0.15)"
  };

  return (
    <motion.div
      className={`relative bg-[#0F172A]/80 border border-white/5 rounded-3xl p-6 overflow-hidden shadow-xl transition-all duration-300 border-t ${glowColors[glowColor]} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={style}
      whileHover={hoverEffect ? { 
        y: -4, 
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        boxShadow: `0 20px 40px -10px ${shadowColors[glowColor]}`
      } : {}}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-10" />
      <div className="relative z-20">
        {children}
      </div>
    </motion.div>
  );
}
