"use client";

import { MoreHorizontal, Share2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsItem {
  id: string;
  time: string;
  tags: string[];
  headline: string;
  summary?: string;
  sentiment: string;
}

export default function NewsFeedSider({ news }: { news: NewsItem[] }) {
  return (
    <div className="h-full flex flex-col bg-surface/30 border-l border-white/5">
       {/* Sidebar Header */}
       <div className="p-4 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
             <h3 className="text-sm font-bold text-white">News Feed</h3>
          </div>
          <button className="text-text-muted hover:text-white">
             <MoreHorizontal size={16} />
          </button>
       </div>

       {/* Tabs */}
       <div className="flex px-4 pt-4 gap-4 text-xs font-bold text-text-muted border-b border-white/5">
          <button className="pb-2 text-white border-b-2 border-primary">All</button>
          <button className="pb-2 hover:text-white transition-colors">Popular</button>
          <button className="pb-2 hover:text-white transition-colors">Macro</button>
       </div>

       {/* Feed List */}
       <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          {news.map((item) => (
             <div key={item.id} className="group relative pl-4 border-l-2 border-white/5 hover:border-primary/50 transition-all">
                <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-surface border-2 border-white/10 group-hover:border-primary group-hover:scale-110 transition-all"></div>
                
                <div className="text-[10px] text-text-muted font-mono mb-2 flex items-center gap-2">
                   {item.time}
                   <span className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                      item.sentiment === 'Bullish' ? 'bg-green-500/10 text-green-400' : 
                      item.sentiment === 'Bearish' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                   )}>
                      {item.sentiment}
                   </span>
                </div>
                
                <h4 className="text-sm text-white font-medium leading-snug mb-2 group-hover:text-primary/90 transition-colors">
                   {item.headline}
                </h4>

                {item.summary && (
                   <p className="text-xs text-text-muted leading-relaxed mb-3 line-clamp-3">
                      {item.summary}
                   </p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                   {item.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-text-muted font-medium">
                         {tag}
                      </span>
                   ))}
                </div>

                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="p-1.5 rounded-md hover:bg-white/10 text-text-muted hover:text-white transition-colors"><Share2 size={12} /></button>
                   <button className="p-1.5 rounded-md hover:bg-white/10 text-text-muted hover:text-white transition-colors"><Copy size={12} /></button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}
