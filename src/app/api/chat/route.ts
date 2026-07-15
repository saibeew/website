import { NextResponse } from "next/server";
import { z } from "zod";
import { getAiResponse } from "@/lib/ai";
import { getCurrentUser, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import { enforceRateLimit, rejectOversizedRequest } from "@/lib/security/rate-limit";

const chatSchema = z.object({ message: z.string().trim().min(1).max(4_000) });

export async function POST(req: Request) {
  try {
    const sizeError = rejectOversizedRequest(req, 8_192);
    if (sizeError) return sizeError;
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    const rateLimitError = enforceRateLimit(req, { namespace: "ai-chat", key: user.id, limit: 20, windowMs: 60_000 });
    if (rateLimitError) return rateLimitError;
    const { message } = chatSchema.parse(await req.json());

    const prompt = `
        You are "beew.ai AI", a professional institutional trading co-pilot.
        Provide high-level technical analysis, market commentary, or educational insights based on the user's request.
        Keep responses professional, concise, and institutional in tone. Use markdown formatting for clarity.
        
        User Request: ${message}
    `;

    const reply = await getAiResponse(prompt);
    
    return NextResponse.json({ reply });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid chat request." }, { status: 400 });
    }
    return serverErrorResponse(error);
  }
}
