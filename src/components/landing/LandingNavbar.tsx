"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import NeonButton from "../ui/NeonButton";

export default function LandingNavbar() {
  return (
    <motion.nav 
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-[#040915]/50 border-b border-white/5"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "circOut" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline group">
          <div className="w-9 h-9 bg-gradient-to-br from-[#0EF2B1] to-[#5B8CFF] rounded-lg flex items-center justify-center font-extrabold text-[#05070A] text-sm group-hover:shadow-[0_0_15px_rgba(14,242,177,0.5)] transition-shadow duration-300">
            BW
          </div>
          <span className="font-bold text-white text-lg tracking-tighter">BEEW</span>
        </Link>
        
        {/* Links */}
        <div className="hidden md:flex gap-8">
          {['Features', 'Market', 'Pricing'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className="text-text-muted hover:text-white text-sm transition-colors font-medium"
            >
              {item}
            </a>
          ))}
        </div>
        
        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <Link href="/login">
            <button className="bg-transparent border-none text-white text-sm cursor-pointer px-4 py-2 hover:text-primary transition-colors font-medium">
              Login
            </button>
          </Link>
          <Link href="/register">
             <NeonButton size="sm" variant="primary">Get Started</NeonButton>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
