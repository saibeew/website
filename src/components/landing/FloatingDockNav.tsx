"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useMotionValue } from "framer-motion";
import Link from "next/link";
import { Home, Layers, Newspaper, CreditCard, LogIn, Sparkles, Menu, X, Command } from "lucide-react";

const NAV_ITEMS = [
  { name: "Home", icon: Home, href: "/" },
  { name: "Features", icon: Layers, href: "#features" },
  { name: "War Room", icon: Newspaper, href: "#warroom" },
  { name: "Pricing", icon: CreditCard, href: "#pricing" },
];

function MagneticItem({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const position = { x: useMotionValue(0), y: useMotionValue(0) };
    
    const handleMouse = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current?.getBoundingClientRect() || { height: 0, width: 0, left: 0, top: 0 };
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        position.x.set(middleX * 0.1); // Magnetic strength
        position.y.set(middleY * 0.1);
    }
    
    const reset = () => {
        position.x.set(0);
        position.y.set(0);
    }
    
    const { x, y } = position;
    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            style={{ x, y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        >
            {children}
        </motion.div>
    );
}

export default function FloatingDockNav() {
  const [activeTab, setActiveTab] = useState("Home");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  // Scroll Behavior: Contract on scroll down, Expand on scroll up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const direction = latest - lastScrollY.current;
    if (Math.abs(direction) > 10) {
      if (direction > 0 && latest > 100) {
         setIsExpanded(false); // Contract
      } else {
         setIsExpanded(true); // Expand
      }
    }
    lastScrollY.current = latest;
  });

  return (
    <>
      {/* --- DESKTOP DOCK (md+) --- */}
      <motion.nav
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-1 p-2 rounded-[24px] overflow-hidden"
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
            y: 0,
            opacity: 1,
            width: isExpanded ? "auto" : "auto", // Width handled by inner content padding
            padding: isExpanded ? "8px 12px" : "8px 8px",
            gap: isExpanded ? "4px" : "0px"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          background: "rgba(5, 7, 10, 0.85)", // Poly-Carbonate Glass
          backdropFilter: "blur(24px) saturate(150%)",
          borderTop: "0.5px solid rgba(255, 255, 255, 0.2)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.05)",
          borderRight: "1px solid rgba(255, 255, 255, 0.05)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.4)",
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)"
        }}
      >
        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC41Ii8+PC9zdmc+')" }}></div>

        {/* Navigation Items */}
        <AnimatePresence mode="popLayout">
            {isExpanded ? (
                // Full Expanded Mode
                NAV_ITEMS.map((item) => {
                    const isActive = activeTab === item.name;
                    return (
                        <MagneticItem key={item.name}>
                            <Link href={item.href} onClick={() => setActiveTab(item.name)}>
                                <motion.div
                                    className="relative px-5 py-2.5 rounded-2xl flex items-center justify-center cursor-pointer group"
                                    onHoverStart={() => {}}
                                >
                                    {/* Active Metaball Pill */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="dock-pill"
                                            className="absolute inset-0 rounded-2xl z-0"
                                            style={{
                                                background: "linear-gradient(90deg, #0EF2B1 0%, #5B8CFF 100%)",
                                            }}
                                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                        />
                                    )}
                                    
                                    {/* Icon & Label */}
                                    <div className="relative z-10 flex items-center gap-2">
                                        <item.icon 
                                            size={20} 
                                            className={`transition-colors duration-200 ${isActive ? 'text-[#05070A]' : 'text-[#94A3B8] group-hover:text-white'}`} 
                                            strokeWidth={2}
                                        />
                                        <span className={`text-sm font-semibold transition-colors duration-200 ${isActive ? 'text-[#05070A]' : 'text-[#94A3B8] group-hover:text-white'}`}>
                                            {item.name}
                                        </span>
                                    </div>
                                    
                                    {/* Hover Indicator Dot */}
                                    {!isActive && (
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </motion.div>
                            </Link>
                        </MagneticItem>
                    );
                })
            ) : (
                // Contracted Minimal Mode
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1"
                >
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#0EF2B1] to-[#5B8CFF] text-[#05070A]">
                        <Command size={20} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {isExpanded && <div className="w-px h-6 bg-white/10 mx-2" />}

        {/* CTA Actions (Only visible in Expanded Mode or condensed in minimal) */}
        <AnimatePresence>
            {isExpanded && (
                <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="flex items-center gap-2 overflow-hidden"
                >
                    <Link href="/login">
                        <MagneticItem>
                            <button className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-white text-sm font-medium transition-colors">
                                Login
                            </button>
                        </MagneticItem>
                    </Link>
                    <Link href="#apply">
                         <MagneticItem>
                            <button className="px-5 py-2.5 rounded-2xl bg-[#0EF2B1]/10 hover:bg-[#0EF2B1]/20 border border-[#0EF2B1]/20 text-[#0EF2B1] text-sm font-bold flex items-center gap-2 transition-colors">
                                <Sparkles size={16} />
                                <span>Apply for Beta</span>
                            </button>
                         </MagneticItem>
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.nav>

      {/* --- MOBILE FAB (unchanged) --- */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
         <AnimatePresence>
            {isMobileOpen && (
                <motion.div
                    className="absolute bottom-16 right-0 flex flex-col items-end gap-3 min-w-[160px]"
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                >
                    <div className="p-2 rounded-2xl border border-white/10 bg-[#05070A]/90 backdrop-blur-xl shadow-2xl flex flex-col gap-1 w-full relative overflow-hidden">
                        {/* Noise Texture */}
                        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC41Ii8+PC9zdmc+')" }}></div>
                        
                        {NAV_ITEMS.map((item) => (
                             <Link key={item.name} href={item.href} onClick={() => setIsMobileOpen(false)}>
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative z-10 ${activeTab === item.name ? 'bg-white/10 text-white' : 'text-[#94A3B8] hover:text-white'}`}>
                                    <item.icon size={18} />
                                    <span className="text-sm font-medium">{item.name}</span>
                                </div>
                             </Link>
                        ))}
                        <div className="h-px bg-white/10 my-1 relative z-10" />
                        <Link href="/login">
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#94A3B8] hover:text-white relative z-10">
                                <LogIn size={18} />
                                <span className="text-sm font-medium">Login</span>
                            </div>
                        </Link>
                    </div>
                </motion.div>
            )}
         </AnimatePresence>

         <motion.button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0EF2B1] to-[#5B8CFF] text-[#05070A] flex items-center justify-center shadow-[0_4px_20px_rgba(14,242,177,0.4)] relative overflow-hidden"
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
         >
             <AnimatePresence mode="wait">
                 {isMobileOpen ? (
                     <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                        <X size={24} strokeWidth={2.5} />
                     </motion.div>
                 ) : (
                     <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                        <Menu size={24} strokeWidth={2.5} />
                     </motion.div>
                 )}
             </AnimatePresence>
         </motion.button>
      </div>
    </>
  );
}
