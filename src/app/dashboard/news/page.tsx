"use client";

import LiveNewsWidget from "@/components/dashboard/LiveNewsWidget";
import { useStore } from "@/store/useStore";
import { Newspaper } from "lucide-react";

export default function MarketNewsPage() {
  const { activeSymbol } = useStore();

  return (
    <div className="h-[calc(100vh-6.5rem)] w-full flex flex-col space-y-4 text-white overflow-hidden relative">
      {/* Header and Live Status */}
      <div className="flex flex-col space-y-1 md:flex-row md:items-center md:justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent flex items-center gap-2">
            <Newspaper className="text-primary animate-pulse" size={24} />
            News Intelligence Feed
          </h1>
          <p className="text-xs text-text-muted">
            AI-curated financial news & real-time sentiment signals.
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <LiveNewsWidget symbol={activeSymbol} layout="full" />
      </div>
    </div>
  );
}
