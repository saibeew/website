"use client";

import { useState, useEffect } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Activity, Server, Zap, Globe } from "lucide-react";

export default function SystemHealth() {
  const [stats, setStats] = useState({
    latency: "12ms",
    cpu: "24%",
    bridge: "Active",
    nodes: 8
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        latency: `${Math.floor(Math.random() * 20) + 5}ms`,
        cpu: `${Math.floor(Math.random() * 10) + 20}%`,
        bridge: "Active",
        nodes: 8 + (Math.random() > 0.8 ? 1 : 0)
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      <GlassCard className="p-3 bg-white/[0.02]" hoverEffect={false}>
          <div className="flex items-center gap-3 mb-2">
              <Server size={14} className="text-blue-400" />
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Main Server</span>
          </div>
          <div className="text-lg font-bold text-white">NYC-01</div>
          <div className="text-[10px] text-green-500 font-bold uppercase mt-1">Operational</div>
      </GlassCard>

      <GlassCard className="p-3 bg-white/[0.02]" hoverEffect={false}>
          <div className="flex items-center gap-3 mb-2">
              <Zap size={14} className="text-yellow-400" />
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Bridge Latency</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">{stats.latency}</div>
          <div className="text-[10px] text-text-muted mt-1 uppercase tracking-widest">{stats.bridge}</div>
      </GlassCard>

      <GlassCard className="p-3 bg-white/[0.02]" hoverEffect={false}>
          <div className="flex items-center gap-3 mb-2">
              <Activity size={14} className="text-purple-400" />
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Execution Load</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">{stats.cpu}</div>
          <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
             <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: stats.cpu }} />
          </div>
      </GlassCard>

      <GlassCard className="p-3 bg-white/[0.02]" hoverEffect={false}>
          <div className="flex items-center gap-3 mb-2">
              <Globe size={14} className="text-green-400" />
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Active Nodes</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">{stats.nodes}/10</div>
          <div className="flex gap-1 mt-2">
             {[...Array(10)].map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < stats.nodes ? 'bg-green-500' : 'bg-white/10'}`} />
             ))}
          </div>
      </GlassCard>
    </div>
  );
}
