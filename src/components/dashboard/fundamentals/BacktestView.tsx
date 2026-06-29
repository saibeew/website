"use client";

import { Search, Play } from "lucide-react";

export default function BacktestView() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
       <div className="max-w-md w-full">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <Search size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Fundamental Backtester</h2>
            <p className="text-text-muted mb-8">
                Analyze historical price action against past economic events. understand the "Why" behind every move.
            </p>
            
            <div className="bg-surface/50 border border-white/5 rounded-xl p-6 text-left mb-6">
                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <label className="text-xs text-text-muted mb-1 block">Asset</label>
                        <div className="h-10 bg-black/40 border border-white/10 rounded-lg flex items-center px-3 text-sm text-white font-mono">XAUUSD</div>
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-text-muted mb-1 block">Date Range</label>
                        <div className="h-10 bg-black/40 border border-white/10 rounded-lg flex items-center px-3 text-sm text-white font-mono">Last 3 Months</div>
                    </div>
                </div>
                <button className="w-full h-11 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <Play size={16} />
                    Start Simulation
                </button>
            </div>
            
            <p className="text-xs text-white/30">
                This feature connects historical news APIs with price data. currently in beta.
            </p>
       </div>
    </div>
  );
}
