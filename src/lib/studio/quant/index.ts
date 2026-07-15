import { getLatestMarketSignals, type SignalType } from "./signal-analyzer";
import { generateContentScript, type GeneratedScript } from "./script-generator";
import { generateChartExplainerSvg } from "./chart-renderer";

export interface QuantContentResult {
  signal: SignalType;
  script: GeneratedScript;
  chartUrl: string;
}

export async function createQuantContent(symbol?: string, customDescription?: string): Promise<QuantContentResult> {
  const signals = await getLatestMarketSignals();
  const customSignal: SignalType | null = customDescription?.trim()
    ? {
        title: customDescription.trim().slice(0, 120),
        source: "Beew Studio Brief",
        bias: "Neutral",
        symbol: symbol?.trim().toUpperCase() || "CUSTOM",
        description: customDescription.trim(),
      }
    : null;

  // Pick matching signal or default to the first one
  const baseSignal = customSignal || (symbol ? signals.find((s) => s.symbol.toLowerCase() === symbol.toLowerCase()) : null) || signals[0];
  if (!baseSignal) throw new Error("No current market signal is available.");
  const signal = customDescription?.trim()
    ? {
        ...baseSignal,
        title: symbol === "CUSTOM" ? customDescription.trim().slice(0, 120) : baseSignal.title,
        symbol: symbol === "CUSTOM" ? "CUSTOM" : baseSignal.symbol,
        description: customDescription.trim(),
        source: "Beew Studio Brief",
      }
    : baseSignal;

  console.log(`[Quant] Generating content for ${signal.symbol}...`);
  const [script, chartUrl] = await Promise.all([
    generateContentScript(signal),
    generateChartExplainerSvg(signal),
  ]);

  return {
    signal,
    script,
    chartUrl,
  };
}

export { getLatestMarketSignals, type SignalType };
export { generateContentScript, type GeneratedScript };
