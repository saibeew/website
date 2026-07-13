import { NextResponse } from "next/server";
import { getCurrentUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth/user";
import { createQuantContent } from "@/lib/studio/quant";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const body = await req.json().catch(() => ({}));
    const symbol = body.symbol;
    const customDescription = typeof body.customDescription === "string" ? body.customDescription : undefined;

    const result = await createQuantContent(symbol, customDescription);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
