"use client";

import { useState, useRef, useEffect } from "react";
import { Strategy, useStore } from "@/store/useStore";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { cn } from "@/lib/utils";
import { 
  Plus, 
  Copy, 
  Play, 
  Upload, 
  Settings, 
  TrendingUp, 
  Cpu, 
  Layers,
  Activity,
  Trash2
} from "lucide-react";

const TEMPLATES: Strategy[] = [
  { name: "BTC Momentum v3", roi: null, risk: "High", pairs: "BTC/USDT" },
  { name: "ETH Mean Reversion", roi: null, risk: "Medium", pairs: "ETH/USDT" },
  { name: "Stable Arbitrage", roi: null, risk: "Low", pairs: "USDT/USDC" },
  { name: "SOL Breakout", roi: null, risk: "High", pairs: "SOL/USD" },
];

import DeploymentModal, { DeploymentConfig } from "@/components/dashboard/DeploymentModal";

interface BacktestRun {
  id: string;
  created_at: string;
  symbol: string;
  status: string;
  config?: { eaName?: string };
  worker_id?: string | null;
}

function backtestStatusClass(status: string) {
  if (status === "completed") return "bg-green-500/20 text-green-400";
  if (status === "processing" || status === "running") return "bg-blue-500/20 text-blue-400";
  if (status === "failed") return "bg-red-500/20 text-red-400";
  return "bg-amber-500/20 text-amber-300";
}

function detectPlatformFromFile(fileName: string): "mt4" | "mt5" | null {
  const extension = fileName.toLowerCase().split(".").pop();
  if (extension === "ex4" || extension === "mq4") return "mt4";
  if (extension === "ex5" || extension === "mq5") return "mt5";
  return null;
}

export default function StrategyLab() {
  const { strategies, fetchStrategies, createStrategy, cloneStrategy, deleteStrategy, addNotification } = useStore();
  const [activeTab, setActiveTab] = useState<'library' | 'backtest'>('library');
  const [loadingStrategies, setLoadingStrategies] = useState(true);
  const [loadingBacktests, setLoadingBacktests] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Deployment Modal State
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [selectedStrategyForDeploy, setSelectedStrategyForDeploy] = useState("");

  const handleOpenDeploy = (name: string) => {
    setSelectedStrategyForDeploy(name);
    setIsDeployOpen(true);
  };

  const handleClone = async (strategy: Strategy) => {
    const success = await cloneStrategy(strategy);
    if (success) {
        addNotification({
            title: "Strategy Cloned",
            message: `${strategy.name} has been added to your library.`,
            type: "success"
        });
    }
  };

  const { deployStrategy } = useStore();

  const handleDeploy = async (config: DeploymentConfig) => {
    console.log("Deploying with config:", config);
    try {
        const res = await fetch('/api/trade/deploy', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...config, strategy: selectedStrategyForDeploy })
        });
        const data = await res.json();
        if (data.success) {
            deployStrategy(data.deployment);
            addNotification({
                title: "Strategy Deployed",
                message: `${selectedStrategyForDeploy} is prepared on ${config.platform.toUpperCase()} ${config.symbol} ${config.timeframe}.`,
                type: "success"
            });
            alert(`🚀 Strategy Deployed Successfully!\nRouting to Live Terminal...`);
        } else {
            alert("Deployment Failed: " + data.error);
        }
    } catch {
        alert("System Error during deployment.");
    }
  };
  
  // Backtest State
  const [platform, setPlatform] = useState<"mt4" | "mt5">("mt5");
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState("");
  const [eaName, setEaName] = useState("MACD Sample");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [backtests, setBacktests] = useState<BacktestRun[]>([]);
  const [symbol, setSymbol] = useState("EURUSD");
  const [timeframe, setTimeframe] = useState("H1");
  const [dateFrom, setDateFrom] = useState("2023-01-01");
  const [dateTo, setDateTo] = useState("2023-12-31");
  const [deposit, setDeposit] = useState("10000");
  const [leverage, setLeverage] = useState("1:100");

  // Load Data
  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoadError(null);
      setLoadingStrategies(true);
      setLoadingBacktests(true);

      try {
        await fetchStrategies();
      } catch (error) {
        if (alive) setLoadError(error instanceof Error ? error.message : "Unable to load strategies.");
      } finally {
        if (alive) setLoadingStrategies(false);
      }

      try {
        await fetchHistory();
      } finally {
        if (alive) setLoadingBacktests(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [fetchStrategies]);

  const fetchHistory = async () => {
    const response = await fetch("/api/data/backtests");
    if (!response.ok) return;
    const data = await response.json();
    setBacktests(data.backtests || []);
  };

  // Strategy Handlers
  const handleCreate = async () => {
      const name = prompt("Enter strategy name:");
      if (name) {
          await createStrategy(name, "Medium", "Custom strategy");
          fetchStrategies();
      }
  };

  // Backtest Handlers
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
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed");
        alert(data.message);
        fetchHistory(); // Refresh list

    } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unable to queue the backtest.");
    } finally {
        setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8">
      <DeploymentModal 
        isOpen={isDeployOpen} 
        onClose={() => setIsDeployOpen(false)} 
        strategyName={selectedStrategyForDeploy}
        onDeploy={handleDeploy}
      />

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Strategy Lab</h2>
            <p className="text-text-muted mt-2">Design, validate, and deploy your algorithmic strategies.</p>
         </div>
         
         <div className="flex bg-surface-light p-1 rounded-xl border border-white/5">
            <button 
                onClick={() => setActiveTab('library')}
                className={cn(
                    "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]",
                    activeTab === 'library' ? "bg-primary/20 text-primary border border-primary/30 shadow-lg shadow-primary/10" : "text-text-muted hover:text-white bg-transparent hover:bg-white/5"
                )}
            >
                <Layers size={16} /> Library
            </button>
            <button 
                onClick={() => setActiveTab('backtest')}
                className={cn(
                    "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]",
                    activeTab === 'backtest' ? "bg-secondary/20 text-secondary border border-secondary/30 shadow-lg shadow-secondary/10" : "text-text-muted hover:text-white bg-transparent hover:bg-white/5"
                )}
            >
                <Activity size={16} /> Backtester
            </button>
         </div>
      </div>

      {/* VIEW: STRATEGY LIBRARY */}
      {activeTab === 'library' && (
        <>
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Your Strategies</h3>
                <NeonButton variant="accent" icon={<Plus size={18} />} onClick={handleCreate}>Create New</NeonButton>
            </div>

            {loadError && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-200">
                    {loadError}
                </div>
            )}

            {loadingStrategies && (
                <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-text-muted">
                    Loading strategy library...
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Create New Card */}
                <button onClick={handleCreate} className="h-full min-h-[250px] rounded-3xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group flex flex-col items-center justify-center gap-4 text-text-muted hover:text-white">
                    <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <Plus size={32} className="group-hover:text-primary transition-colors" />
                    </div>
                    <span className="font-medium">New Strategy</span>
                </button>

                {/* User Strategies */}
                {strategies.map((strat, i: number) => (
                    <GlassCard key={strat.id || i} className="flex flex-col h-full" hoverEffect={true} glowColor="primary">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`px-2 py-1 rounded text-xs font-bold ${strat.risk === 'High' ? 'bg-red-500/20 text-red-500' : strat.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                            {strat.risk} Risk
                        </div>
                        <div className="text-text-muted text-xs font-bold uppercase">Saved strategy</div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{strat.name}</h3>
                    <p className="text-text-muted text-xs mb-6">{strat.pairs || "No pairs specified"}</p>
                    <div className="mt-auto flex gap-2">
                        <button
                            onClick={() => { setEaName(strat.name); setActiveTab('backtest'); }}
                            className="flex-1 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <Play size={14} /> Backtest
                        </button>
                        <button 
                            onClick={() => handleOpenDeploy(strat.name)}
                            className="p-2 rounded-lg bg-surface/50 hover:bg-surface border border-white/10 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                            title="Queue deployment"
                        >
                            <Upload size={14} />
                        </button>
                        <button 
                            onClick={() => {
                                if (confirm(`Are you sure you want to delete ${strat.name}?`)) {
                                    if (strat.id) deleteStrategy(strat.id);
                                }
                            }}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 transition-colors"
                            title="Delete Strategy"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                    </GlassCard>
                ))}

                {/* Templates */}
                {TEMPLATES.map((temp, i) => (
                    <GlassCard key={i} className="flex flex-col h-full" hoverEffect={true} glowColor="secondary">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`px-2 py-1 rounded text-xs font-bold ${temp.risk === 'High' ? 'bg-red-500/20 text-red-500' : temp.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                            {temp.risk} Risk
                        </div>
                        <div className="text-text-muted text-xs font-bold uppercase">Unvalidated template</div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{temp.name}</h3>
                    <p className="text-text-muted text-xs mb-6">{temp.pairs}</p>
                    <div className="mt-auto flex gap-2">
                        <button 
                            onClick={() => handleClone(temp)}
                            className="flex-1 py-2 rounded-lg bg-surface/50 hover:bg-surface border border-white/10 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <Copy size={14} /> Clone
                        </button>
                        <button 
                            onClick={() => { setEaName(temp.name); setActiveTab('backtest'); }}
                            className="flex-1 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <Play size={14} /> Backtest
                        </button>
                    </div>
                    </GlassCard>
                ))}
            </div>

            {!loadingStrategies && strategies.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 bg-surface/20 p-6 text-center text-text-muted">
                    No saved strategies yet. Create one or clone a template to get started.
                </div>
            )}
        </>
      )}

      {/* VIEW: BACKTESTER */}
      {activeTab === 'backtest' && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Col: Configuration */}
            <div className="lg:col-span-2 space-y-8">
                {/* Platform Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setPlatform("mt4")} className={cn("relative group p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-3", platform === "mt4" ? "bg-primary/10 border-primary shadow-[0_0_30px_-10px_var(--primary)]" : "bg-surface-light border-white/5 hover:border-white/10 hover:bg-white/5")}>
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-transform duration-300 group-hover:scale-110", platform === "mt4" ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/10 text-white")}>4</div>
                        <div className="text-center"><h3 className="font-semibold text-white">MetaTrader 4</h3><p className="text-xs text-text-muted mt-1">Legacy MQL4 Engine</p></div>
                    </button>
                    <button onClick={() => setPlatform("mt5")} className={cn("relative group p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-3", platform === "mt5" ? "bg-secondary/10 border-secondary shadow-[0_0_30px_-10px_var(--secondary)]" : "bg-surface-light border-white/5 hover:border-white/10 hover:bg-white/5")}>
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-transform duration-300 group-hover:scale-110", platform === "mt5" ? "bg-secondary/20 text-secondary border border-secondary/30" : "bg-white/10 text-white")}>5</div>
                        <div className="text-center"><h3 className="font-semibold text-white">MetaTrader 5</h3><p className="text-xs text-text-muted mt-1">Multi-Asset MQL5 Engine</p></div>
                    </button>
                </div>

                {/* Settings Form */}
                <div className="bg-surface-light border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400"><Settings size={20} /></div>
                        <div><h3 className="text-lg font-semibold text-white">Simulation Parameters</h3><p className="text-sm text-text-muted">Configure the environment for {platform === 'mt4' ? 'MT4' : 'MT5'}</p></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><label className="text-sm font-medium text-text-muted">Symbol</label><select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors"><option>EURUSD</option><option>GBPUSD</option><option>XAUUSD</option><option>BTCUSD</option><option>US30</option></select></div>
                        <div className="space-y-2"><label className="text-sm font-medium text-text-muted">Timeframe</label><select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors"><option value="H1">H1 (1 Hour)</option><option value="M15">M15 (15 Minutes)</option><option value="M5">M5 (5 Minutes)</option><option value="H4">H4 (4 Hours)</option><option value="D1">D1 (Daily)</option></select></div>
                        <div className="space-y-2"><label className="text-sm font-medium text-text-muted">Start Date</label><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors" /></div>
                        <div className="space-y-2"><label className="text-sm font-medium text-text-muted">End Date</label><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors" /></div>
                        <div className="space-y-2"><label className="text-sm font-medium text-text-muted">Deposit ($)</label><input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors" /></div>
                        <div className="space-y-2"><label className="text-sm font-medium text-text-muted">Leverage</label><select value={leverage} onChange={(e) => setLeverage(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors"><option>1:100</option><option>1:500</option><option>1:30</option><option>1:1000</option></select></div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <input type="file" ref={fileInputRef} className="hidden" accept=".ex4,.mq4,.ex5,.mq5" onChange={handleFileSelect} />
                        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-white/40 rounded-xl py-4 transition-all group">
                            <Upload className="text-text-muted group-hover:text-white transition-colors" size={20} />
                            <span className="text-sm font-medium text-text-muted group-hover:text-white transition-colors">
                                {eaName === "MACD Sample" ? "Upload Expert Advisor (.ex4, .mq4, .ex5, .mq5)" : `Selected: ${eaName}`}
                            </span>
                        </button>
                        <p className="text-[10px] text-center text-text-muted mt-2 opacity-80">EA files are validated here, then require private object storage and the isolated MetaTrader worker.</p>
                    </div>
                </div>
            </div>

            {/* Right Col: Actions & Status */}
            <div className="space-y-6">
                <div className="bg-surface-light border border-white/5 rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-4">Actions</h3>
                    {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">{error}</div>}
                    <button onClick={handleStartBacktest} disabled={isSimulating} className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
                        {isSimulating ? (<><div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /><span>Queueing...</span></>) : (<><Play size={20} fill="currentColor" /><span>Queue Backtest</span></>)}
                    </button>
                    <p className="text-[10px] text-center text-amber-300/80 mt-2">Requires the private MetaTrader worker. Without it, the run remains queued and no result is fabricated.</p>
                </div>

                <div className="bg-surface-light border border-white/5 rounded-2xl p-6 space-y-4">
                    <h3 className="font-semibold text-white flex items-center gap-2"><TrendingUp size={16} className="text-green-400" /> Recent Runs ({backtests.length})</h3>
                    {loadingBacktests ? (
                        <p className="text-sm text-text-muted">Loading backtest history...</p>
                    ) : backtests.length === 0 ? (<p className="text-sm text-text-muted">No runs yet.</p>) : (
                        <div className="space-y-3">
                            {backtests.map((run) => (
                                <div key={run.id} className="p-3 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center">
                                    <div><div className="text-sm font-medium text-white">{run.config?.eaName || "Unknown"}</div><div className="text-xs text-text-muted">{new Date(run.created_at).toLocaleDateString()} • {run.symbol}</div></div>
                                    <div className={`text-xs px-2 py-1 rounded ${backtestStatusClass(run.status)}`}>{run.status}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="text-[11px] text-text-muted">Completed reports appear here only after a verified worker acknowledgement.</p>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5">
                    <div className="flex gap-3"><Cpu className="text-blue-400 shrink-0" size={20} /><div><h4 className="text-sm font-medium text-blue-100">Worker status</h4><p className="text-xs text-blue-200/60 mt-1">No MetaTrader worker is bundled with the web preview. Configure the private Windows worker to process queued jobs.</p></div></div>
                </div>
            </div>
         </div>
      )}
    </div>
  );
}
