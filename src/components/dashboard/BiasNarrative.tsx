"use client";

import { useState, useEffect } from "react";
import { Info, RefreshCw, Sparkles } from "lucide-react";
import { AiService, AnalysisResult } from "@/services/aiService";
import clsx from "clsx";

interface BiasNarrativeProps {
    symbol: string;
}

export default function BiasNarrative({ symbol }: BiasNarrativeProps) {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);

    const generateBias = async () => {
        setLoading(true);
        try {
            const result = await AiService.analyzeMarket(symbol);
            setAnalysis(result);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        generateBias();
    }, [symbol]);

    if (!analysis && !loading) return null;

    return (
        <div 
            data-cursor="ai"
            className="h-48 shrink-0 bg-[#0B0F1A] border border-white/5 rounded-xl p-6 relative overflow-hidden group"
        >
            {/* Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent"></div>
            
            {/* AI Glow Effect */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg text-white font-medium flex items-center gap-2">
                        {loading ? (
                            <span className="animate-pulse">Analyzing {symbol}...</span>
                        ) : (
                            <>
                                The intraday bias on <span className="font-bold">{symbol}</span> is 
                                <span className={clsx("font-bold ml-1", {
                                    "text-green-400": analysis?.bias.includes("Bullish"),
                                    "text-red-400": analysis?.bias.includes("Bearish"),
                                    "text-yellow-400": analysis?.bias === "Neutral"
                                })}>
                                    {analysis?.bias.toLowerCase()}
                                </span>
                            </>
                        )}
                    </h3>
                    <button 
                        onClick={generateBias}
                        disabled={loading}
                        className="text-primary hover:text-white transition-colors"
                        title="Regenerate with AI"
                    >
                        <Sparkles size={14} className={clsx({ "animate-spin": loading })} />
                    </button>
                    <Info size={14} className="text-text-muted cursor-help hover:text-white transition-colors" />
                </div>

                {!loading && analysis && (
                    <span className={clsx("text-xs px-2 py-1 rounded border", {
                       "text-green-500 bg-green-500/10 border-green-500/20": analysis.confidence === 'High',
                       "text-yellow-500 bg-yellow-500/10 border-yellow-500/20": analysis.confidence === 'Medium',
                       "text-red-500 bg-red-500/10 border-red-500/20": analysis.confidence === 'Low',
                    })}>
                        {analysis.confidence} Confidence
                    </span>
                )}
            </div>
            
            <div className="relative z-10 min-h-[60px]">
                 {loading ? (
                     <div className="space-y-2">
                         <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse"></div>
                         <div className="h-4 bg-white/5 rounded w-1/2 animate-pulse"></div>
                     </div>
                 ) : (
                     <p className="text-sm text-text-muted leading-relaxed max-w-4xl animate-in fade-in slide-in-from-bottom-2">
                        {analysis?.summary}
                     </p>
                 )}
            </div>

            {!loading && analysis && (
                <div className="mt-4 flex gap-8 relative z-10 animate-in fade-in slide-in-from-bottom-3 delay-100">
                    <div className="text-xs">
                        <div className="text-primary font-bold mb-1">What supports the bias?</div>
                        <div className="text-white/60">{analysis.drivers.join(", ")}</div>
                    </div>
                    <div className="text-xs">
                        <div className="text-red-400 font-bold mb-1">Risks to the bias?</div>
                        <div className="text-white/60">{analysis.risks.join(", ")}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
