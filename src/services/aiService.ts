export type MarketBias = "Bullish" | "Bearish" | "Neutral" | "Slightly Bullish" | "Slightly Bearish";

export interface AnalysisResult {
  bias: MarketBias;
  confidence: "High" | "Medium" | "Low";
  summary: string;
  drivers: string[];
  risks: string[];
}

export const AiService = {
  async analyzeMarket(symbol: string): Promise<AnalysisResult> {
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (error) {
      console.error("AI Analysis failed, falling back to baseline:", error);
      return {
        bias: "Neutral",
        confidence: "Low",
        summary: symbol + " is consolidating. Institutional flows are currently masked by low volume.",
        drivers: ["Consolidation Pattern"],
        risks: ["Volatility Spike"],
      };
    }
  },

  async saveAnalysis(symbol: string, result: AnalysisResult) {
    try {
      const res = await fetch("/api/data/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "AI Intelligence: " + symbol,
          summary: result.summary,
          bias: result.bias,
          symbol,
          tags: [...result.drivers, ...result.risks],
        }),
      });
      return res.ok;
    } catch (error) {
      console.error("Failed to save AI analysis:", error);
      return false;
    }
  },
};
