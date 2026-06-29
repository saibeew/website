"use client";

import GlassCard from "@/components/ui/GlassCard";
import { ArrowUpRight, ArrowDownRight, Activity, Wallet, DollarSign, LayoutDashboard, Globe, Zap } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import Link from "next/link";

// Widgets
import AssetSelector from "@/components/dashboard/AssetSelector";
import MarketChart from "@/components/dashboard/MarketChart";
import LiveNewsWidget from "@/components/dashboard/LiveNewsWidget";
import DailyBiasView from "@/components/dashboard/fundamentals/DailyBiasView";
import CalendarView from "@/components/dashboard/fundamentals/CalendarView";

export default function DashboardPage() {
  const { balance, pnl, activeStrategies, fetchDashboardData, activeSymbol, setActiveSymbol } = useStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

   const [sentiment, setSentiment] = useState("Risk On");

   useEffect(() => {
     // Very simple logic to make it feel reactive
     if (activeSymbol.includes("USD") && !activeSymbol.includes("XAU")) {
        setSentiment("Neutral");
     } else if (activeSymbol.includes("XAU") || activeSymbol.includes("BTC")) {
        setSentiment("Risk On");
     } else {
        setSentiment("Risk Off");
     }
   }, [activeSymbol]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
       {/* Asset Selector & Metrics */}
       <div className="shrink-0 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
              <AssetSelector selected={activeSymbol} onSelect={setActiveSymbol} />
          </div>
          <div className="lg:w-[400px] flex items-center justify-end gap-2 text-xs text-text-muted">
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live Feed Active</span>
              <span className="mx-2 opacity-20">|</span>
              <span>Account: PRO-Tier</span>
          </div>
       </div>

       {/* Metrics Row (Compact) */}
       <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-4 flex items-center justify-between" glowColor="primary">
              <div>
                 <div className="text-text-muted text-xs font-medium mb-1">Total Balance</div>
                 <div className="text-2xl font-bold text-white">${balance.toLocaleString()}</div>
              </div>
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                 <Wallet size={20} />
              </div>
          </GlassCard>

          <GlassCard className="p-4 flex items-center justify-between" glowColor="secondary">
              <div>
                 <div className="text-text-muted text-xs font-medium mb-1">Total PnL</div>
                 <div className="text-2xl font-bold text-white flex items-center gap-2">
                    +{pnl}% <span className="text-green-500 text-xs bg-green-500/10 px-1.5 py-0.5 rounded">+$2,450</span>
                 </div>
              </div>
              <div className="h-10 w-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                 <DollarSign size={20} />
              </div>
          </GlassCard>

          <GlassCard className="p-4 flex items-center justify-between" glowColor="accent">
              <div>
                 <div className="text-text-muted text-xs font-medium mb-1">Active Strategies</div>
                 <div className="text-2xl font-bold text-white">{activeStrategies} Running</div>
              </div>
              <div className="h-10 w-10 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                 <Activity size={20} />
              </div>
          </GlassCard>

           <Link href="/dashboard/live" className="block cursor-pointer transition-transform hover:scale-[1.02]">
            <GlassCard className="p-4 flex items-center justify-between h-full" glowColor={sentiment === "Risk On" ? "danger" : sentiment === "Neutral" ? "secondary" : "primary"}>
                <div>
                  <div className="text-text-muted text-xs font-medium mb-1">Market Sentiment</div>
                  <div className="text-2xl font-bold text-white">{sentiment}</div>
                </div>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  sentiment === "Risk On" ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
                }`}>
                  <Zap size={20} />
                </div>
            </GlassCard>
           </Link>
       </div>

       {/* Command Center Grid */}
       <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
          
          {/* Left Column: Chart & Bias (70%) */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 h-full min-h-0">
              
              {/* Primary Chart */}
              <div className="flex-[2] bg-surface/30 border border-white/5 rounded-xl overflow-hidden relative">
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                      <span className="bg-black/40 backdrop-blur border border-white/10 px-2 py-1 rounded text-xs text-white font-mono uppercase">{activeSymbol}</span>
                      <span className="bg-green-500/10 border border-green-500/20 px-2 py-1 rounded text-xs text-green-400 font-bold">LIVE</span>
                  </div>
                  <MarketChart symbol={activeSymbol} />
              </div>

              {/* Daily Bias Feed */}
              <div className="flex-1 bg-surface/30 border border-white/5 rounded-xl overflow-hidden flex flex-col min-h-0">
                  <div className="p-3 border-b border-white/5 flex justify-between items-center bg-[#0B0F1A]/50">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <LayoutDashboard size={14} className="text-primary" />
                          Latest Intelligence
                      </h3>
                      <Link href="/dashboard/fundamentals" className="text-xs text-primary hover:text-white transition-colors">
                          View All
                      </Link>
                  </div>
                  <div className="flex-1 overflow-hidden relative">
                       {/* Scale down the view slightly to fit widget style */}
                       <div className="absolute inset-0 overflow-y-auto">
                           <DailyBiasView />
                       </div>
                  </div>
              </div>
          </div>

          {/* Right Column: News & Calendar (30%) */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full min-h-0">
              
              {/* Live News */}
              <div className="flex-1 bg-surface/30 border border-white/5 rounded-xl overflow-hidden flex flex-col min-h-0">
                   <div className="p-3 border-b border-white/5 flex justify-between items-center bg-[#0B0F1A]/50">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Globe size={14} className="text-blue-400" />
                          {activeSymbol} News Feed
                      </h3>
                  </div>
                  <div className="flex-1 min-h-0">
                      <LiveNewsWidget symbol={activeSymbol} />
                  </div>
              </div>

              {/* Calendar */}
              <div className="flex-1 bg-surface/30 border border-white/5 rounded-xl overflow-hidden flex flex-col min-h-0">
                  <div className="flex-1 min-h-0">
                      <CalendarView />
                  </div>
              </div>

          </div>
       </div>
    </div>
  );
}
