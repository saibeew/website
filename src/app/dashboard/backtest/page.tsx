"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Upload, 
  Settings, 
  TrendingUp, 
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

function detectPlatformFromFile(fileName: string): "mt4" | "mt5" | null {
  const extension = fileName.toLowerCase().split(".").pop();
  if (extension === "ex4" || extension === "mq4") return "mt4";
  if (extension === "ex5" || extension === "mq5") return "mt5";
  return null;
}

export default function BacktestPage() {
  const [platform, setPlatform] = useState<"mt4" | "mt5">("mt5");
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState("");

  const [eaName, setEaName] = useState("MACD Sample");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [symbol, setSymbol] = useState("EURUSD");
  const [timeframe, setTimeframe] = useState("H1");
  const [dateFrom, setDateFrom] = useState("2023-01-01");
  const [dateTo, setDateTo] = useState("2023-12-31");
  const [deposit, setDeposit] = useState("10000");
  const [leverage, setLeverage] = useState("1:100");

  const [backtests, setBacktests] = useState<Array<{ id: string; created_at: string; symbol: string; status: string; config?: { eaName?: string } }>>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const response = await fetch("/api/data/backtests");
      if (!response.ok) return;
      const data = await response.json();
      setBacktests(data.backtests || []);
    };
    fetchHistory();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const detectedPlatform = detectPlatformFromFile(file.name);
        if (!detectedPlatform) {
          setError("Upload a valid MT4/MT5 Expert Advisor: .ex4, .mq4, .ex5, or .mq5.");
          e.target.value = "";
          return;
        }
        setSelectedFile(file);
        setPlatform(detectedPlatform);
        setError("");
        setEaName(file.name.replace(/\.(ex4|ex5|mq4|mq5)$/i, ""));
    }
  };

  const handleStartBacktest = async () => {
    setIsSimulating(true);
    setError("");
    
    try {
        const formData = new FormData();
        formData.append('platform', platform);
        formData.append('symbol', symbol);
        formData.append('timeframe', timeframe);
        formData.append('dateFrom', dateFrom);
        formData.append('dateTo', dateTo);
        formData.append('deposit', deposit);
        formData.append('leverage', leverage);
        
        if (selectedFile) {
            formData.append('eaFile', selectedFile);
        } else {
             formData.append('eaName', eaName);
        }

        const response = await fetch('/api/backtest/run', {
            method: 'POST',
            body: formData, // Send as FormData
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || "Failed to start backtest");
        }

        alert(data.message);

    } catch (err) {
        setError(err instanceof Error ? err.message : "Backtest request failed");
    } finally {
        setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          Backtesting Hub
        </h1>
        <p className="text-text-muted mt-2">
          Validate your strategies with high-precision historical simulations using MetaTrader engines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Configuration */}
        <div className="lg:col-span-2 space-y-8">
            
          {/* Platform Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPlatform("mt4")}
              className={cn(
                "relative group p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3",
                platform === "mt4" 
                  ? "bg-primary/10 border-primary shadow-[0_0_30px_-10px_var(--primary)]" 
                  : "bg-surface-light border-white/5 hover:border-white/10 hover:bg-white/5"
              )}
            >
              <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-transform duration-300 group-hover:scale-110",
                  platform === "mt4" ? "bg-primary text-black" : "bg-white/10 text-white"
              )}>
                4
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-white">MetaTrader 4</h3>
                <p className="text-xs text-text-muted mt-1">Legacy MQL4 Engine</p>
              </div>
            </button>

            <button
              onClick={() => setPlatform("mt5")}
              className={cn(
                "relative group p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3",
                platform === "mt5" 
                  ? "bg-secondary/10 border-secondary shadow-[0_0_30px_-10px_var(--secondary)]" 
                  : "bg-surface-light border-white/5 hover:border-white/10 hover:bg-white/5"
              )}
            >
              <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-transform duration-300 group-hover:scale-110",
                  platform === "mt5" ? "bg-secondary text-black" : "bg-white/10 text-white"
              )}>
                5
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-white">MetaTrader 5</h3>
                <p className="text-xs text-text-muted mt-1">Multi-Asset MQL5 Engine</p>
              </div>
            </button>
          </div>

          {/* Settings Form */}
          <div className="bg-surface-light border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Settings size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Simulation Parameters</h3>
                    <p className="text-sm text-text-muted">Configure the environment for {platform === 'mt4' ? 'MT4' : 'MT5'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-muted">Symbol</label>
                    <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors">
                        <option>EURUSD</option>
                        <option>GBPUSD</option>
                        <option>XAUUSD</option>
                        <option>BTCUSD</option>
                        <option>US30</option>
                    </select>
                </div>
                <div className="space-y-2">
                     <label className="text-sm font-medium text-text-muted">Timeframe</label>
                    <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors">
                        <option value="H1">H1 (1 Hour)</option>
                        <option value="M15">M15 (15 Minutes)</option>
                        <option value="M5">M5 (5 Minutes)</option>
                        <option value="H4">H4 (4 Hours)</option>
                        <option value="D1">D1 (Daily)</option>
                    </select>
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-muted">Start Date</label>
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors" />
                </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-text-muted">End Date</label>
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors" />
                </div>

                <div className="space-y-2">
                     <label className="text-sm font-medium text-text-muted">Initial Deposit ($)</label>
                    <input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors" />
                </div>
                <div className="space-y-2">
                     <label className="text-sm font-medium text-text-muted">Leverage</label>
                    <select value={leverage} onChange={(e) => setLeverage(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors">
                        <option>1:100</option>
                        <option>1:500</option>
                        <option>1:30</option>
                        <option>1:1000</option>
                    </select>
                </div>
            </div>

            <div className="pt-4 border-t border-white/5">
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept=".ex4,.mq4,.ex5,.mq5"
                    onChange={handleFileSelect}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-white/40 rounded-xl py-4 transition-all group"
                >
                    <Upload className="text-text-muted group-hover:text-white transition-colors" size={20} />
                    <span className="text-sm font-medium text-text-muted group-hover:text-white transition-colors">
                        {eaName === "MACD Sample" 
                            ? "Upload Expert Advisor (.ex4, .mq4, .ex5, .mq5)"
                            : `Selected: ${eaName}`
                        }
                    </span>
                </button>
                <p className="text-[10px] text-center text-text-muted mt-2 opacity-60">
                    *Uploaded EA will be detected and installed into the matching MT4 or MT5 Experts folder.
                </p>
            </div>
          </div>
        </div>

            {/* Right Col: Actions & Status */}
        <div className="space-y-6">
            <div className="bg-surface-light border border-white/5 rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-4">Actions</h3>
                <p className="text-[10px] text-text-muted mb-3">
                    MT5 visual testing requires `MT5_TERMINAL_EXE` and `MT5_DATA_PATH` if you want the EA to be copied into the correct terminal folder.
                </p>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                        {error}
                    </div>
                )}
                
                <button
                    onClick={handleStartBacktest} 
                    disabled={isSimulating}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                >
                    {isSimulating ? (
                        <>
                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            <span>Launching Terminal...</span>
                        </>
                    ) : (
                        <>
                            <Play size={20} fill="currentColor" />
                            <span>Start Visual Backtest</span>
                        </>
                    )}
                </button>
                <p className="text-[10px] text-center text-text-muted mt-2 opacity-60">
                    *Will open the matching MetaTrader terminal and run the EA on the selected chart.
                </p>
            </div>


            {/* History List */}
            <div className="bg-surface-light border border-white/5 rounded-2xl p-6 space-y-4">
                 <h3 className="font-semibold text-white flex items-center gap-2">
                    <TrendingUp size={16} className="text-green-400" />
                    Recent Runs ({backtests.length})
                </h3>
                 
                 {backtests.length === 0 ? (
                    <p className="text-sm text-text-muted">No runs yet.</p>
                 ) : (
                     <div className="space-y-3">
                        {backtests.map((run) => (
                            <div key={run.id} className="p-3 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center">
                                <div>
                                    <div className="text-sm font-medium text-white">{run.config?.eaName || "Unknown Strategy"}</div>
                                    <div className="text-xs text-text-muted">{new Date(run.created_at).toLocaleDateString()} • {run.symbol}</div>
                                </div>
                                <div className={`text-xs px-2 py-1 rounded ${
                                    run.status === 'completed' ? 'bg-green-500/20 text-green-400' : run.status === 'failed' ? 'bg-red-500/20 text-red-400' : run.status === 'running' || run.status === 'processing' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-300'
                                }`}>
                                    {run.status}
                                </div>
                            </div>
                        ))}
                     </div>
                 )}

                 <p className="mt-2 text-center text-xs text-text-muted">Detailed reports appear after verified worker completion.</p>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5">
                <div className="flex gap-3">
                    <Cpu className="text-blue-400 shrink-0" size={20} />
                    <div>
                        <h4 className="text-sm font-medium text-blue-100">Private worker required</h4>
                        <p className="text-xs text-blue-200/60 mt-1">
                            This web preview queues jobs but does not bundle MetaTrader terminals or optimization agents.
                        </p>
                    </div>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}
