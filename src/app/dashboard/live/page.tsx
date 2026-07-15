"use client";

import { useState, useEffect } from "react";
import GlassCard from "@/components/ui/GlassCard";
import TradingLoader from "@/components/ui/TradingLoader";
import NeonButton from "@/components/ui/NeonButton";
import { Activity } from "lucide-react";
import LivePriceFeed from "@/components/dashboard/live/LivePriceFeed";
import SystemHealth from "@/components/dashboard/live/SystemHealth";
import MarketChart from "@/components/dashboard/MarketChart";
import TerminalConsole from "@/components/dashboard/live/TerminalConsole";
import { useStore, type Trade } from "@/store/useStore";

export default function LiveMonitoringPage() {
  const [loading, setLoading] = useState(true);
  const { activeSymbol, trades, addTerminalLog, stopAllStrategies, addNotification, deployedStrategies, fetchDeployments } = useStore();

  const exportLog = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      sessionDate: new Date().toISOString(),
      symbol: activeSymbol,
      trades: trades
    }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `trading_log_${activeSymbol}_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    addNotification({
        title: "Log Exported",
        message: "Your session log has been generated and downloaded.",
        type: "success"
    });
  };

  useEffect(() => {
    addTerminalLog("Global Execution Bridge initialized.");
    addTerminalLog(`Monitoring ${activeSymbol} Liquidity...`);
    const timer = setTimeout(() => setLoading(false), 300);
    void fetchDeployments();

    return () => {
        clearTimeout(timer);
    };
  }, [activeSymbol, addTerminalLog, fetchDeployments]);

  if (loading) return <TradingLoader />;

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden pb-4">
      <div className="shrink-0 flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-white mb-1">Live Terminal</h2>
           <p className="text-text-muted text-sm">Market monitoring and terminal-verified execution activity.</p>
        </div>
        <div className="flex gap-3">
           <NeonButton size="sm" variant="danger" onClick={stopAllStrategies}>Stop All</NeonButton>
           <NeonButton size="sm" variant="primary" onClick={() => addNotification({ title: "Add Market", message: "Select a new market pair from the dashboard toolbar.", type: "info" })}>Add Market</NeonButton>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Price, Health, Chart */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 min-h-0">
           
           {/* Price & Health Row */}
           <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-6 flex items-center justify-center bg-primary/5 border-primary/20" glowColor="primary">
                 <LivePriceFeed symbol={activeSymbol.includes("USD") && !activeSymbol.includes("USDT") ? activeSymbol.replace("USD", "USDT") : activeSymbol} />
              </GlassCard>
              <SystemHealth />
           </div>

           {/* Live Chart */}
           <GlassCard className="flex-1 p-0 overflow-hidden relative border-white/5 bg-surface/30">
              <MarketChart symbol={activeSymbol} />
              
              {/* Overlay Info */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                 <div className="flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-mono text-white/80 uppercase tracking-widest">Live Execution Stream</span>
                 </div>
              </div>
           </GlassCard>

           {/* Terminal Console (NEW) */}
           <div className="h-48 shrink-0">
               <TerminalConsole />
           </div>
        </div>

        {/* Right Column: Execution Log & AI Signal */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 min-h-0">
           <GlassCard className="flex-1 p-0 overflow-hidden flex flex-col border-white/5 bg-surface/30">
              <div className="p-4 border-b border-white/5 bg-[#0B0F1A]/50 flex justify-between items-center">
                 <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Activity size={16} className="text-primary" />
                    Live Execution Log
                 </h3>
                 <span className="text-[10px] text-text-muted uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded border border-white/5">
                    Real-time
                 </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono">
                 {trades.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                        <Activity size={40} className="mb-4" />
                        <p className="text-xs uppercase tracking-tighter">Waiting for executions...</p>
                    </div>
                 ) : (
                    trades.map((trade: Trade, i: number) => (
                        <div key={i} className="flex justify-between items-center text-xs animate-in fade-in slide-in-from-right-2 duration-300">
                           <div className="flex items-center gap-3">
                              <span className={`w-8 font-bold ${trade.side === 'BUY' ? "text-green-500" : "text-red-500"}`}>
                                 {trade.side}
                              </span>
                              <span className="text-white">{trade.amount} BTC</span>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className="text-text-muted/60">{trade.time}</span>
                              <span className="text-white/20">|</span>
                              <span className="text-green-400/50">OK</span>
                           </div>
                        </div>
                    ))
                 )}
              </div>
              <div className="p-3 border-t border-white/5 bg-black/20 text-center">
                 <button onClick={exportLog} className="text-[10px] text-primary hover:text-white transition-colors uppercase tracking-widest font-bold">
                    Export Session Log
                 </button>
              </div>
            </GlassCard>

            {/* Active Deployments Section */}
            <GlassCard className="h-44 p-0 overflow-hidden flex flex-col border-primary/20 bg-primary/5">
                <div className="p-3 border-b border-primary/10 bg-primary/5 flex justify-between items-center">
                    <h3 className="font-bold text-[10px] text-primary uppercase tracking-widest flex items-center gap-2">
                        <Activity size={12} />
                        Active Deployments ({deployedStrategies.length})
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {deployedStrategies.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[10px] text-text-muted opacity-50 italic">
                            No active strategies deployed.
                        </div>
                    ) : (
                        deployedStrategies.map((strat) => (
                            <div key={strat.id} className="flex justify-between items-center p-2 rounded bg-black/20 border border-white/5">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-white">{strat.name}</span>
                                    <span className="text-[9px] text-text-muted font-mono">
                                      {(strat.platform || "mt5").toUpperCase()} | {strat.symbol || activeSymbol} {strat.timeframe || ""} | LOT: {strat.lotSize}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${strat.status === "Running" ? "bg-green-500 animate-pulse" : "bg-amber-400"}`} />
                                    <span className={`text-[9px] font-bold ${strat.status === "Running" ? "text-green-400" : "text-amber-300"}`}>{strat.status.toUpperCase()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </GlassCard>

            {/* AI Signal Monitor */}
           <GlassCard className="h-48 p-4 border-white/5 bg-surface/30 flex flex-col justify-center">
               <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                       <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Gravity-V2 AI Stream</span>
                   </div>
                   <div className="text-[10px] font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded">BULLISH CONFIRMED</div>
               </div>
               <div className="text-xs text-white/80 font-mono italic leading-relaxed space-y-2">
                  <p>Detecting buy-side liquidity sweep at 1.1042...</p>
                  <p className="text-text-muted">Institutional rejection candle forming on 15m TF.</p>
                  <p className="text-primary/70">Targeting Fair Value Gap at 1.1085. Risk: 0.5%.</p>
               </div>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}
