import Link from "next/link";
import { fetchNewsById } from "@/lib/db";
import { notFound } from "next/navigation";
import { extractEntities } from "@/lib/entities";
import { Clock, ArrowLeft, ExternalLink, Cpu } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const item = fetchNewsById(Number(id));
  if (!item) return { title: "Article Not Found | BEEW" };
  return {
    title: `${item.title} | Market Intelligence | BEEW`,
    description: item.summary || item.title,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const item = fetchNewsById(Number(id));
  if (!item) notFound();

  const entities = extractEntities(item.title, item.summary || "");

  const pubDate = item.published_at ? new Date(item.published_at).toLocaleString() : null;
  const colDate = item.collected_at ? new Date(item.collected_at).toLocaleString() : null;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 text-white">
      <Link href="/dashboard/news" className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-primary transition-colors">
        <ArrowLeft size={14} />
        Back to feed
      </Link>

      <div className="bg-surface/20 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-primary/10 border-primary/20 text-primary">
            {item.category || "finance"}
          </span>
          {item.ai_summarized === 1 && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-secondary/10 border border-secondary/20 text-secondary flex items-center gap-1">
              <Cpu size={10} />
              ✦ AI Analyzed
            </span>
          )}
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-white leading-snug">
          {item.title}
        </h1>

        <div className="h-[1px] bg-white/10" />

        {item.summary && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider">Executive Summary</h4>
            <p className="text-sm text-text-muted leading-relaxed bg-white/5 border border-white/5 rounded-xl p-4">
              {item.summary}
            </p>
          </div>
        )}

        {entities.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-secondary uppercase tracking-wider">Impacted Assets & Market Exposure</h4>
            <div className="flex flex-wrap gap-2">
              {entities.map((e) => (
                <span key={e.name} className="text-xs px-3 py-1 bg-white/5 border border-white/10 text-white rounded-lg flex items-center gap-1.5">
                  <span>{e.icon}</span>
                  <span className="font-semibold">{e.name}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 border border-white/5 rounded-xl p-4 text-xs">
          <div>
            <span className="text-text-muted block text-[10px] uppercase font-medium">Source Wire</span>
            <span className="font-bold text-white mt-1 block">{item.source}</span>
          </div>
          <div>
            <span className="text-text-muted block text-[10px] uppercase font-medium">Published At</span>
            <span className="font-bold text-white mt-1 block">{pubDate || "N/A"}</span>
          </div>
          <div>
            <span className="text-text-muted block text-[10px] uppercase font-medium">Synced At</span>
            <span className="font-bold text-white mt-1 block">{colDate || "N/A"}</span>
          </div>
          <div>
            <span className="text-text-muted block text-[10px] uppercase font-medium">Article ID</span>
            <span className="font-bold text-white mt-1 block">#{item.id}</span>
          </div>
        </div>

        {item.link && (
          <div className="flex justify-end pt-2">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
            >
              Read Original Source
              <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
