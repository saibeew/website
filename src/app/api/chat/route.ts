import { NextResponse } from "next/server";
import { getAiResponse } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const prompt = `
        You are "beew.ai AI", a professional institutional trading co-pilot.
        Provide high-level technical analysis, market commentary, or educational insights based on the user's request.
        Keep responses professional, concise, and institutional in tone. Use markdown formatting for clarity.
        
        User Request: ${message}
    `;

    const reply = await getAiResponse(prompt);
    
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: `Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
