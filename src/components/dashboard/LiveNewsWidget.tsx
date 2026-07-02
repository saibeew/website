"use client";

import { useEffect, useState, useRef, memo } from "react";
import { 
  Globe, 
  Target, 
  Clock, 
  Cpu, 
  ExternalLink, 
  X, 
  Newspaper, 
  AlertTriangle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { extractEntities } from "@/lib/entities";

interface LiveNewsWidgetProps {
  symbol?: string;
  layout?: "compact" | "full";
}

interface NewsItem {
  id: number;
  title: string;
  body: string;
  category: string;
  source_url: string;
  source: string;
  score: number | null;
  published_at: string | null;
  collected_at: string | null;
  processed: boolean;
  ai_summarized: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  geopolitical: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", label: "⚔️ Geopolitical" },
  macro:        { bg: "bg-amber-500/10",  border: "border-amber-500/30",  text: "text-amber-400",  label: "🏦 Macro" },
  crypto:       { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", label: "🪙 Crypto" },
  commodity:    { bg: "bg-yellow-500/10",  border: "border-yellow-500/35",   text: "text-yellow-400",   label: "🛢️ Commodity" },
  forex:        { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", label: "💵 Forex" },
  finance:      { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", label: "📈 Finance" },
  breaking:     { bg: "bg-red-600/15",  border: "border-red-500/50",   text: "text-red-500",   label: "🔴 Breaking" },
};

const CATEGORY_FILTERS = [
  { key: "all", label: "All Feeds" },
  { key: "breaking", label: "🔴 Breaking" },
  { key: "geopolitical", label: "⚔️ Geopolitical" },
  { key: "macro", label: "🏦 Macro / Fed" },
  { key: "commodity", label: "🛢️ Commodities" },
  { key: "forex", label: "💵 Forex" },
  { key: "crypto", label: "🪙 Crypto" },
  { key: "finance", label: "📈 Finance" },
];

function formatTime(isoString: string | null) {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, "0");
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1)  return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return isoString;
  }
}

function getSentiment(title: string, summary: string | null): "Bullish" | "Bearish" | "Neutral" {
  const text = `${title} ${summary || ""}`.toLowerCase();
  const bullishKeywords = ["surge", "rise", "jump", "growth", "rally", "gain", "bullish", "higher", "record high", "cut interest rates", "rate cut", "boost", "recovery", "positive", "strong"];
  const bearishKeywords = ["slump", "fall", "drop", "plunge", "decline", "bearish", "lower", "crash", "loss", "recession", "rate hike", "hike interest rates", "inflation rise", "slowdown", "weak", "negative"];
  
  let bullCount = 0;
  let bearCount = 0;
  
  bullishKeywords.forEach(kw => { if (text.includes(kw)) bullCount++; });
  bearishKeywords.forEach(kw => { if (text.includes(kw)) bearCount++; });
  
  if (bullCount > bearCount) return "Bullish";
  if (bearCount > bullCount) return "Bearish";
  return "Neutral";
}

const LiveNewsWidget = memo(({ symbol = "XAUUSD", layout = "compact" }: LiveNewsWidgetProps) => {
  const [mode, setMode] = useState<"global" | "specific">(layout === "full" ? "global" : "specific");
  const [activeCategory, setActiveCategory] = useState("all");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const [newCount, setNewCount] = useState(0);
  const [sourceMode, setSourceMode] = useState<"live" | "database" | "demo" | "unknown">("unknown");
  const [aiExplanations, setAiExplanations] = useState<Record<number, string>>({});
  const [aiLoadingId, setAiLoadingId] = useState<number | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const knownIds = useRef<Set<number>>(new Set());

  const fetchNewsFeed = async (isInitial = false) => {
    try {
      let url = `/api/news?limit=${layout === "full" ? "100" : "15"}`;
      
      if (mode === "specific") {
        url += `&symbol=${symbol}`;
      }
      
      if (layout === "full" && activeCategory !== "all") {
        url += `&category=${activeCategory}`;
      }

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch news stream.");
      const data = await res.json();
      const incoming = data.items || [];
      setSourceMode(data.source || (data.fallback ? "demo" : "unknown"));

      if (isInitial) {
        incoming.forEach((i: NewsItem) => knownIds.current.add(i.id));
        setItems(incoming);
      } else {
        const freshItems = incoming.filter((i: NewsItem) => !knownIds.current.has(i.id));
        if (freshItems.length > 0) {
          freshItems.forEach((i: NewsItem) => knownIds.current.add(i.id));
          const freshSet = new Set<number>(freshItems.map((i: NewsItem) => i.id));
          setNewIds(freshSet);
          setNewCount((p) => p + freshItems.length);
          setItems((prev) => [...freshItems, ...prev]);
          // Clear new highlights after 8s
          setTimeout(() => setNewIds(new Set()), 8000);
        }
      }
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      console.error(err);
      if (isInitial) setError("Unable to connect to the news stream.");
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setItems([]);
    knownIds.current = new Set();
    setNewCount(0);
    fetchNewsFeed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, symbol, activeCategory]);

  useEffect(() => {
    const interval = setInterval(() => fetchNewsFeed(false), 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, symbol, activeCategory]);

  const explainArticle = async (article: NewsItem) => {
    if (aiExplanations[article.id]) return;

    setAiLoadingId(article.id);
    setAiError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: [
            "Explain this market news only if it is relevant to trading decisions.",
            "Keep it concise and practical for an MT5 forex/CFD trader.",
            `Headline: ${article.title}`,
            `Source: ${article.source}`,
            `Category: ${article.category}`,
            article.body ? `Context: ${article.body}` : "",
          ].filter(Boolean).join("\n"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to generate AI explanation.");
      setAiExplanations((prev) => ({ ...prev, [article.id]: data.reply || "No explanation returned." }));
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Unable to generate AI explanation.");
    } finally {
      setAiLoadingId(null);
    }
  };

  // --- FULL LAYOUT (Dashboard News Page View) ---
  if (layout === "full") {
    return (
      <div className="h-full w-full flex flex-col space-y-4 overflow-hidden relative text-white">
        {/* Dynamic New Items Notification */}
        {newCount > 0 && (
          <motion.button
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-2 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-semibold cursor-pointer shadow-[0_0_15px_rgba(14,242,177,0.25)] animate-pulse"
            onClick={() => {
              setNewCount(0);
              const container = document.getElementById("news-feed-container");
              if (container) container.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            ⚡ {newCount} new updates available
          </motion.button>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0 px-1">
          {[
            { label: "Total Articles", value: items.length, color: "text-white" },
            { label: "New Updates", value: newCount, color: "text-primary" },
            { label: "Filter", value: activeCategory === "all" ? "All" : activeCategory, color: "text-warning" },
            { label: "Live Connection", value: sourceMode === "demo" ? "Demo Feed" : sourceMode === "database" ? "Local DB" : sourceMode === "live" ? "Live Feed" : lastUpdated ? lastUpdated.toLocaleTimeString() : "Syncing...", color: "text-secondary" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-surface/20 border border-white/5 rounded-xl p-3 backdrop-blur-sm shadow-xl flex flex-col justify-center">
              <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{stat.label}</span>
              <span className={`text-lg font-bold ${stat.color} mt-0.5`}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Headline Ticker */}
        {items.length > 0 && (
          <div className="shrink-0 h-8 bg-black/40 border border-white/5 rounded-xl overflow-hidden flex items-center relative backdrop-blur-sm mx-1">
            <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#05070A] to-transparent w-8 z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-[#05070A] to-transparent w-8 z-10 pointer-events-none" />
            <div className="flex whitespace-nowrap animate-[shimmer_25s_linear_infinite] gap-12 text-xs text-text-muted pl-4">
              {items.slice(0, 10).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors" onClick={() => setSelectedArticle(item)}>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="font-semibold text-white/80">{item.source}</span>
                  <span className="truncate max-w-[200px]">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Pills & Symbol Toggle Bar */}
        <div className="shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-1">
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
            {CATEGORY_FILTERS.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                    isActive 
                      ? "bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_rgba(14,242,177,0.15)]"
                      : "bg-surface/20 text-text-muted border-white/5 hover:text-white hover:bg-surface/40"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Symbol Feed Toggle */}
          <div className="flex bg-[#0B0F1A]/80 p-0.5 rounded-lg border border-white/5 gap-1 shrink-0 w-full md:w-auto">
            <button 
              onClick={() => setMode("global")}
              className={clsx(
                "flex-1 md:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer border",
                mode === "global" 
                  ? "bg-primary/20 text-primary border-primary/20 shadow-[0_0_8px_rgba(14,242,177,0.15)]" 
                  : "text-text-muted border-transparent hover:text-white hover:bg-white/5"
              )}
            >
              <Globe size={12} />
              Global Feed
            </button>
            <button 
              onClick={() => setMode("specific")}
              className={clsx(
                "flex-1 md:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer border",
                mode === "specific" 
                  ? "bg-primary/20 text-primary border-primary/20 shadow-[0_0_8px_rgba(14,242,177,0.15)]" 
                  : "text-text-muted border-transparent hover:text-white hover:bg-white/5"
              )}
            >
              <Target size={12} />
              {symbol} Only
            </button>
          </div>
        </div>

        {/* Feed Cards Container */}
        <div className="flex-1 min-h-0 bg-[#0B0F1A]/20 border border-white/5 rounded-2xl p-4 overflow-hidden relative backdrop-blur-sm mx-1">
          {loading ? (
            <div className="h-full w-full flex flex-col items-center justify-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
              <p className="text-sm text-text-muted">Ingesting intelligence feed...</p>
            </div>
          ) : error ? (
            <div className="h-full w-full flex flex-col items-center justify-center space-y-2 text-danger">
              <AlertTriangle size={32} />
              <h3 className="font-semibold text-white">Connection Error</h3>
              <p className="text-sm text-text-muted">{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center space-y-2 text-text-muted">
              <Globe size={32} />
              <h3 className="font-semibold text-white">Feed is Empty</h3>
              <p className="text-sm text-text-muted">No articles found in this category.</p>
            </div>
          ) : (
            <div 
              id="news-feed-container"
              className="h-full overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10"
            >
              {items.map((item) => {
                const entities = extractEntities(item.title, item.body);
                const isNew = newIds.has(item.id);
                const catConfig = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.finance;
                const sentiment = getSentiment(item.title, item.body);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedArticle(item)}
                    className={`group relative border rounded-xl p-4 transition-all duration-300 cursor-pointer flex flex-col gap-2.5 ${
                      isNew 
                        ? "bg-primary/5 border-primary/40 shadow-[0_0_15px_rgba(14,242,177,0.1)]" 
                        : "bg-surface/10 hover:bg-surface/30 border-white/5 hover:border-white/10"
                    }`}
                  >
                    {/* Left sentiment border */}
                    <div className={clsx(
                      "absolute top-0 bottom-0 left-0 w-1 rounded-l-xl",
                      sentiment === 'Bullish' ? 'bg-green-500' : 
                      sentiment === 'Bearish' ? 'bg-red-500' : 'bg-yellow-500'
                    )} />

                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-4 pl-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}>
                          {catConfig.label}
                        </span>
                        <span className={clsx(
                          "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border",
                          sentiment === 'Bullish' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          sentiment === 'Bearish' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        )}>
                          {sentiment}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatTime(item.collected_at)}
                        </span>
                        <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-full font-semibold">
                          {item.source}
                        </span>
                      </div>
                    </div>

                    {/* Article Title */}
                    <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors pl-1">
                      {item.title}
                    </h3>

                    {/* Entity Tags */}
                    {entities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-1 mt-1">
                        {entities.slice(0, 4).map((e) => (
                          <span 
                            key={e.name} 
                            className="text-[9px] px-2 py-0.5 rounded-full border bg-white/5 border-white/5 text-white/90"
                          >
                            {e.icon} {e.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Render Popup Modal details wrapper */}
        {renderDetailModal(selectedArticle, setSelectedArticle, {
          explanation: selectedArticle ? aiExplanations[selectedArticle.id] : undefined,
          isLoading: selectedArticle ? aiLoadingId === selectedArticle.id : false,
          error: aiError,
          onExplain: explainArticle,
        })}
      </div>
    );
  }

  // --- COMPACT LAYOUT (Sidebar Widgets View) ---
  return (
    <div className="h-full w-full flex flex-col bg-surface/10 relative rounded-xl overflow-hidden backdrop-blur-sm">
      {/* Toggle Header */}
      <div className="w-full p-2 shrink-0 flex gap-2 bg-[#0B0F1A]/90 border-b border-white/5 z-10">
        <button 
          onClick={() => setMode("global")}
          className={clsx(
            "flex-1 text-[11px] font-semibold py-1 rounded flex items-center justify-center gap-1 transition-all cursor-pointer border",
            mode === "global" 
              ? "bg-primary/20 text-primary border-primary/30" 
              : "text-text-muted border-transparent hover:text-white hover:bg-white/5"
          )}
        >
          <Globe size={11} />
          Global
        </button>
        <button 
          onClick={() => setMode("specific")}
          className={clsx(
            "flex-1 text-[11px] font-semibold py-1 rounded flex items-center justify-center gap-1 transition-all cursor-pointer border",
            mode === "specific" 
              ? "bg-primary/20 text-primary border-primary/30" 
              : "text-text-muted border-transparent hover:text-white hover:bg-white/5"
          )}
        >
          <Target size={11} />
          {symbol} Only
        </button>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
        {loading ? (
          <div className="h-full w-full flex flex-col items-center justify-center space-y-2 py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-primary" />
            <span className="text-[10px] text-text-muted">Loading feed...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center space-y-1 py-8 text-text-muted">
            <Globe size={18} />
            <span className="text-[10px]">No news signals found</span>
          </div>
        ) : (
          items.map((item) => {
            const sentiment = getSentiment(item.title, item.body);
            const catConfig = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.finance;

            return (
              <div 
                key={item.id} 
                onClick={() => setSelectedArticle(item)}
                className="group relative pl-4 border-l-2 border-white/5 hover:border-primary/50 transition-all cursor-pointer py-0.5"
              >
                {/* Visual Tracker Dot */}
                <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-surface border border-white/10 group-hover:border-primary group-hover:scale-110 transition-all"></div>
                
                {/* Meta details */}
                <div className="text-[9px] text-text-muted font-mono mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {formatTime(item.collected_at)}
                  </span>
                  <span className={clsx(
                    "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border",
                    sentiment === 'Bullish' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    sentiment === 'Bearish' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  )}>
                    {sentiment}
                  </span>
                </div>
                
                {/* Headline */}
                <h4 className="text-xs text-white font-medium leading-snug mb-1 group-hover:text-primary transition-colors">
                  {item.title}
                </h4>

                {/* Subtext info */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full border ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}>
                    {catConfig.label.split(" ")[1] || catConfig.label}
                  </span>
                  <span className="text-[8px] px-1.5 py-0.2 rounded bg-white/5 border border-white/5 text-text-muted">
                    {item.source}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Render Popup Modal details wrapper */}
      {renderDetailModal(selectedArticle, setSelectedArticle, {
        explanation: selectedArticle ? aiExplanations[selectedArticle.id] : undefined,
        isLoading: selectedArticle ? aiLoadingId === selectedArticle.id : false,
        error: aiError,
        onExplain: explainArticle,
      })}
    </div>
  );
});

// --- HELPER FUNCTION TO RENDER DETAILS POPUP MODAL ---
function renderDetailModal(
  selectedArticle: NewsItem | null,
  setSelectedArticle: (i: NewsItem | null) => void,
  ai: {
    explanation?: string;
    isLoading: boolean;
    error: string | null;
    onExplain: (article: NewsItem) => void;
  }
) {
  return (
    <AnimatePresence>
      {selectedArticle && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedArticle(null)}
          />

          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative w-full max-w-xl bg-[#090D16] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[80vh] text-white"
          >
            <button 
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/5"
              onClick={() => setSelectedArticle(null)}
            >
              <X size={18} />
            </button>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  CATEGORY_COLORS[selectedArticle.category]?.bg || "bg-blue-500/10"
                } ${
                  CATEGORY_COLORS[selectedArticle.category]?.text || "text-blue-400"
                } ${
                  CATEGORY_COLORS[selectedArticle.category]?.border || "border-blue-500/20"
                }`}>
                  {CATEGORY_COLORS[selectedArticle.category]?.label || selectedArticle.category}
                </span>
                <span className={clsx(
                  "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border",
                  getSentiment(selectedArticle.title, selectedArticle.body) === 'Bullish' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                  getSentiment(selectedArticle.title, selectedArticle.body) === 'Bearish' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                )}>
                  {getSentiment(selectedArticle.title, selectedArticle.body)}
                </span>
              </div>

              <h2 className="text-sm md:text-base font-bold leading-snug">
                {selectedArticle.title}
              </h2>

              <div className="h-[1px] bg-white/10" />

              {selectedArticle.body && (
                <div className="space-y-1">
                  <h4 className="text-[9px] font-bold text-primary uppercase tracking-wider">Source Context</h4>
                  <p className="text-xs text-text-muted leading-relaxed bg-white/5 border border-white/5 rounded-xl p-3">
                    {selectedArticle.body}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => ai.onExplain(selectedArticle)}
                  disabled={ai.isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/25 bg-primary/10 text-primary hover:bg-primary/15 disabled:opacity-60 text-[10px] font-bold uppercase tracking-wider transition-colors"
                >
                  <Cpu size={12} />
                  {ai.explanation ? "AI Explanation Ready" : ai.isLoading ? "Explaining..." : "Explain With AI"}
                </button>

                {ai.error && (
                  <p className="text-[10px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                    {ai.error}
                  </p>
                )}

                {ai.explanation && (
                  <div className="rounded-xl border border-primary/20 bg-primary/10 p-3">
                    <h4 className="text-[9px] font-bold text-primary uppercase tracking-wider mb-2">AI Explanation</h4>
                    <p className="text-xs text-white/80 leading-relaxed whitespace-pre-line">
                      {ai.explanation.replace(/\*\*/g, "")}
                    </p>
                  </div>
                )}
              </div>

              {/* Impacted Assets */}
              {extractEntities(selectedArticle.title, selectedArticle.body).length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-[9px] font-bold text-secondary uppercase tracking-wider">Affected Markets</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {extractEntities(selectedArticle.title, selectedArticle.body).map((e) => (
                      <span 
                        key={e.name} 
                        className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 text-white rounded-lg flex items-center gap-1"
                      >
                        <span>{e.icon}</span>
                        <span className="font-semibold">{e.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 bg-white/5 border border-white/5 rounded-xl p-3 text-[10px]">
                <div>
                  <span className="text-text-muted block text-[8px] uppercase">Source</span>
                  <span className="font-bold text-white mt-0.5 block">{selectedArticle.source}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[8px] uppercase">Published</span>
                  <span className="font-bold text-white mt-0.5 block">{selectedArticle.published_at ? new Date(selectedArticle.published_at).toLocaleString() : "N/A"}</span>
                </div>
              </div>

              {selectedArticle.source_url && (
                <div className="flex justify-end pt-1">
                  <a
                    href={selectedArticle.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-white border border-white/10 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    Read Original Source
                    <ExternalLink size={10} />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

LiveNewsWidget.displayName = "LiveNewsWidget";

export default LiveNewsWidget;
