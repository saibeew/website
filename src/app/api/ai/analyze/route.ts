import { NextResponse } from "next/server";
import { getAiResponse } from "@/lib/ai";

export async function POST(req: Request) {
    try {
        const { symbol, context } = await req.json();

        if (!symbol) {
            return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
        }

        const prompt = `
            You are an institutional-grade financial analyst "Anti-Gravity AI". 
            Analyze the following market data for ${symbol}.
            Context: ${JSON.stringify(context)}

            Return a strict JSON response in the following format:
            {
                "bias": "Bullish" | "Bearish" | "Neutral" | "Slightly Bullish" | "Slightly Bearish",
                "confidence": "High" | "Medium" | "Low",
                "summary": "Concise 2-sentence summary of technical/fundamental situation.",
                "drivers": ["Driver 1", "Driver 2"],
                "risks": ["Risk 1", "Risk 2"]
            }
        `;

        const text = await getAiResponse(prompt, true);
        const jsonResponse = JSON.parse(text || "{}");

        return NextResponse.json(jsonResponse);

    } catch (error: any) {
        console.error("AI Analysis Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
