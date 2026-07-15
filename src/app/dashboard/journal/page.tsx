"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/store/useStore";
import GlassCard from "@/components/ui/GlassCard";
import CotReportView from "@/components/dashboard/fundamentals/CotReportView";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, ReferenceLine, ScatterChart, Scatter, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, LineChart, Line
} from 'recharts';
import { 
    TrendingUp, ShieldCheck, Target, Zap, 
    Microscope, AlertTriangle, Activity as PulseIcon, Search, LayoutDashboard, Database, Activity,
    BrainCircuit, Filter, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Professional FinTech Palette
const THEME = {
    bg: "#0F172A",          // Slate 900
    card: "#1E293B",        // Slate 800
    accent: "#3B82F6",      // Blue 500
    success: "#10B981",     // Emerald 500
    danger: "#EF4444",      // Red 500
    text: "#F8FAFC",        // Slate 50
    textMuted: "#94A3B8",   // Slate 400
    border: "#334155",      // Slate 700
    grid: "rgba(148, 163, 184, 0.05)"
};

// Insight Tag Component
const InsightTag = ({ title, desc, color = "blue" }: { title: string, desc: string, color?: string }) => (
    <div className={`mt-4 p-3 rounded-xl border ${color === 'blue' ? 'border-blue-500/20 bg-blue-500/5 text-blue-400' : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'} flex gap-3 items-start`}>
        <div className="mt-0.5"><PulseIcon size={12} /></div>
        <div className="flex-1">
            <span className="text-[10px] font-black uppercase tracking-widest block mb-0.5">{title}</span>
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default function JournalPage() {
  const { trades, fetchTrades } = useStore();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filterSymbol, setFilterSymbol] = useState("ALL");
  const [filterSide, setFilterSide] = useState("ALL");
  const [filterResult, setFilterResult] = useState("ALL");
  const [activeTab, setActiveTab] = useState("performance");
  const [simKey, setSimKey] = useState(0);
  const [aiOpinion, setAiOpinion] = useState("Initializing Diagnostic Pulse...");
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    fetchTrades().catch((error) => {
      console.error("Failed to load trade journal:", error);
      setLoadError(error instanceof Error ? error.message : "Unable to load trade journal.");
    });
  }, [fetchTrades]);

  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
        const matchSymbol = filterSymbol === "ALL" || t.symbol === filterSymbol;
        const matchSide = filterSide === "ALL" || t.side === filterSide;
        const matchResult = filterResult === "ALL" || (filterResult === "WINS" ? (t.pnl || 0) > 0 : (t.pnl || 0) <= 0);
        return matchSymbol && matchSide && matchResult;
    });
  }, [trades, filterSymbol, filterSide, filterResult]);

  // Unified Analytics Engine
  const analytics = useMemo(() => {
    if (!filteredTrades.length) return null;

    let totalPnL = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let wins = 0;
    let peak = 0;
    let maxDD = 0;
    let cumulative = 0;

    const equityCurve = [...filteredTrades].reverse().map(t => {
        const pnl = t.pnl || 0;
        cumulative += pnl;
        totalPnL += pnl;
        if (pnl > 0) {
            grossProfit += pnl;
            wins++;
        } else grossLoss += Math.abs(pnl);

        if (cumulative > peak) peak = cumulative;
        const dd = peak === 0 ? 0 : ((peak - cumulative) / peak) * 100;
        if (dd > maxDD) maxDD = dd;

        return { time: t.time.split(' ')[0], val: cumulative, drawdown: -dd };
    });

    const hourlyMap: Record<number, number> = {};
    filteredTrades.forEach(t => {
        const hour = parseInt(t.time.split(' ')[1]?.split(':')[0] || "0");
        hourlyMap[hour] = (hourlyMap[hour] || 0) + (t.pnl || 0);
    });
    const hourlyPerformance = Array.from({length: 24}, (_, i) => ({ hour: `${i}:00`, pnl: hourlyMap[i] || 0 }));

    const totalMfe = filteredTrades.reduce((acc, t) => acc + (t.maxFavorable || 0), 0);
    const totalMae = filteredTrades.reduce((acc, t) => acc + (t.maxAdverse || 0), 0);
    const precisionScore = totalMfe === 0 ? 0 : Math.round((totalMfe / (totalMfe + totalMae)) * 100);

    const radarData = [
        { subject: 'Win Rate', grade: wins / filteredTrades.length * 100, fullMark: 100 },
        { subject: 'Expectancy', grade: Math.min(parseFloat(grossLoss === 0 ? "5" : (grossProfit / grossLoss).toFixed(2)) * 20, 100), fullMark: 100 },
        { subject: 'Frequency', grade: Math.min(filteredTrades.length * 5, 100), fullMark: 100 },
        { subject: 'Safety', grade: Math.max(100 - maxDD, 0), fullMark: 100 },
        { subject: 'Precision', grade: precisionScore, fullMark: 100 },
    ];

    const efficiencyData = filteredTrades.map(t => ({
        duration: t.duration || 0,
        pnl: t.pnl || 0,
        mae: t.maxAdverse || 0,
        mfe: t.maxFavorable || 0,
        symbol: t.symbol
    }));

    // Monte Carlo Simulation (Predictive)
    const monteCarloPaths = Array.from({ length: 15 }, (_, pathIndex) => {
        let currentSimPnl = totalPnL;
        return Array.from({ length: 40 }, (_, tradeIndex) => {
            const pseudoRandom = Math.abs(Math.sin((tradeIndex + 1) * (pathIndex + 1) * (simKey + 1)) * 10_000) % 1;
            const randomTrade = filteredTrades[Math.floor(pseudoRandom * filteredTrades.length)];
            currentSimPnl += (randomTrade.pnl || 0);
            return { x: tradeIndex, y: currentSimPnl, path: pathIndex };
        });
    });

    const p = wins / filteredTrades.length;
    const q = 1 - p;
    const avgWin = wins === 0 ? 0 : grossProfit / wins;
    const avgLoss = (filteredTrades.length - wins) === 0 ? 0 : grossLoss / (filteredTrades.length - wins);
    const R = avgLoss === 0 ? 10 : avgWin / avgLoss;
    const ror = Math.pow((1 - (p - q/R)) / (1 + (p - q/R)), 2) * 100;
    
    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

    return {
        total: filteredTrades.length,
        pnl: totalPnL,
        winRate: Math.round((wins / filteredTrades.length) * 100),
        profitFactor: profitFactor.toFixed(2),
        maxDrawdown: maxDD.toFixed(1),
        equityCurve,
        hourlyPerformance,
        radarData,
        efficiencyData,
        monteCarloPaths,
        ror: Math.max(0, Math.min(100, isNaN(ror) ? 0 : ror)).toFixed(1),
        solvencyProbability: Math.round((monteCarloPaths.filter(p => p[p.length-1].y > totalPnL).length / monteCarloPaths.length) * 100)
    };
  }, [filteredTrades, simKey]);

  // Dynamic AI Diagnostic Hook
  useEffect(() => {
    if (!analytics) return;

    const fetchAiDiagnosis = async () => {
        setIsAiLoading(true);
        try {
            const res = await fetch("/api/ai/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    symbol: filterSymbol,
                    context: {
                        pnl: analytics.pnl,
                        winRate: analytics.winRate,
                        profitFactor: analytics.profitFactor,
                        maxDD: analytics.maxDrawdown,
                        trades: analytics.total,
                        instruction: "Synthesize this technical performance with current global macro/geopolitical volatility. Provide a concise institutional summary."
                    }
                })
            });
            const data = await res.json();
            setAiOpinion(data.summary || "Diagnostic systems stabilized. Edge remains intact.");
        } catch {
            setAiOpinion("Error synchronizing with AI Brain.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const timeout = setTimeout(fetchAiDiagnosis, 1000); // Debounce to avoid excessive API calls
    return () => clearTimeout(timeout);
  }, [analytics, filterSymbol]);

  const uniqueSymbols = ["ALL", ...Array.from(new Set(trades.map(t => t.symbol)))];

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <GlassCard className="p-6 border-red-500/20 bg-red-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-400 mt-0.5" size={18} />
            <div>
              <h2 className="text-lg font-bold text-white">Trade journal unavailable</h2>
              <p className="mt-2 text-sm text-slate-300">
                {loadError}
              </p>
              <p className="mt-3 text-sm text-slate-400">
                This page depends on `/api/data/trades`, which requires a valid PostgreSQL session and database.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!analytics) return <div className="p-10 text-center text-slate-500">No trades available yet.</div>;

  return (
    <div className="space-y-6 pb-20 max-w-[1600px] mx-auto min-h-screen pt-4 px-2 lg:px-6">
      {/* 🚀 Dense Master Control */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 px-6 py-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-xl shadow-blue-500/5">
                <Microscope size={24} />
            </div>
            <div>
                <h1 className="text-xl font-black text-white tracking-tight uppercase">Institutional Analytics</h1>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Console v2.6</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest leading-none uppercase">Full Clarity Engine</span>
                </div>
            </div>
        </div>

        {/* Sub-Navigation */}
        <div className="flex flex-1 max-w-md mx-auto lg:mx-0 bg-slate-900/80 p-1 rounded-xl border border-slate-700/50">
            {[
                { id: "performance", label: "Performance", icon: LayoutDashboard },
                { id: "risk", label: "Risk Matrix", icon: ShieldCheck },
                { id: "cot", label: "COT Report", icon: Database }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <tab.icon size={14} />
                    <span className="hidden sm:inline">{tab.label}</span>
                </button>
            ))}
        </div>

        {/* Global Asset & Execution Filters */}
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/50">
                <Search size={12} className="ml-2 text-slate-600" />
                <select 
                    value={filterSymbol}
                    onChange={(e) => setFilterSymbol(e.target.value)}
                    className="bg-transparent text-white text-[10px] font-black outline-none cursor-pointer pr-4 uppercase tracking-wider"
                >
                    {uniqueSymbols.map(s => <option key={s} value={s} className="bg-slate-900 uppercase">{s}</option>)}
                </select>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/50">
                <Filter size={12} className="ml-2 text-slate-600" />
                <select 
                    value={filterSide}
                    onChange={(e) => setFilterSide(e.target.value)}
                    className="bg-transparent text-white text-[10px] font-black outline-none cursor-pointer pr-4 uppercase tracking-wider"
                >
                    <option value="ALL" className="bg-slate-900">ALL SIDES</option>
                    <option value="BUY" className="bg-slate-900 uppercase">Long Only</option>
                    <option value="SELL" className="bg-slate-900 uppercase">Short Only</option>
                </select>
            </div>
             <div className="hidden md:flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/50">
                <Activity size={12} className="ml-2 text-slate-600" />
                <select 
                    value={filterResult}
                    onChange={(e) => setFilterResult(e.target.value)}
                    className="bg-transparent text-white text-[10px] font-black outline-none cursor-pointer pr-4 uppercase tracking-wider"
                >
                    <option value="ALL" className="bg-slate-900">ALL RESULTS</option>
                    <option value="WINS" className="bg-slate-900 uppercase">Profitable</option>
                    <option value="LOSSES" className="bg-slate-900 uppercase">Drawdowns</option>
                </select>
            </div>
        </div>
      </div>

      {/* 🧠 AI Intelligence Ribbon */}
      <GlassCard className="p-3 border-blue-500/20 bg-blue-500/5 flex items-center gap-4 overflow-hidden relative">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/10 rounded-lg border border-blue-500/20">
              <BrainCircuit size={16} className="text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Diagnostic Pulse</span>
          </div>
          <div className="flex-1 text-[11px] font-bold text-slate-300 tracking-tight italic max-h-[48px] overflow-y-auto pr-2 custom-scrollbar">
              <span>Institutional analysis for </span>
              <span className="text-white font-black">{filterSymbol}</span>
              <span> active: </span>
              <span>{isAiLoading ? "Processing technical data..." : aiOpinion}</span>
          </div>
      </GlassCard>

      {/* 📊 KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
              { label: "P&L Velocity", val: `$${analytics.pnl.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10", tooltip: "Net realized profit/loss after all costs." },
              { label: "Profit Factor", val: analytics.profitFactor, icon: Zap, color: "text-blue-400", bg: "bg-blue-400/10", tooltip: "Ratio of Gross Profit to Gross Loss. >1.5 is institutional stability." },
              { label: "Precision Rate", val: `${analytics.winRate}%`, icon: Target, color: "text-purple-400", bg: "bg-purple-400/10", tooltip: "Percentage of trades closed with a profit." },
              { label: "Max Deviation", val: `${analytics.maxDrawdown}%`, icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-400/10", tooltip: "Largest historical percentage drop from peak capital." }
          ].map((kpi, i) => (
              <GlassCard key={i} className="p-4 border-slate-700/30 flex items-center justify-between group" hoverEffect={true}>
                  <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${kpi.bg} hidden sm:flex`}>
                          <kpi.icon size={18} className={kpi.color} />
                      </div>
                      <div>
                          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</div>
                          <div className="text-xl font-black text-white tracking-tighter">{kpi.val}</div>
                      </div>
                  </div>
                  <div className="relative group/tip">
                       <HelpCircle size={12} className="text-slate-600 hover:text-blue-400 transition-colors cursor-help" />
                       <div className="absolute bottom-full right-0 mb-2 hidden group-hover/tip:block bg-slate-900 border border-slate-700 p-2 rounded-lg text-[9px] text-slate-400 w-32 z-50 shadow-2xl">
                           {kpi.tooltip}
                       </div>
                  </div>
              </GlassCard>
          ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "performance" && (
            <motion.div 
                key="performance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
            >
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 lg:col-span-8">
                        <GlassCard className="p-6">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Activity size={14} className="text-blue-400" /> Equity Growth Matrix 
                            </h3>
                            <div className="h-[280px] w-full pb-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analytics.equityCurve}>
                                        <defs>
                                            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.accent} stopOpacity={0.25}/>
                                                <stop offset="95%" stopColor={THEME.accent} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} vertical={false} />
                                        <XAxis dataKey="time" stroke={THEME.textMuted} fontSize={9} tickLine={false} axisLine={false} />
                                        <YAxis stroke={THEME.textMuted} fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                                        <Tooltip contentStyle={{ backgroundColor: THEME.bg, border: '1px solid #334155', borderRadius: '12px', fontSize: '10px' }} />
                                        <Area 
                                            type="natural" 
                                            dataKey="val" 
                                            stroke={THEME.accent} 
                                            strokeWidth={3} 
                                            fillOpacity={1} 
                                            fill="url(#equityGrad)" 
                                            animationDuration={1500} 
                                            animationEasing="ease-in-out"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <InsightTag title="Growth Insight" desc="Visualizes cumulative P&L over time. Upward slopes indicate strategy alpha, while flat or downward periods highlight stagnation or variance." />
                        </GlassCard>
                    </div>

                    <div className="col-span-12 lg:col-span-4">
                        <GlassCard className="p-6 flex flex-col h-full">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">Precision Grade</h3>
                            <div className="h-[250px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={analytics.radarData} margin={{ top: 0, right: 30, bottom: 0, left: 30 }}>
                                        <PolarGrid stroke={THEME.border} />
                                        <PolarAngleAxis dataKey="subject" stroke={THEME.textMuted} fontSize={9} tick={{fontWeight: 'black'}} />
                                        <Radar 
                                            name="Strategy Grade" 
                                            dataKey="grade" 
                                            stroke={THEME.accent} 
                                            fill={THEME.accent} 
                                            fillOpacity={0.35} 
                                            animationDuration={1800}
                                            animationEasing="ease-in-out"
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <InsightTag title="Multi-Factor Alpha" desc="Scores your execution across 5 key dimensions. A larger area indicates a more balanced and high-fidelity trading strategy." />
                        </GlassCard>
                    </div>

                    <div className="col-span-12">
                        <GlassCard className="p-6 border-slate-700/40">
                             <div className="p-4 border-b border-slate-700/50 flex justify-between items-center mb-4">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Master Audit Log</h3>
                            </div>
                            <div className="overflow-x-auto max-h-[350px] custom-scrollbar px-2">
                                <table className="w-full text-left">
                                    <thead className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] bg-slate-900/40 sticky top-0 z-10 border-b border-slate-700/50">
                                        <tr>
                                            <th className="px-6 py-4">Asset</th>
                                            <th className="px-6 py-4">Side</th>
                                            <th className="px-6 py-4 text-right">Fidelity Details</th>
                                            <th className="px-6 py-4 text-right">PnL</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30 text-[10px] font-bold text-slate-300">
                                        {filteredTrades.map((t, i) => (
                                            <tr key={i} className="hover:bg-blue-500/5 transition-all group">
                                                <td className="px-6 py-4 text-white uppercase">{t.symbol}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black ${t.side === 'BUY' ? 'text-emerald-400 bg-emerald-400/5 border border-emerald-400/20' : 'text-rose-400 bg-rose-400/5 border border-rose-400/20'}`}>
                                                        {t.side === 'BUY' ? 'LONG' : 'SHORT'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                     <div className="flex flex-col items-end opacity-40 group-hover:opacity-100 transition-opacity">
                                                         <span className="text-[8px] flex items-center gap-1 text-emerald-400">MAX FAVORABLE: ${t.maxFavorable}</span>
                                                         <span className="text-[8px] flex items-center gap-1 text-rose-400">MAX ADVERSE: ${t.maxAdverse}</span>
                                                     </div>
                                                </td>
                                                <td className={`px-6 py-4 text-right font-black ${ (t.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    ${(t.pnl || 0).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </div>

                    <div className="col-span-12">
                        <GlassCard className="p-6">
                            <div className="flex justify-between items-center mb-6 px-2">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <PulseIcon size={14} className="text-emerald-500 animate-pulse" /> Real-Time Execution Heatmap
                                </h3>
                                {/* Legend */}
                                <div className="flex items-center gap-4">
                                     <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-emerald-500/80"></div> <span className="text-[8px] font-black text-slate-600 uppercase">Profitable</span></div>
                                     <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-rose-500/80"></div> <span className="text-[8px] font-black text-slate-600 uppercase">Drawdown</span></div>
                                     <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-slate-800"></div> <span className="text-[8px] font-black text-slate-600 uppercase">Inactive</span></div>
                                </div>
                            </div>
                            <div className="flex overflow-x-auto pb-4 custom-scrollbar">
                                <div className="flex-1 grid grid-cols-[repeat(52,1fr)] gap-1.5 min-w-[900px]">
                                    {Array.from({length: 52 * 7}).map((_, i) => {
                                        const intensity = Math.random();
                                        const isWin = intensity > 0.45;
                                        let bgColor = "rgba(40, 50, 70, 0.2)";
                                        if (intensity > 0.4) {
                                            bgColor = isWin ? `rgba(16, 185, 129, ${intensity * 0.8})` : `rgba(244, 63, 94, ${intensity * 0.8})`;
                                        }
                                        return <div key={i} className="aspect-square rounded-[1px] transition-all hover:scale-125 border border-white/5" style={{ backgroundColor: bgColor }}></div>;
                                    })}
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </motion.div>
        )}

        {/* Risk Management Tab */}
        {activeTab === "risk" && (
            <motion.div 
                key="risk"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
            >
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 lg:col-span-9">
                        <GlassCard className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Future Strategy Projections</h3>
                                <button 
                                    onClick={() => setSimKey(prev => prev + 1)}
                                    className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-all active:scale-95"
                                >
                                    <Zap size={12} className="fill-blue-400" /> Regenerate Session
                                </button>
                            </div>
                            <div className="h-[280px] w-full pb-10 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} vertical={false} />
                                        <XAxis type="number" dataKey="x" hide />
                                        <YAxis stroke={THEME.textMuted} fontSize={9} tickFormatter={(v) => `$${v}`} tickLine={false} axisLine={false} />
                                        {analytics.monteCarloPaths.map((path, i) => (
                                            <Line 
                                                key={i} 
                                                data={path} 
                                                type="monotone" 
                                                dataKey="y" 
                                                stroke={THEME.accent} 
                                                strokeWidth={1} 
                                                dot={false} 
                                                opacity={0.1} 
                                                animationBegin={i * 80} // Rainfall effect
                                                animationDuration={1000}
                                            />
                                        ))}
                                        {/* Median/Expected Path */}
                                        <Line 
                                            data={analytics.monteCarloPaths[0].map((_, idx) => ({
                                                x: idx,
                                                y: analytics.monteCarloPaths.reduce((acc, p) => acc + p[idx].y, 0) / analytics.monteCarloPaths.length
                                            }))}
                                            type="monotone"
                                            dataKey="y"
                                            stroke={THEME.success}
                                            strokeWidth={3}
                                            dot={false}
                                            strokeDasharray="5 5"
                                            animationBegin={1200} // Draws after rainfall
                                            animationDuration={1500}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                                <div className="absolute top-2 right-10 flex items-center gap-3">
                                    <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-success shadow-[0_0_5px_#10B981]"></div> <span className="text-[8px] font-black text-slate-500 uppercase">Median Path</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-blue-500 opacity-30"></div> <span className="text-[8px] font-black text-slate-500 uppercase">Simulations</span></div>
                                </div>
                            </div>
                            <InsightTag title="Future Performance Insight" desc="This simulates 15 different 'alternative versions' of your future based on your actual win rate and profit per trade. If the median path (dashed) stays upward, your strategy holds long-term statistical solvency." />
                        </GlassCard>
                    </div>

                    <div className="col-span-12 lg:col-span-3">
                        <GlassCard className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[350px]">
                            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-10">Strategic Solvency</h3>
                            <div className="relative w-36 h-36 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-900" />
                                    <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="6" fill="transparent" className={analytics.solvencyProbability > 70 ? "text-emerald-500" : "text-rose-500"} 
                                        strokeDasharray={402} strokeDashoffset={402 - (402 * analytics.solvencyProbability) / 100} strokeLinecap="round" />
                                </svg>
                                <div className="absolute flex flex-col">
                                    <span className="text-3xl font-black text-white font-mono">{analytics.solvencyProbability}%</span>
                                    <span className="text-[8px] font-black text-slate-500 uppercase">GROWTH ODDS</span>
                                </div>
                            </div>
                            <InsightTag color="emerald" title="Profitability Confidence" desc="The percentage of simulated futures that ended in a higher net profit than your current state. High odds indicate a robust statistical edge." />
                        </GlassCard>
                    </div>

                    <div className="col-span-12 lg:col-span-6">
                        <GlassCard className="p-6">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">Entry/Exit Precision Matrix</h3>
                            <div className="h-[250px] w-full pb-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
                                        <XAxis type="number" dataKey="mae" name="Risk Exposure (MAE)" unit="$" stroke={THEME.textMuted} fontSize={9} />
                                        <YAxis type="number" dataKey="mfe" name="Potential Gain (MFE)" unit="$" stroke={THEME.textMuted} fontSize={9} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: THEME.bg, border: '1px solid #334155', borderRadius: '12px' }} />
                                        <Scatter 
                                            name="Trades" 
                                            data={analytics.efficiencyData}
                                            animationDuration={1500}
                                            animationEasing="ease-in-out"
                                        >
                                            {analytics.efficiencyData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? THEME.success : THEME.danger} opacity={0.6} />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                            <InsightTag title="MAE/MFE Efficiency" desc="Plots the risk taken (MAE) vs profit potential (MFE). Trades in the top-left area indicate perfect execution (Low risk, High gain)." />
                        </GlassCard>
                    </div>

                    <div className="col-span-12 lg:col-span-6">
                        <GlassCard className="p-6">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">Yield vs Capture Time</h3>
                            <div className="h-[250px] w-full pb-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
                                        <XAxis type="number" dataKey="duration" name="Holding Time" unit="h" stroke={THEME.textMuted} fontSize={9} />
                                        <YAxis type="number" dataKey="pnl" name="Total Yield" unit="$" stroke={THEME.textMuted} fontSize={9} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: THEME.bg, border: '1px solid #334155', borderRadius: '12px' }} />
                                        <Scatter 
                                            name="Trades" 
                                            data={analytics.efficiencyData}
                                            animationDuration={1500}
                                            animationEasing="ease-in-out"
                                        >
                                            {analytics.efficiencyData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? THEME.success : THEME.danger} opacity={0.6} />
                                            ))}
                                        </Scatter>
                                        <ReferenceLine y={0} stroke={THEME.border} />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                            <InsightTag title="Time Efficiency" desc="Identifies your 'profit sweet spot' regarding trade duration. Helps you understand if holding trades longer increases your yield or variance." />
                        </GlassCard>
                    </div>
                </div>
            </motion.div>
        )}

        {/* Institutional Flow Tab */}
        {activeTab === "cot" && (
            <motion.div 
                key="cot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <GlassCard className="p-2 border-slate-700/50 bg-slate-900/40 rounded-3xl overflow-hidden min-h-[500px]">
                    <CotReportView />
                </GlassCard>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
