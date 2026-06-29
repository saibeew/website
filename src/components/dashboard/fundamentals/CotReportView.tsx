import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, TrendingDown, TrendingUp, Maximize2, X, Info } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { useState } from "react";

// Professional FinTech Palette (Sync with Journal)
const THEME = {
    bg: "#0F172A",
    accent: "#3B82F6",
    success: "#10B981",
    danger: "#EF4444",
    textMuted: "#94A3B8",
    border: "#334155",
    grid: "rgba(148, 163, 184, 0.05)"
};

// ... (ASSET_DATA, INSIGHTS, REPORT_EXPLANATIONS remain unchanged) ...
const ASSET_DATA: Record<string, any[]> = {
  'XAUUSD': [
    { week: 'W-7', long: 4000, short: 2400, net: 1600 },
    { week: 'W-6', long: 3000, short: 1398, net: 1602 },
    { week: 'W-5', long: 2000, short: 5800, net: -3800 },
    { week: 'W-4', long: 2780, short: 3908, net: -1128 },
    { week: 'W-3', long: 1890, short: 4800, net: -2910 },
    { week: 'W-2', long: 2390, short: 3800, net: -1410 },
    { week: 'W-1', long: 3490, short: 4300, net: -810 },
    { week: 'Now', long: 4100, short: 3900, net: 200 },
  ],
  'EURUSD': [
    { week: 'W-7', long: 5000, short: 5000, net: 0 },
    { week: 'W-6', long: 5200, short: 4800, net: 400 },
    { week: 'W-5', long: 5500, short: 4500, net: 1000 },
    { week: 'W-4', long: 5100, short: 4900, net: 200 },
    { week: 'W-3', long: 4800, short: 5400, net: -600 },
    { week: 'W-2', long: 4600, short: 5800, net: -1200 },
    { week: 'Now', long: 4500, short: 6000, net: -1500 },
  ],
  'BTCUSD': [
     { week: 'W-7', long: 1000, short: 800, net: 200 },
     { week: 'W-6', long: 1200, short: 700, net: 500 },
     { week: 'W-5', long: 1500, short: 600, net: 900 },
     { week: 'W-4', long: 1800, short: 500, net: 1300 },
     { week: 'W-3', long: 2200, short: 400, net: 1800 },
     { week: 'W-2', long: 2500, short: 300, net: 2200 },
     { week: 'Now', long: 3000, short: 200, net: 2800 },
  ],
  'SPX500': [
     { week: 'W-7', long: 8000, short: 2000, net: 6000 },
     { week: 'W-6', long: 8100, short: 1900, net: 6200 },
     { week: 'W-5', long: 8050, short: 2100, net: 5950 },
     { week: 'W-4', long: 7900, short: 2500, net: 5400 },
     { week: 'W-3', long: 7800, short: 2800, net: 5000 },
     { week: 'W-2', long: 8200, short: 1800, net: 6400 },
     { week: 'Now', long: 8500, short: 1500, net: 7000 },
  ]
};

const INSIGHTS: Record<string, string> = {
    'XAUUSD': "Investors flipped NET LONG (+200 contracts). Accumulation signals correction end.",
    'EURUSD': "Commercials adding shorts (-1500 net). Bearish pressure building.",
    'BTCUSD': "Record High Net Longs (+2800). Extreme institutional demand surge.",
    'SPX500': "Net Longs near yearly highs. Buy the Dip strategy remains dominant."
};

const REPORT_EXPLANATIONS: Record<string, string> = {
    'XAUUSD': "Non-Commercial (Managed Money) flip to Net Long often precedes a sustained rally.",
    'EURUSD': "Net Short buildup suggests hedging against economic weakness or Euro depreciation.",
    'BTCUSD': "CME Futures Net Long is bullish but watch for 'overcrowded trade' extremes.",
    'SPX500': "High Speculative Longs often act as contrarian indicators at extreme cycles."
};

export default function CotReportView() {
  const [selectedAsset, setSelectedAsset] = useState('XAUUSD');
  const [isMaximized, setIsMaximized] = useState(false);
  
  const currentData = ASSET_DATA[selectedAsset] || ASSET_DATA['XAUUSD'];
  const currentInsight = INSIGHTS[selectedAsset];
  const currentExplanation = REPORT_EXPLANATIONS[selectedAsset];

  const lastPoint = currentData[currentData.length - 1];
  const total = lastPoint.long + lastPoint.short;
  const longPct = Math.round((lastPoint.long / total) * 100);
  const shortPct = 100 - longPct;

  const ChartComponent = ({ height = 300 }: { height?: number }) => (
    <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentData}>
                <defs>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={THEME.accent} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={THEME.accent} stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} vertical={false} />
                <XAxis dataKey="week" stroke={THEME.textMuted} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={THEME.textMuted} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: THEME.bg, borderColor: THEME.border, borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="net" stroke={THEME.accent} strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" animationDuration={1000} />
                <ReferenceLine y={0} stroke={THEME.border} />
            </AreaChart>
        </ResponsiveContainer>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6 bg-slate-900/40 min-h-[500px]">
      {/* 🚀 Dense Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/30 pb-4">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-blue-500/10 rounded-lg"><BarChart3 size={18} className="text-blue-400" /></div>
           <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Institutional COT</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">CFTC Weekly Audit</p>
           </div>
        </div>
        <div className="flex flex-wrap gap-1.5 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
            {['XAUUSD', 'EURUSD', 'BTCUSD', 'SPX500'].map(asset => (
                <button 
                    key={asset} 
                    onClick={() => setSelectedAsset(asset)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                        selectedAsset === asset 
                        ? "bg-blue-600 text-white shadow-lg" 
                        : "text-slate-500 hover:text-white"
                    }`}
                >
                    {asset}
                </button>
            ))}
        </div>
      </div>

      {/* 📊 Horizontal Quick Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black text-emerald-400 uppercase">Long Exposure</span>
                  <span className="text-sm font-black text-white">{longPct}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" style={{ width: `${longPct}%` }}></div>
              </div>
          </div>
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black text-rose-400 uppercase">Short Exposure</span>
                  <span className="text-sm font-black text-white">{shortPct}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" style={{ width: `${shortPct}%` }}></div>
              </div>
          </div>
          <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/20 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg"><Info size={14} className="text-blue-400" /></div>
              <div>
                  <div className="text-[9px] font-black text-blue-400 uppercase">Trend Bias</div>
                  <div className="text-xs font-black text-white uppercase">{lastPoint.net > 0 ? "BULLISH" : "BEARISH"}</div>
              </div>
          </div>
      </div>

      {/* 📈 Chart & Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
           {/* Chart Area */}
           <div className="lg:col-span-2 bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 relative group">
               <div className="flex justify-between items-center mb-6">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Net Positioning Over Time</h3>
                   <button 
                        onClick={() => setIsMaximized(true)}
                        className="p-1.5 bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                   >
                       <Maximize2 size={12} />
                   </button>
               </div>
               <ChartComponent height={220} />
           </div>

           {/* Insights Card */}
           <div className="flex flex-col gap-4">
                <div className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <TrendingUp size={12} /> Smart Money Insight
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                        {currentInsight}
                    </p>
                </div>
                <div className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <BarChart3 size={12} /> Institutional Thesis
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed italic">
                        {currentExplanation}
                    </p>
                </div>
           </div>
      </div>

      {/* 🔍 Maximize Modal */}
      <AnimatePresence>
        {isMaximized && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 lg:p-12"
            >
                <div className="w-full max-w-6xl bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur-md">
                        <div>
                            <h2 className="text-xl font-black text-white">{selectedAsset} Institutional Flow</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Full-Scale Positioning Matrix</p>
                        </div>
                        <button 
                            onClick={() => setIsMaximized(false)}
                            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 hover:text-white transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-8 bg-slate-950/20">
                        <ChartComponent height={500} />
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                                <h4 className="text-[10px] font-black text-blue-400 uppercase mb-2">Long-Term Thesis</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">{currentExplanation}</p>
                            </div>
                            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl md:col-span-2">
                                <h4 className="text-[10px] font-black text-emerald-400 uppercase mb-2">Alpha Observation</h4>
                                <p className="text-sm text-white font-bold">{currentInsight}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
