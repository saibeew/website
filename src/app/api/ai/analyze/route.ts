import { NextResponse } from "next/server";
import { z } from "zod";
import { getAiResponse } from "@/lib/ai";
import { getCurrentUser, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import { enforceRateLimit, rejectOversizedRequest } from "@/lib/security/rate-limit";

const analysisSchema = z.object({
    symbol: z.string().trim().min(1).max(24).regex(/^[A-Za-z0-9._/-]+$/),
    context: z.unknown().optional(),
});

export async function POST(req: Request) {
    try {
        const sizeError = rejectOversizedRequest(req, 32_768);
        if (sizeError) return sizeError;
        const user = await getCurrentUser();
        if (!user) return unauthorizedResponse();
        const rateLimitError = enforceRateLimit(req, { namespace: "ai-analysis", key: user.id, limit: 20, windowMs: 60_000 });
        if (rateLimitError) return rateLimitError;
        const { symbol, context } = analysisSchema.parse(await req.json());
        const serializedContext = JSON.stringify(context ?? null);
        if (serializedContext.length > 20_000) {
            return NextResponse.json({ error: "Analysis context is too large." }, { status: 413 });
        }

        const prompt = `
            You are an institutional-grade financial analyst "beew.ai AI". 
            Analyze the following market data for ${symbol}.
            Context: ${serializedContext}

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
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(text || "{}");
        } catch {
            jsonResponse = {
                bias: "Neutral",
                confidence: "Low",
                summary: text || "Unable to parse AI response.",
                drivers: [],
                risks: [],
            };
        }

        return NextResponse.json(jsonResponse);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid analysis request." }, { status: 400 });
        }
        return serverErrorResponse(error);
    }
}
