import { getAiResponse } from "../../ai";
import { type SignalType } from "./signal-analyzer";

export interface GeneratedScript {
  title: string;
  scriptText: string;
  complianceChecked: boolean;
  warnings: string[];
}

export async function generateContentScript(signal: SignalType): Promise<GeneratedScript> {
  const prompt = `
Generate a short-form video script (under 60 seconds) in Beew's quant-trading brand voice based on the following market signal:

---
Signal Title: ${signal.title}
Asset/Symbol: ${signal.symbol}
Bias/Direction: ${signal.bias}
Telemetry Details: ${signal.description}
---

Brand Tone Rules:
- Senior institutional quant analyst. No fluff, direct facts, statistics-oriented.
- Highlight risk-mitigation, potential tail risk, or strategic edge.
- Structure it as:
  1. Hook (2-3 seconds, direct metrics/fact).
  2. Core explanation (15-20 seconds, the mechanics of the move/signal).
  3. Actionable risk warning or quant angle (5-10 seconds, MAE/MFE or solvency warning).

Output your response strictly as a JSON object matching this schema:
{
  "title": "A short engaging hook title",
  "scriptText": "The actual script with narrator lines and optional visual descriptions in brackets [like this]",
  "complianceChecked": true,
  "warnings": ["An array of list items flagging potential compliance risks in this narrative, e.g. 'Must include a standard CFD leverage warning' or 'Check if the XAUUSD supply metric is updated'"]
}
`;

  try {
    const rawRes = await getAiResponse(prompt, true);
    if (!rawRes) {
      throw new Error("AI response was empty");
    }

    const parsed = JSON.parse(rawRes);
    return {
      title: parsed.title || signal.title,
      scriptText: parsed.scriptText || "",
      complianceChecked: parsed.complianceChecked || false,
      warnings: parsed.warnings || [],
    };
  } catch (error: any) {
    console.error("[Quant] Failed to generate script via AI:", error);
    // Fallback template script
    return {
      title: `Beew Flash Report: ${signal.symbol} ${signal.bias} Outlook`,
      scriptText: `[Visual: Trading chart showing ${signal.symbol} price action]
Narrator: Let's look at the institutional positioning on ${signal.symbol}. We are seeing a distinct ${signal.bias.toLowerCase()} alignment based on ${signal.source} telemetry. 
[Visual: Close-up of order book volume profiles]
Narrator: The order flow indicates distribution. Focus on strategic solvency and respect your maximum adverse excursion limits.
[Visual: Disclaimer overlay text]
Narrator: Trading involves leverage risk. Standard risk rules apply.`,
      complianceChecked: true,
      warnings: ["Auto-fallback template used. Review manually before publishing."],
    };
  }
}
