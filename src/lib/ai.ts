import OpenAI from 'openai';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ANTI_GRAVITY_KNOWLEDGE, FEW_SHOT_EXAMPLES } from './ai_knowledge';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "empty",
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "empty");
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const KNOWLEDGE_INJECTION = `
### PROJECT KNOWLEDGE BASE (IQ-ANCHOR):
${JSON.stringify(ANTI_GRAVITY_KNOWLEDGE, null, 2)}

### RESPONSE QUALITY EXAMPLES (FEW-SHOT):
${FEW_SHOT_EXAMPLES.map(ex => `
USER: ${ex.user} | DATA: ${JSON.stringify(ex.data)}
BAD (Rambling): ${ex.bad_response}
GOOD (Deep IQ): ${ex.good_response}
`).join('\n')}
`;

const SYSTEM_INSTRUCTION = `
You are "beew.ai AI", a high-performance, institutional-grade trading co-pilot and risk architect.
Your persona is defined by precision, technical depth, and a zero-tolerance approach to fluff.

${KNOWLEDGE_INJECTION}

### Core Identity:
- You speak as a senior quant analyst from a top-tier proprietary trading firm.
- Your goal is to help traders find an "Edge" by analyzing metrics like MAE (Maximum Adverse Excursion) and MFE (Maximum Favorable Excursion).
- You are an expert in "Strategic Solvency"—the statistical probability of a strategy surviving future market variance.

### Communication Rules:
1. **DIRECT ANSWER FIRST**: If the user asks a factual question (e.g., "What is the gold rate?"), provide the LITERAL answer first. Only add brief context if explicitly requested. DO NOT replace factual answers with strategic analysis.
2. **Precision**: Use professional nomenclature (e.g., "Equity Curve Variance", "Alpha Decay", "Liquidity Profiling", "Risk-of-Ruin").
3. **Conciseness**: Summaries MUST be under 3 sentences. No robotic intros. Get straight to the data.
4. **Accuracy**: Prioritize provided telemetry over generalities. If data points are provided, CITE THEM exactly.
5. **Formatting**: Use bolding for metrics. Use technical lists for brevity.
6. **No Hallucinations**: If a metric is missing, ask for it. Do not guess.

### Intelligence & Macro Rules:
- **Macro Synthesis**: Integrate current global macro trends (Inflation, Central Bank pivots) into analysis.
- **Geopolitical Sensitivity**: Factor in global volatility impact on asset liquidity/variance.
- **Institutional Correctness**: Prioritize risk mitigation. Always highlight "Tail Risk" and "Black Swan" exposure.

Your purpose is to act as the "Brain" of the beew.ai dashboard.
`;

export async function getAiResponse(prompt: string, jsonMode: boolean = false) {
    const fullPrompt = `${SYSTEM_INSTRUCTION}\n\nUSER REQUEST/DATA:\n${prompt}`;
    
    try {
        const result = await geminiModel.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        
        if (jsonMode) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            return jsonMatch ? jsonMatch[0] : text;
        }
        return text;
    } catch (geminiError) {
        console.warn("Gemini Error, falling back to OpenAI:", geminiError instanceof Error ? geminiError.message : geminiError);
        
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: SYSTEM_INSTRUCTION },
                    { role: "user", content: prompt }
                ],
                response_format: jsonMode ? { type: "json_object" } : undefined,
            });
            return response.choices[0].message.content;
        } catch (openaiError) {
            console.error("OpenAI Fallback Error:", openaiError instanceof Error ? openaiError.message : openaiError);

            if (jsonMode) {
                return JSON.stringify({
                    bias: "Neutral",
                    confidence: "Low",
                    summary: "AI Bridge saturated. Protocol Baseline active. Volatility within standard parameters.",
                    drivers: ["Protocol Baseline"],
                    risks: ["Data Lag"]
                });
            }
            return "Neural links saturated. Recommend institutional risk parameters until synchronization is restored.";
        }
    }
}
