"use client";

import { useEffect, useRef, memo, useState, useMemo } from "react";

// Memoize to prevent re-rendering the script on every small update
const TradingViewWidget = memo(({ symbol, interval, showSR }: { symbol: string, interval: string, showSR: boolean }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear previous chart
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    const studies = showSR ? ["PivotPointsStandard@tv-basicstudies"] : [];

    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol,
      "interval": interval,
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "hide_top_toolbar": true, 
      "hide_legend": false,
      "allow_symbol_change": false,
      "calendar": false,
      "support_host": "https://www.tradingview.com",
      "backgroundColor": "rgba(0, 0, 0, 0.0)", 
      "hide_volume": true,
      "studies": studies,
      "overrides": {
        "paneProperties.background": "#000000",
        "paneProperties.backgroundType": "solid",
        "paneProperties.vertGridProperties.color": "rgba(0, 0, 0, 0)",
        "paneProperties.vertGridProperties.style": 0,
        "paneProperties.horzGridProperties.color": "rgba(0, 0, 0, 0)",
        "paneProperties.horzGridProperties.style": 0,
        "scalesProperties.lineColor": "rgba(0, 0, 0, 0)",
        "scalesProperties.textColor": "#9ca3af", // text-gray-400
        "mainSeriesProperties.candleStyle.borderUpColor": "#22c55e",
        "mainSeriesProperties.candleStyle.borderDownColor": "#ef4444",
        "mainSeriesProperties.candleStyle.wickUpColor": "#22c55e",
        "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
        "paneProperties.legendProperties.showBackground": false
      }
    });
    container.current.appendChild(script);
  }, [symbol, interval, showSR]);

  return <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }} />;
});

TradingViewWidget.displayName = "TradingViewWidget";

export default function MarketChart({ symbol = "XAUUSD" }: { symbol?: string }) {
  // Configurable Interval State
  const [activeInterval, setActiveInterval] = useState("60"); // Default 1H
  
  // Target Logic
  const [entryPrice, setEntryPrice] = useState<string>("0.00");
  const [targetPips, setTargetPips] = useState(45);

  // Initialize Price (Try to fetch Crypto, else use estimates)
  useEffect(() => {
      const fetchPrice = async () => {
          const clusters = ["api.binance.com", "api1.binance.com", "api2.binance.com"];
          const cluster = clusters[Math.floor(Math.random() * clusters.length)];

          // Crypto: Use Binance
          if (symbol.includes("BTC") || symbol.includes("ETH") || symbol.includes("SOL")) {
             try {
                const s = symbol.replace("USD", "USDT");
                const res = await fetch(`https://${cluster}/api/v3/ticker/price?symbol=${s}`);
                if (!res.ok) throw new Error("Binance API error");
                const data = await res.json();
                if (data.price) setEntryPrice(parseFloat(data.price).toFixed(2));
             } catch (e) { 
                console.error("Crypto price fetch failed:", e);
                // Fallback estimates
                if (symbol.includes("BTC")) setEntryPrice("98000.00");
                if (symbol.includes("ETH")) setEntryPrice("2650.00");
             }
          }
           // Gold (Live API)
          else if (symbol === "XAUUSD") {
              try {
                  // Public Gold Price Feed
                  const res = await fetch("https://data-asg.goldprice.org/dbXRates/USD");
                  const data = await res.json();
                  // data.items[0].xauPrice is the price usually
                  if (data.items && data.items[0] && data.items[0].xauPrice) {
                      setEntryPrice(data.items[0].xauPrice.toFixed(2));
                  } else {
                      // Fallback if API structure changes, slightly fresher estimate
                      setEntryPrice("2655.00");
                  }
              } catch (e) { 
                  console.error("Failed to fetch Gold price", e);
                  setEntryPrice("2655.00"); // Fallback
              }
          }
          // Default Forex
          else if (symbol.includes("JPY")) {
              setEntryPrice("150.00");
          } else {
              setEntryPrice("1.1000"); // EURUSD/GBPUSD approx
          }
      };
      fetchPrice();
  }, [symbol]);

  // Calculate Target based on Entry
  const targetPrice = useMemo(() => {
     const price = parseFloat(entryPrice.replace(/,/g, ''));
     if (isNaN(price)) return "---";
     
     // Pip Calculation Logic
     let pipValue = 0.0001;
     if (symbol.includes("JPY") || symbol === "XAUUSD" || symbol.includes("US30") || symbol.includes("NAS")) {
         pipValue = 0.01; // Simplification for JPY/Indices/Gold
     }
     if (symbol.includes("BTC") || symbol.includes("ETH")) {
         pipValue = 1.00; // Crypto "pips" (points)
     }

     return (price + (targetPips * pipValue)).toFixed(symbol.includes("JPY") || symbol === "XAUUSD" ? 2 : 4);
  }, [entryPrice, targetPips, symbol]);

  // Robust Symbol Map (Syncs with LiveNewsWidget)
  const getTVSymbol = (s: string) => {
      // Commodities
      if (s === "XAUUSD" || s === "GOLD") return "OANDA:XAUUSD";

      // Indices
      if (s === "US30" || s === "DJI") return "GLOBALPRIME:US30";
      if (s === "NAS100" || s === "NDX") return "GLOBALPRIME:NAS100";
      if (s === "SPX500" || s === "SPX") return "GLOBALPRIME:US500";
      
      // Crypto
      if (s.includes("BTC") || s.includes("ETH") || s.includes("SOL") || s.includes("XRP")) {
         return `BINANCE:${s.replace("USD", "USDT")}`;
      }

      // Default Forex
      if (s.includes(":")) return s;
      return `FX:${s}`;
  };

  // AI Analysis Logic
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [showSR, setShowSR] = useState(false);
  const [scanningSR, setScanningSR] = useState(false);
  const [srTimeframe, setSrTimeframe] = useState("1h");

  const timeframes = ["15m", "1h", "4h", "1D"];

  const analyzeCandle = async () => {
    setAnalyzing(true);
    setAnalysis(null);
    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            body: JSON.stringify({ 
                message: `Perform an institutional-grade technical auction analysis for ${symbol}. 
                Synthesize technical order flow with current macro-geopolitical sentiment. 
                Focus on high-probability liquidity zones and provide a concise technical summary.` 
            })
        });
        const data = await res.json();
        setAnalysis(data.reply);
    } catch (e) {
        console.error(e);
    } finally {
        setAnalyzing(false);
    }
  };

  const toggleSR = async () => {
    const newState = !showSR;
    setShowSR(newState);
    if (newState) {
        setScanningSR(true);
        setAnalysis(null);
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                body: JSON.stringify({ 
                    message: `Identify primary institutional Support and Resistance zones for ${symbol} on the ${srTimeframe} timeframe. 
                    Evaluate structural significance on ${srTimeframe} and how current geopolitical volatility might impact these specific levels. 
                    Provide a summarized institutional outlook for this timeframe.` 
                })
            });
            const data = await res.json();
            setAnalysis(data.reply);
        } catch (e) {
            console.error(e);
        } finally {
            setScanningSR(false);
        }
    } else {
        setAnalysis(null);
    }
  };

  // --- Economic Events Logic ---
  const [activeEvent, setActiveEvent] = useState<any | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    // REALISTIC MOCK DATA: Events fixed to specific times of day
    // The popup will ONLY show if you happen to be in the 5-minute window before these times.
    const today = new Date();
    const setTime = (h: number, m: number) => {
        const d = new Date(today);
        d.setHours(h, m, 0, 0);
        return d;
    };

    const mockEvents = [
        { 
            id: "evt-ny-open", 
            title: "Market Open (NY)", 
            impact: "High", 
            time: setTime(9, 30), // 9:30 AM Local
            forecast: "-", 
            previous: "-" 
        },
        { 
            id: "evt-fomc", 
            title: "FOMC Meeting", 
            impact: "High", 
            time: setTime(14, 0), // 2:00 PM Local
            forecast: "5.50%", 
            previous: "5.50%" 
        }, 
        {
            id: "evt-london-close",
            title: "London Fix",
            impact: "Medium",
            time: setTime(16, 0), // 4:00 PM Local
            forecast: "-",
            previous: "-"
        }
    ];

    const timer = setInterval(() => {
        const currentTime = new Date();
        // Find next upcoming event within 5 minutes
        const upcoming = mockEvents.find(e => 
            e.time > currentTime && 
            (e.time.getTime() - currentTime.getTime()) <= 5 * 60000 
        );

        if (upcoming) {
            setActiveEvent(upcoming);
            const diff = upcoming.time.getTime() - currentTime.getTime();
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setTimeRemaining(`${mins}m ${secs}s`);
        } else {
            setActiveEvent(null);
        }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full relative group">
       {/* Bias Pills Control Bar - Floating Text Style (No Box) */}
       <div className="absolute top-4 left-4 z-10 flex gap-6 transition-opacity duration-300 pointer-events-auto">
          {/* Higher Timeframe Button */}
          <button 
             onClick={() => setActiveInterval("D")}
             className={`text-left transition-all hover:scale-105 opacity-60 hover:opacity-100 ${activeInterval === "D" ? "opacity-100" : ""}`}
          >
             <div className="text-[9px] text-text-muted uppercase font-bold tracking-widest mb-0.5">HTF Bias</div>
             <div className="text-sm font-bold text-green-400 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${activeInterval === "D" ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-green-500/30"}`}></span> 
                Bullish
             </div>
          </button>

          {/* Intraday Button */}
          <button 
             onClick={() => setActiveInterval("60")}
             className={`text-left transition-all hover:scale-105 opacity-60 hover:opacity-100 ${activeInterval === "60" ? "opacity-100" : ""}`}
          >
             <div className="text-[9px] text-text-muted uppercase font-bold tracking-widest mb-0.5">Intraday</div>
             <div className="text-sm font-bold text-green-400 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${activeInterval === "60" ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-green-500/30"}`}></span> 
                Bullish
             </div>
          </button>

          {/* AI Inspector Button */}
          <button 
             onClick={analyzeCandle}
             disabled={analyzing}
             className="text-left transition-all hover:scale-105 opacity-60 hover:opacity-100 group/ai flex items-center gap-2"
          >
              <div className={`w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center bg-primary/10 group-hover/ai:bg-primary/20 transition-colors ${analyzing ? 'animate-pulse' : ''}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <div>
                <div className="text-[9px] text-text-muted uppercase font-bold tracking-widest mb-0.5">AI Analyst</div>
                <div className="text-xs font-bold text-white group-hover/ai:text-primary transition-colors">
                    {analyzing ? "Scanning..." : "Explain Move"}
                </div>
              </div>
          </button>

          {/* Timeframe Selector for S/R */}
          <div className="flex bg-white/5 p-1 rounded-full border border-white/10 items-center">
             {timeframes.map(tf => (
                 <button
                    key={tf}
                    onClick={() => setSrTimeframe(tf)}
                    className={`px-2 py-1 text-[9px] font-black rounded-full transition-all uppercase tracking-tighter ${srTimeframe === tf ? 'bg-primary text-black scale-110 shadow-[0_0_10px_rgba(14,242,177,0.5)]' : 'text-text-muted hover:text-white'}`}
                 >
                    {tf}
                 </button>
             ))}
          </div>

          {/* S/R Scanner Button */}
          <button 
             onClick={toggleSR}
             disabled={scanningSR}
             className={`text-left transition-all hover:scale-105 group/sr flex items-center gap-2 ${showSR ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
          >
              <div className={`w-8 h-8 rounded-full border ${showSR ? 'border-orange-500/50 bg-orange-500/20' : 'border-primary/30 bg-primary/10'} flex items-center justify-center group-hover/sr:bg-orange-500/20 transition-colors ${scanningSR ? 'animate-pulse' : ''}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={showSR ? 'text-orange-500' : 'text-primary'}><path d="M12 2v20M2 12h20"></path><path d="M18 6l-6-6-6 6M18 18l-6 6-6-6"></path></svg>
              </div>
              <div>
                <div className="text-[9px] text-text-muted uppercase font-bold tracking-widest mb-0.5">{srTimeframe} Levels</div>
                <div className={`text-xs font-bold transition-colors ${showSR ? 'text-orange-500' : 'text-white group-hover/sr:text-orange-500'}`}>
                    {scanningSR ? "Analyzing..." : showSR ? "Active" : "Scan S/R"}
                </div>
              </div>
          </button>
       </div>

       {/* AI Analysis Overlay (Appears on click) */}
       {analysis && (
           <div className="absolute top-20 left-4 z-20 max-w-sm bg-[#0B0F1A]/90 backdrop-blur-md border border-primary/20 rounded-xl p-4 shadow-xl animate-in fade-in slide-in-from-top-2">
               <div className="flex justify-between items-start mb-2">
                   <h4 className="text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                       Market Logic
                   </h4>
                   <button onClick={() => setAnalysis(null)} className="text-white/40 hover:text-white transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                   </button>
               </div>
               <div className="text-xs text-white/80 leading-relaxed whitespace-pre-line font-mono">
                   {analysis.replace(/\*\*/g, '')}
               </div>
           </div>
       )}

       {/* Economic Event Overlay - Auto-Hides when event passes */}
       {activeEvent && (
           <div className="absolute top-20 left-4 z-20 animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="bg-red-500/10 backdrop-blur-md border border-red-500/50 rounded-lg p-3 shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center gap-4">
                   <div className="flex flex-col items-center justify-center w-10 h-10 bg-red-500 rounded-md shadow-sm animate-pulse">
                        <span className="text-[10px] font-bold text-white uppercase">In</span>
                        <span className="text-xs font-black text-white leading-none">T-</span>
                   </div>
                   <div>
                       <div className="flex items-center gap-2 mb-0.5">
                           <span className="text-xs font-bold text-white text-shadow-sm">{activeEvent.title}</span>
                           <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/10 text-white uppercase border border-white/10">High Impact</span>
                       </div>
                       <div className="flex items-center gap-3 text-[10px] text-red-200 font-mono">
                           <span>Fcst: {activeEvent.forecast}</span>
                           <span className="text-white/40">|</span>
                           <span className="text-white font-bold tracking-wider">Release in: {timeRemaining}</span>
                       </div>
                   </div>
               </div>
           </div>
       )}

       {/* Chart Targets Overlay - Interactive - STRICTLY NO BOX */}
       <div className="absolute right-4 top-1/3 z-10 space-y-2 pointer-events-auto p-2 hover:opacity-100 opacity-80 transition-opacity">
          <div className="flex flex-col gap-1 items-end">
             {/* Entry Input - Minimalist Underline */}
             <div className="flex items-center gap-2">
                 <span className="text-[9px] text-text-muted uppercase tracking-wider font-bold">Entry</span>
                 <input 
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="w-20 bg-transparent border-b border-white/20 px-0 py-0.5 text-right text-xs font-mono text-white focus:border-green-500 outline-none placeholder-white/10"
                 />
             </div>
             
             {/* Target Display */}
             <div className="flex items-center gap-2 mt-2">
                 <div className="flex flex-col items-end">
                    <span className="text-xs text-green-400 font-mono font-bold shadow-black drop-shadow-md">TP: {targetPrice}</span>
                    <span className="text-[9px] text-green-500/70 font-mono tracking-wide">+{targetPips} pips</span>
                 </div>
                 <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-green-500 shadow-[0_0_10px_#22c55e]"></div>
             </div>
          </div>
       </div>

       <div className="w-full h-full" style={{ minHeight: "400px" }}>
           <TradingViewWidget symbol={getTVSymbol(symbol)} interval={activeInterval} showSR={showSR} />
       </div>
    </div>
  );
}
