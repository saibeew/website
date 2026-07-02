"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Search, Globe, BarChart3, ArrowUpDown } from "lucide-react";
import { US_INDICATORS, CATEGORIES, type IndicatorCategory, type EconomicIndicator } from "./indicatorsData";

type SortKey = "name" | "last" | "previous" | "highest" | "lowest";
type SortDir = "asc" | "desc";

export default function IndicatorsPage() {
  const [activeCategory, setActiveCategory] = useState<IndicatorCategory>("overview");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let items: EconomicIndicator[];
    if (activeCategory === "overview") {
      // Overview: show a curated selection of headline indicators
      const headlines = [
        "GDP Growth Rate", "GDP Annual Growth Rate", "GDP",
        "Unemployment Rate", "Non Farm Payrolls", "Inflation Rate",
        "Core Inflation Rate", "Interest Rate", "10-Year Treasury Yield",
        "Balance of Trade", "Government Debt to GDP", "Consumer Confidence",
        "Manufacturing PMI", "Retail Sales MoM", "Corporate Tax Rate",
      ];
      items = US_INDICATORS.filter(i => headlines.includes(i.name));
    } else {
      items = US_INDICATORS.filter(i => i.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q));
    }

    items.sort((a, b) => {
      let cmp: number;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else {
        cmp = parseFloat(a[sortKey]) - parseFloat(b[sortKey]);
        if (isNaN(cmp)) cmp = a[sortKey].localeCompare(b[sortKey]);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return items;
  }, [activeCategory, search, sortKey, sortDir]);

  const getChangeColor = (last: string, prev: string) => {
    const l = parseFloat(last);
    const p = parseFloat(prev);
    if (isNaN(l) || isNaN(p)) return "text-white/60";
    if (l > p) return "text-green-400";
    if (l < p) return "text-red-400";
    return "text-white/60";
  };

  const getChangeIcon = (last: string, prev: string) => {
    const l = parseFloat(last);
    const p = parseFloat(prev);
    if (isNaN(l) || isNaN(p)) return null;
    if (l > p) return <TrendingUp size={12} className="text-green-400" />;
    if (l < p) return <TrendingDown size={12} className="text-red-400" />;
    return null;
  };

  const SortIcon = ({ field }: { field: SortKey }) => (
    <ArrowUpDown
      size={10}
      className={`inline ml-1 transition-colors ${sortKey === field ? "text-primary" : "text-white/20"}`}
    />
  );

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center">
            <Globe size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">United States Economic Indicators</h1>
            <p className="text-xs text-text-muted">Macro-economic data powering institutional decisions</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search indicators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:border-primary/50 focus:outline-none w-64 transition-colors"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 bg-[#0B0F1A] p-1 rounded-xl border border-white/5 overflow-x-auto shrink-0 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeCategory === cat.id
                ? "bg-primary/20 text-primary border border-primary/20 shadow-[0_0_10px_rgba(0,242,254,0.1)]"
                : "text-text-muted hover:text-white hover:bg-white/5"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div className="flex-1 min-h-0 bg-[#0B0F1A]/80 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-white/10 bg-white/[0.02] shrink-0">
          <button onClick={() => handleSort("name")} className="col-span-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
            Indicator <SortIcon field="name" />
          </button>
          <button onClick={() => handleSort("last")} className="col-span-2 text-right text-[10px] font-bold text-text-muted uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
            Last <SortIcon field="last" />
          </button>
          <button onClick={() => handleSort("previous")} className="col-span-2 text-right text-[10px] font-bold text-text-muted uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
            Previous <SortIcon field="previous" />
          </button>
          <button onClick={() => handleSort("highest")} className="col-span-1 text-right text-[10px] font-bold text-text-muted uppercase tracking-widest cursor-pointer hover:text-white transition-colors hidden lg:block">
            Highest <SortIcon field="highest" />
          </button>
          <button onClick={() => handleSort("lowest")} className="col-span-1 text-right text-[10px] font-bold text-text-muted uppercase tracking-widest cursor-pointer hover:text-white transition-colors hidden lg:block">
            Lowest <SortIcon field="lowest" />
          </button>
          <div className="col-span-1 text-right text-[10px] font-bold text-text-muted uppercase tracking-widest hidden lg:block">
            Unit
          </div>
          <div className="col-span-1 text-right text-[10px] font-bold text-text-muted uppercase tracking-widest hidden lg:block">
            Freq
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-40 gap-3"
              >
                <BarChart3 size={32} className="text-white/10" />
                <p className="text-sm text-text-muted">No indicators match your search.</p>
              </motion.div>
            ) : (
              filtered.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.5) }}
                  className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors group cursor-default items-center"
                >
                  {/* Indicator Name */}
                  <div className="col-span-4 flex items-center gap-2.5">
                    <div className={`w-1 h-6 rounded-full ${getChangeColor(item.last, item.previous) === "text-green-400" ? "bg-green-500/40" : getChangeColor(item.last, item.previous) === "text-red-400" ? "bg-red-500/40" : "bg-white/10"}`} />
                    <span className="text-sm font-medium text-white group-hover:text-primary transition-colors truncate">
                      {item.name}
                    </span>
                  </div>

                  {/* Last Value */}
                  <div className="col-span-2 text-right flex items-center justify-end gap-1.5">
                    {getChangeIcon(item.last, item.previous)}
                    <span className={`text-sm font-mono font-bold ${getChangeColor(item.last, item.previous)}`}>
                      {item.last}
                    </span>
                  </div>

                  {/* Previous */}
                  <div className="col-span-2 text-right">
                    <span className="text-sm font-mono text-white/40">{item.previous}</span>
                  </div>

                  {/* Highest */}
                  <div className="col-span-1 text-right hidden lg:block">
                    <span className="text-xs font-mono text-green-500/50">{item.highest}</span>
                  </div>

                  {/* Lowest */}
                  <div className="col-span-1 text-right hidden lg:block">
                    <span className="text-xs font-mono text-red-500/50">{item.lowest}</span>
                  </div>

                  {/* Unit */}
                  <div className="col-span-1 text-right hidden lg:block">
                    <span className="text-[10px] text-text-muted">{item.unit}</span>
                  </div>

                  {/* Frequency */}
                  <div className="col-span-1 text-right hidden lg:block">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-text-muted border border-white/5">
                      {item.frequency}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-2.5 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
          <span className="text-[10px] text-text-muted">
            Showing {filtered.length} of {US_INDICATORS.length} indicators
          </span>
          <span className="text-[10px] text-text-muted">
            Source: beew.ai Macro Intelligence • Data approximated
          </span>
        </div>
      </div>
    </div>
  );
}
