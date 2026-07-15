"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

export default function NotificationDropdown() {
  const { notifications, markAllRead } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
      switch(type) {
          case 'warning': return <AlertTriangle size={14} className="text-yellow-400" />;
          case 'success': return <CheckCircle2 size={14} className="text-green-400" />;
          case 'alert': return <AlertTriangle size={14} className="text-red-400" />;
          default: return <Info size={14} className="text-blue-400" />;
      }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5 outline-none"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444] animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-4 w-80 bg-[#0B0F1A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden origin-top-right"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                        <button 
                            onClick={markAllRead}
                            className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
                        >
                            <Check size={12} /> Mark all read
                        </button>
                    )}
                </div>

                {/* List */}
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-text-muted text-xs">
                            No notifications yet.
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div 
                                key={n.id} 
                                className={cn(
                                    "p-4 border-b border-white/5 hover:bg-white/5 transition-colors relative group",
                                    !n.read ? "bg-primary/5" : ""
                                )}
                            >
                                <div className="flex gap-3">
                                    <div className="mt-0.5 shrink-0">
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={cn("text-xs font-bold", !n.read ? "text-white" : "text-text-muted")}>
                                                {n.title}
                                            </h4>
                                            <span className="text-[10px] text-text-muted/60 whitespace-nowrap ml-2">
                                                {n.time}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-muted leading-relaxed">
                                            {n.message}
                                        </p>
                                    </div>
                                </div>
                                {!n.read && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full group-hover:opacity-0 transition-opacity"></div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
