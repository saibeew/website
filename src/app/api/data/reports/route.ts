import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";

export const dynamic = "force-dynamic";

const reportSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  bias: z.enum(["Bullish", "Bearish", "Neutral", "Slightly Bullish", "Slightly Bearish"]),
  symbol: z.string().min(1),
  tags: z.array(z.string()).default([]),
  content: z.string().optional(),
});

export async function GET() {
  try {
    const reports = await getSql()`
      select id, created_at, title, summary, bias, symbol, tags, content
      from market_reports
      order by created_at desc
      limit 10
    `;

    return NextResponse.json({ reports });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const input = reportSchema.parse(await request.json());
    const [report] = await getSql()`
      insert into market_reports (title, summary, bias, symbol, tags, content, author_id)
      values (${input.title}, ${input.summary}, ${input.bias}, ${input.symbol}, ${input.tags}, ${input.content || null}, ${user.id})
      returning id, created_at, title, summary, bias, symbol, tags, content
    `;

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
