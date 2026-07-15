"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles, RefreshCw, AlertTriangle, ArrowUpRight } from "lucide-react";

interface Trend {
  title: string;
  link: string;
  source: string;
  category: "crypto" | "forex" | "economy" | "general";
  pubDate: string;
  score: number;
  tags: string[];
}

interface TrendsPanelProps {
  onUseTrend: (trend: Trend) => void;
}

export default function TrendsPanel({ onUseTrend }: TrendsPanelProps) {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"live" | "preview">("live");

  const fetchTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/trends");
      if (res.status === 401) {
        setError("__unauthorized__");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setTrends(data.trends);
        setSource(data.source === "preview" ? "preview" : "live");
      } else {
        setError(data.error || "Failed to load trends");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch trends");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-violet-400" />
            Macro & Quant Trend Radar
          </h2>
          <p className="text-sm text-gray-400">
            Real-time market narratives scraped, ranked, and scored by relevance.
          </p>
        </div>
        <button
          onClick={fetchTrends}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/10 disabled:opacity-50 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {source === "preview" && !loading && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
          Local preview dataset — live RSS/GDELT sources are unavailable. Do not publish these sample narratives as current market news.
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="h-8 w-8 text-violet-500 animate-spin" />
          <p className="text-sm text-gray-400">Scanning news feeds and GDELT registry...</p>
        </div>
      ) : error === "__unauthorized__" ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-14 w-14 rounded-full bg-violet-900/30 border border-violet-500/30 flex items-center justify-center">
            <TrendingUp className="h-7 w-7 text-violet-400" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-white">Session Required</p>
            <p className="text-sm text-gray-400 mt-1">
              Please log in to access the Trend Radar.
            </p>
          </div>
          <a
            href="/login"
            className="px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-bold text-white transition"
          >
            Go to Login
          </a>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-900/10 p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white">Analysis Interrupted</p>
            <p className="text-xs text-gray-400 mt-1">{error}</p>
          </div>
        </div>
      ) : trends.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
          <p className="text-sm text-gray-400">No high-relevance signals found. Check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trends.map((trend, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={trend.link + idx}
              className="group relative rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-violet-900/30 text-violet-400 border border-violet-500/20 uppercase">
                    {trend.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">Rel-Score:</span>
                    <span className="text-sm font-bold text-white">{trend.score}</span>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-white mt-3 line-clamp-2 group-hover:text-violet-300 transition-colors">
                  {trend.title}
                </h3>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {trend.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs text-gray-500 truncate max-w-[150px]">{trend.source}</span>
                <div className="flex gap-2">
                  {trend.link && (
                    <a
                      href={trend.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
                      title="Open Source News"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => onUseTrend(trend)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Use Angle
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
