"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutGrid, 
  LineChart, 
  Cpu, 
  ScrollText, 
  Globe, 
  LogOut, 
  Network,
  ChevronLeft,
  ChevronRight,
  Gem,
  Newspaper,
  Video
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: LayoutGrid, label: "Overview", href: "/dashboard" },
  { icon: LineChart, label: "Live Monitoring", href: "/dashboard/live" },
  { icon: Cpu, label: "Strategy Lab", href: "/dashboard/templates" },
  { icon: Network, label: "Connections", href: "/dashboard/connections" },
  { icon: ScrollText, label: "Trade Journal", href: "/dashboard/journal" },
  { icon: Globe, label: "Fundamentals", href: "/dashboard/fundamentals" },
  { icon: Newspaper, label: "Market News", href: "/dashboard/news" },
  { icon: Video, label: "Beew Studio", href: "/dashboard/studio" },
  { icon: Gem, label: "Subscription", href: "/dashboard/subscription" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar, logout, isSidebarCollapsed, toggleSidebarCollapse } = useStore();
  const [isDesktop, setIsDesktop] = useState(true);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    if (typeof window !== 'undefined') {
        handleResize();
        window.addEventListener('resize', handleResize);
    }
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Aura-Optimized Animation Engine
  const containerVariants = {
    hidden: { opacity: 0, x: -50 },
    show: {
      opacity: 1,
      x: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.2, duration: 0.4 }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    show: { 
        x: 0, 
        opacity: 1,
        transition: { type: "spring", stiffness: 100 }
    }
  };

  const sidebarWidth = isSidebarCollapsed ? "80px" : "280px";

  // --- STANDARD FULL-HEIGHT SIDEBAR (Mobile Slide-out) ---
  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <motion.aside
        variants={containerVariants}
        initial="hidden"
        animate={{ 
            opacity: 1, 
            x: isDesktop ? 0 : (isSidebarOpen ? 0 : "-100%"), // Logic from previous sidebar 
            width: isDesktop ? sidebarWidth : "280px",
        }}
        transition={{ type: "spring", stiffness: 150, damping: 30 }}
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 flex flex-col overflow-hidden",
          "bg-[#050505]/98 shadow-[10px_0_30px_rgba(0,0,0,0.5)]",
          "border-r border-white/5", // Standard border
          !isDesktop && "w-[280px]"
        )}
      >
        {/* Moving Scan-line Border (Right Edge Only) */}
        <div className="absolute inset-y-0 right-0 w-[1px] bg-white/10 overflow-hidden pointer-events-none">
            <motion.div 
               animate={{ top: ["0%", "100%"] }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="absolute top-0 w-full h-[50%] bg-gradient-to-b from-transparent via-[#00f2fe] to-transparent opacity-50 shadow-[0_0_10px_#00f2fe]"
            />
        </div>

        {/* Header / Logo */}
        <div className="h-20 flex items-center justify-between px-6 shrink-0 relative z-10 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <motion.div 
              animate={{ rotate: isSidebarCollapsed ? 360 : 0 }}
              transition={{ duration: 0.6, ease: "backOut" }}
              className="px-2 h-10 min-w-[40px] bg-gradient-to-br from-[#00f2fe] to-[#4facfe] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.4)] relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
               <span className="font-black text-black text-[10px] tracking-tighter relative z-10">beew</span>
            </motion.div>
            <AnimatePresence>
                {!isSidebarCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex flex-col"
                    >
                        <span className="font-bold text-white text-lg tracking-tight">beew<span className="text-[#00f2fe]">.ai</span></span>
                    </motion.div>
                )}
            </AnimatePresence>
          </Link>
          <button onClick={toggleSidebarCollapse} className="hidden md:flex opacity-50 hover:opacity-100 transition-opacity">
              <div className={`w-1 h-4 bg-white/20 rounded-full transition-transform ${isSidebarCollapsed ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Nav Items */}
        <nav 
            className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto overflow-x-hidden scrollbar-none px-4 relative z-10"
            onMouseLeave={() => setHoveredTab(null)}
        >
          {NAV_ITEMS.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "relative group flex items-center h-12 rounded-xl text-sm font-medium transition-all duration-300",
                  isActive ? "text-[#00f2fe]" : "text-white/50 hover:text-white"
                )}
                onMouseEnter={() => setHoveredTab(item.href)}
              >
                {/* CYBER-KINETIC: Hover Slide-Tracker (Vertical Bar) */}
                {hoveredTab === item.href && (
                    <motion.div
                        layoutId="hover-tracker"
                        className="absolute left-0 h-8 w-1 bg-gradient-to-b from-[#00f2fe] to-[#7000ff] rounded-r-full shadow-[0_0_10px_#00f2fe]"
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                )}
                
                {/* Active State Indicator (Solid) */}
                {isActive && !hoveredTab && (
                     <div className="absolute left-0 h-8 w-1 bg-[#00f2fe] rounded-r-full" />
                )}

                <div className="flex items-center w-full pl-4">

                    <item.icon 
                        size={20} 
                        className={cn(
                            "shrink-0 transition-all duration-300 z-10",
                            // KINETIC: Neon Bloom Effect
                            "group-hover:rotate-[-5deg] group-hover:scale-110 group-hover:text-[#00f2fe] group-hover:drop-shadow-[0_0_15px_rgba(0,242,254,0.4)]",
                            isActive ? "text-[#00f2fe] drop-shadow-[0_0_5px_#00f2fe]" : "group-hover:text-white",
                            isSidebarCollapsed && "mx-auto" 
                        )} 
                    />
                    
                    <AnimatePresence mode="wait">
                        {!isSidebarCollapsed && (
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="ml-4 truncate relative z-10 tracking-[0.05em] group-hover:tracking-[0.1em] transition-all duration-300"
                            >
                                {item.label}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
                
                {/* Tooltip for Collapsed Mode */}
                {isSidebarCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-[#1a1a1a] border border-white/20 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-2 group-hover:translate-x-0 z-[60] whitespace-nowrap shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                        {item.label}
                    </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 mt-auto relative z-10">
           <button onClick={logout} className="flex items-center gap-3 text-xs font-bold text-red-500/60 hover:text-red-400 uppercase tracking-widest transition-colors w-full">
              <LogOut size={16} />
              {!isSidebarCollapsed && "Disconnect"}
           </button>
        </div>
      </motion.aside>
    </>
  );
}
