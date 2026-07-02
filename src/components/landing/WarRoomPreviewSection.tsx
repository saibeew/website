"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Newspaper } from "lucide-react";

type WarRoomItem = {
  source: string;
  title: string;
  severity: "High" | "Medium" | "Low";
  timestamp: string;
};

type NewsApiItem = {
  source?: string;
  title: string;
  category?: string;
  collected_at?: string | null;
};

const fallbackItems: WarRoomItem[] = [
  { source: "Example feed", title: "Fed statement reprices USD risk before New York session", severity: "High", timestamp: "4m ago" },
  { source: "Example feed", title: "Gold volatility rises as safe-haven flows accelerate", severity: "Medium", timestamp: "11m ago" },
  { source: "Example feed", title: "Euro data mixed; directional bias remains cautious", severity: "Low", timestamp: "18m ago" },
  { source: "Example feed", title: "JPY intervention risk monitored near key levels", severity: "High", timestamp: "27m ago" },
];

function inferSeverity(category?: string): WarRoomItem["severity"] {
  if (category === "breaking" || category === "geopolitical" || category === "macro") return "High";
  if (category === "commodity" || category === "forex") return "Medium";
  return "Low";
}

export default function WarRoomPreviewSection() {
  const [items, setItems] = useState<WarRoomItem[]>(fallbackItems);

  useEffect(() => {
    let alive = true;

    const loadNews = async () => {
      try {
        const response = await fetch("/api/news?limit=5", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        const nextItems = ((data.items || []) as NewsApiItem[]).slice(0, 5).map((item) => ({
          source: item.source || "beew.ai feed",
          title: item.title,
          severity: inferSeverity(item.category),
          timestamp: item.collected_at ? new Date(item.collected_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Live",
        }));
        if (alive && nextItems.length > 0) setItems(nextItems);
      } catch {
        if (alive) setItems(fallbackItems);
      }
    };

    loadNews();
    const interval = window.setInterval(loadNews, 30000);
    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <section id="warroom" className="border-b border-white/10 px-5 py-16">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0ef2b1]/25 bg-[#0ef2b1]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#0ef2b1]">
            <span className="h-2 w-2 rounded-full bg-[#0ef2b1] animate-pulse" />
            Live
          </div>
          <h2 className="mt-4 text-3xl font-black md:text-4xl">The War Room - Live Macro Intelligence</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Severity-scored news, 24/7. This is what beta members see from day one - before they pay anything.
          </p>
          <a href="#apply" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#0ef2b1] hover:text-white">
            Apply to Access the Full Feed
            <ArrowRight size={15} />
          </a>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#0b1020] p-4">
          {items.map((item) => (
            <div key={`${item.source}-${item.title}`} className="flex items-start gap-4 border-b border-white/10 py-4 last:border-b-0">
              <div className={`min-w-20 rounded-md px-2 py-1 text-center text-[11px] font-black uppercase ${item.severity === "High" ? "bg-red-500/15 text-red-300" : item.severity === "Medium" ? "bg-amber-500/15 text-amber-300" : "bg-green-500/15 text-green-300"}`}>
                {item.severity}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  <Newspaper size={13} />
                  {item.source} - {item.timestamp}
                </div>
                <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
