"use client";

import { useState } from "react";
import { Search, ChevronRight, Plus, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { ALL_ASSETS } from "@/lib/assets";
import { motion, AnimatePresence } from "framer-motion";

export default function AssetSelector({ selected, onSelect }: { selected: string, onSelect: (a: string) => void }) {
  const { watchlist, toggleWatchlist } = useStore();
  const [showManager, setShowManager] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Only show first 5 on the board
  const visibleAssets = watchlist.slice(0, 5);

  const filteredAssets = ALL_ASSETS.filter(a => a.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 p-1 bg-surface/50 border border-white/5 rounded-lg backdrop-blur-sm">
        {visibleAssets.map((asset) => (
          <button
            key={asset}
            onClick={() => onSelect(asset)}
            className={cn(
              "px-4 py-1.5 rounded-md text-xs font-bold transition-all relative group border",
              selected === asset 
                ? "bg-primary/20 text-primary border-primary/50 shadow-[0_0_15px_rgba(14,242,177,0.3)]" 
                : "border-transparent text-text-muted hover:text-white hover:bg-white/5"
            )}
          >
            {asset}
          </button>
        ))}
        
        {/* Add/Manage Button */}
        <button 
            onClick={() => setShowManager(true)}
            className="px-3 py-1.5 text-text-muted hover:text-white transition-colors border-l border-white/5 ml-1"
            title="Manage Watchlist"
        >
            <Plus size={14} />
        </button>
      </div>

      <Link href="/dashboard/fundamentals">
        <button className="ml-auto px-4 py-2 bg-surface border border-white/10 rounded-lg text-xs font-bold text-white hover:border-primary/50 transition-colors flex items-center gap-2">
           Market Recap <ChevronRight size={14} />
        </button>
      </Link>

      {/* Watchlist Manager Modal */}
      <AnimatePresence>
        {showManager && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#0B0F1A] border border-white/10 rounded-xl w-full max-w-lg h-[80vh] flex flex-col relative shadow-2xl"
                >
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Manage Watchlist</h3>
                        <button onClick={() => setShowManager(false)} className="text-white/50 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                            <input 
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-primary"
                                placeholder="Search symbol..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                         <div className="grid grid-cols-2 gap-2">
                             {filteredAssets.map(asset => {
                                 const isSelected = watchlist.includes(asset);
                                 return (
                                     <button
                                        key={asset}
                                        onClick={() => toggleWatchlist(asset)}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg border transition-all",
                                            isSelected 
                                                ? "bg-primary/10 border-primary/50 text-white" 
                                                : "bg-white/5 border-transparent hover:bg-white/10 text-text-muted"
                                        )}
                                     >
                                         <span className="font-bold">{asset}</span>
                                         <Star 
                                            size={16} 
                                            className={cn(
                                                isSelected ? "fill-primary text-primary" : "text-white/20"
                                            )} 
                                         />
                                     </button>
                                 );
                             })}
                         </div>
                    </div>
                    
                    <div className="p-4 border-t border-white/10 bg-white/5">
                        <p className="text-xs text-center text-text-muted">
                            The top 5 pinned assets will appear on your main dashboard toolbar.
                        </p>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
