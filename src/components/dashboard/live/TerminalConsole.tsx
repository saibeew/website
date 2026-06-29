"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";

export default function TerminalConsole() {
  const { terminalLogs } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  return (
    <div className="w-full h-full bg-black/40 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden flex flex-col font-mono text-[11px]">
      <div className="p-2 border-b border-white/5 bg-white/5 flex justify-between items-center">
        <div className="flex gap-1.5 items-center">
          <div className="w-2 h-2 rounded-full bg-red-500/50" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
          <div className="w-2 h-2 rounded-full bg-green-500/50" />
          <span className="ml-2 text-text-muted uppercase tracking-widest font-bold text-[9px]">Execution Bridge Console</span>
        </div>
        <div className="text-[9px] text-primary/70 animate-pulse">● LIVE STREAM</div>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10"
      >
        {terminalLogs.map((log, i) => (
          <div key={i} className="flex gap-3 leading-relaxed">
            <span className="text-white/20 shrink-0">{(i + 1).toString().padStart(3, '0')}</span>
            <span className={
                log.includes("Error") ? "text-red-400" : 
                log.includes("Success") || log.includes("OK") ? "text-green-400" : 
                log.includes("AI") ? "text-primary" : 
                "text-white/70"
            }>
              {log}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
