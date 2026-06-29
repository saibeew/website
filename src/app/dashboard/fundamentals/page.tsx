"use client";

import { useState } from "react";
import AssetSelector from "@/components/dashboard/AssetSelector";
import MarketChart from "@/components/dashboard/MarketChart";
import LiveNewsWidget from "@/components/dashboard/LiveNewsWidget";
import BiasNarrative from "@/components/dashboard/BiasNarrative";
import { Info, LayoutGrid, FileText, Calendar as CalendarIcon, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

// Sub-components
import DailyBiasView from "@/components/dashboard/fundamentals/DailyBiasView";
import CalendarView from "@/components/dashboard/fundamentals/CalendarView";
import BacktestView from "@/components/dashboard/fundamentals/BacktestView";

// --- Sub-Navigation Items ---
const NAV_ITEMS = [
  { id: "dashboard", label: "Overview", icon: LayoutGrid },
  { id: "bias", label: "Daily Bias", icon: FileText },
  { id: "calendar", label: "Economic Calendar", icon: CalendarIcon },
  { id: "backtest", label: "Backtest", icon: Search },
];

export default function FundamentalsPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [asset, setAsset] = useState("XAUUSD");

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-4">
      {/* Top Bar: Sub-Navigation + Asset Selector */}
      <div className="flex items-center justify-between shrink-0 h-10">
         
         {/* Mini Navigation */}
         <div className="flex bg-[#0B0F1A] p-1 rounded-lg border border-white/5 gap-1">
            {NAV_ITEMS.map((item) => {
               const isActive = activeTab === item.id;
               const Icon = item.icon;
               return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                      isActive 
                        ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(124,58,237,0.2)] border border-primary/20" 
                        : "text-text-muted hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon size={14} />
                    {item.label}
                  </button>
               );
            })}
         </div>

         <AssetSelector selected={asset} onSelect={setAsset} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 bg-[#0B0F1A]/50 border border-white/5 rounded-xl overflow-hidden relative backdrop-blur-sm">
         <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
                <motion.div 
                    key="dashboard"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full grid grid-cols-12 gap-6 p-1"
                >
                     {/* Main Chart Area (70%) */}
                     <div className="col-span-12 lg:col-span-9 flex flex-col gap-4 h-full min-h-0">
                         {/* Chart Card */}
                         <div className="flex-1 relative bg-black/40 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm">
                            <MarketChart symbol={asset} />
                         </div>

                     {/* Narrative Section */}
                         <BiasNarrative symbol={asset} />
                     </div>

                     {/* Right Sidebar: News (30%) */}
                     <div className="col-span-12 lg:col-span-3 h-full min-h-0 bg-[#0B0F1A] border border-white/5 rounded-xl overflow-hidden">
                         <LiveNewsWidget symbol={asset} />
                     </div>
                </motion.div>
            )}

            {activeTab === "bias" && (
                <motion.div key="bias" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                    <DailyBiasView />
                </motion.div>
            )}

            {activeTab === "calendar" && (
                <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                    <CalendarView />
                </motion.div>
            )}



            {activeTab === "backtest" && (
                <motion.div key="backtest" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                    <BacktestView />
                </motion.div>
            )}

         </AnimatePresence>
      </div>
    </div>
  );
}
