import { NextResponse } from "next/server";
import { getCurrentUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth/user";
import { getTrendingTopics } from "@/lib/studio/trends";

export const dynamic = "force-dynamic";

function previewTrends() {
  const now = new Date().toISOString();
  return [
    { title: "Preview: How real yields shape gold momentum", link: "", source: "Beew preview dataset", category: "economy", pubDate: now, score: 8.4, tags: ["gold", "yield", "xauusd"] },
    { title: "Preview: FX volatility around central-bank decisions", link: "", source: "Beew preview dataset", category: "forex", pubDate: now, score: 7.9, tags: ["forex", "rate", "volatility"] },
    { title: "Preview: Liquidity risk in algorithmic crypto execution", link: "", source: "Beew preview dataset", category: "crypto", pubDate: now, score: 7.2, tags: ["crypto", "liquidity", "algorithmic"] },
  ];
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({ success: true, trends: previewTrends(), source: "preview" });
    }

    const trends = await getTrendingTopics();
    return NextResponse.json({ success: true, trends, source: "live" });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
