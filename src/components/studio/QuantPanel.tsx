"use client";

import { useState, useEffect } from "react";
import { Cpu, Loader2, Sparkles, AlertCircle, FileText, Image as ImageIcon, Calendar } from "lucide-react";
import JobStatusCard from "./JobStatusCard";

interface Signal {
  id: string;
  title: string;
  source: string;
  bias: string;
  symbol: string;
  description: string;
}

interface Script {
  title: string;
  scriptText: string;
  complianceChecked: boolean;
  warnings: string[];
}

export default function QuantPanel({ prefilledTrendTitle }: { prefilledTrendTitle?: string }) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [selectedSignalId, setSelectedSignalId] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [activeJob, setActiveJob] = useState<{ status: any; progress: number; message: string } | null>(null);

  const [result, setResult] = useState<{
    signal: Signal;
    script: Script;
    chartUrl: string;
  } | null>(null);

  const fetchSignals = async () => {
    try {
      const res = await fetch("/api/studio/trends");
      const data = await res.json();
      if (data.success) {
        // Convert trend radar signals to selection format
        const trendSignals = data.trends.slice(0, 5).map((t: any, index: number) => ({
          id: `${t.source || "trend"}-${t.link || t.title || index}-${index}`,
          title: t.title,
          source: t.source,
          bias: t.tags.includes("bearish") ? "Bearish" : "Bullish",
          symbol: t.tags[0]?.toUpperCase() || "GLOBAL",
          description: t.title,
        }));
        setSignals(trendSignals);
        if (trendSignals.length > 0) {
          setSelectedSignalId(trendSignals[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, []);

  useEffect(() => {
    if (prefilledTrendTitle) {
      setCustomDescription(prefilledTrendTitle);
    }
  }, [prefilledTrendTitle]);

  const handleGenerate = async () => {
    const selectedSignal = signals.find((signal) => signal.id === selectedSignalId);
    const symbol = selectedSignalId === "CUSTOM" ? "CUSTOM" : selectedSignal?.symbol || selectedSignalId;
    const description = customDescription || selectedSignal?.description;

    setLoading(true);
    setResult(null);
    setActiveJob({ status: "processing", progress: 20, message: "Analyzing signal vectors..." });

    try {
      // Simulate progress intervals since this is fast
      const interval = setInterval(() => {
        setActiveJob((prev) => {
          if (!prev) return null;
          if (prev.progress >= 90) return prev;
          return {
            ...prev,
            progress: prev.progress + 15,
            message: prev.progress > 50 ? "Drafting visual storyboards..." : "Constructing voiceover narrative...",
          };
        });
      }, 600);

      const res = await fetch("/api/studio/quant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          customDescription: description || undefined,
        }),
      });

      clearInterval(interval);
      const data = await res.json();

      if (data.success) {
        setResult(data);
        setActiveJob({ status: "done", progress: 100, message: "Voiceover script and card generated!" });
      } else {
        setActiveJob({ status: "failed", progress: 0, message: data.error || "Generation failed" });
      }
    } catch (err: any) {
      setActiveJob({ status: "failed", progress: 0, message: err.message || "Request failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!result) return;
    try {
      const res = await fetch("/api/studio/publisher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.script.title,
          caption: `${result.script.scriptText}\n\n#BeewStudio #QuantMarkets #${result.signal.symbol}`,
          mediaUrl: result.chartUrl,
          platform: "telegram",
          scheduledAt: new Date(Date.now() + 10 * 60000).toISOString(), // 10 minutes from now
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Draft successfully enqueued in the Scheduler Calendar!");
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Configuration Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="h-5 w-5 text-violet-400" />
            Quant Signal Explainer
          </h2>
          <p className="text-sm text-gray-400">
            Convert complex algo signals or macro headlines into clean vertical reels.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Select Signal Focus
            </label>
            <select
              value={selectedSignalId}
              onChange={(e) => setSelectedSignalId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
            >
              {signals.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.symbol} — {s.title.slice(0, 30)}...
                </option>
              ))}
              <option value="CUSTOM">Write Custom Narrative</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Custom Context (Optional)
            </label>
            <textarea
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="Provide extra background data, trading indicators, or metrics for the generator."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 placeholder-gray-500"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-sm font-bold text-white transition shadow-lg shadow-violet-500/20"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Build Narrative
          </button>
        </div>

        {activeJob && (
          <JobStatusCard
            title={selectedSignalId === "CUSTOM" ? "CUSTOM" : signals.find((s) => s.id === selectedSignalId)?.symbol || "Signal"}
            service="Quant Script Generator"
            status={activeJob.status}
            progress={activeJob.progress}
            message={activeJob.message}
          />
        )}
      </div>

      {/* Results Display */}
      <div className="lg:col-span-2 space-y-6">
        {result ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Voiced Script Output */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-violet-300 flex items-center gap-1.5 border-b border-white/5 pb-2">
                <FileText className="h-4 w-4" />
                Narrative Script
              </h3>
              <div>
                <p className="text-xs text-gray-400">Proposed Hook Title</p>
                <p className="text-base font-bold text-white mt-1">{result.script.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Content Voiceover (0-60s)</p>
                <p className="text-sm text-gray-300 mt-1 whitespace-pre-line leading-relaxed">
                  {result.script.scriptText}
                </p>
              </div>

              {/* Compliance Flagging Box */}
              {result.script.warnings.length > 0 && (
                <div className="rounded-lg bg-yellow-950/20 border border-yellow-500/20 p-3 mt-4">
                  <span className="text-xs font-semibold text-yellow-400 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Compliance Review Flags
                  </span>
                  <ul className="list-disc list-inside text-xs text-gray-300 mt-2 space-y-1">
                    {result.script.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Generated Card Asset */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-violet-300 flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <ImageIcon className="h-4 w-4" />
                  Visual Explainer Card
                </h3>
                <div className="aspect-[9/16] max-h-[350px] mx-auto rounded-lg overflow-hidden border border-white/15 bg-gray-900 mt-4 relative">
                  <iframe
                    src={result.chartUrl}
                    className="w-full h-full border-none pointer-events-none select-none"
                    scrolling="no"
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex gap-3">
                <a
                  href={result.chartUrl}
                  download={`${result.signal.symbol.toLowerCase()}_card.svg`}
                  className="flex-1 text-center py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:bg-white/10 transition"
                >
                  Download Asset
                </a>
                <button
                  onClick={handleSchedule}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Approve & Schedule
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-xl">
            <Cpu className="h-10 w-10 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">Configure parameters and build narrative to generate outputs.</p>
          </div>
        )}
      </div>
    </div>
  );
}
