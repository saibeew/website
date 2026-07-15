"use client";

import { useState, useEffect } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Activity, Database, Server, Zap } from "lucide-react";

export default function SystemHealth() {
  const [stats, setStats] = useState({
    latency: "Syncing",
    status: "Checking",
    database: "Checking",
    environment: "Checking",
  });

  useEffect(() => {
    const check = async () => {
      const started = performance.now();
      try {
        const response = await fetch("/api/health", { cache: "no-store" });
        const data = await response.json();
        setStats({
          latency: `${Math.round(performance.now() - started)}ms`,
          status: response.ok ? "Operational" : "Degraded",
          database: data.checks?.database ? "Connected" : "Unavailable",
          environment: data.checks?.environment ? "Valid" : "Incomplete",
        });
      } catch {
        setStats({ latency: "Unavailable", status: "Offline", database: "Unknown", environment: "Unknown" });
      }
    };
    void check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      <GlassCard className="p-3 bg-white/[0.02]" hoverEffect={false}>
          <div className="flex items-center gap-3 mb-2">
              <Server size={14} className="text-blue-400" />
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Main Server</span>
          </div>
          <div className="text-lg font-bold text-white">Application</div>
          <div className={`text-[10px] font-bold uppercase mt-1 ${stats.status === "Operational" ? "text-green-500" : "text-amber-400"}`}>{stats.status}</div>
      </GlassCard>

      <GlassCard className="p-3 bg-white/[0.02]" hoverEffect={false}>
          <div className="flex items-center gap-3 mb-2">
              <Zap size={14} className="text-yellow-400" />
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">API Latency</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">{stats.latency}</div>
          <div className="text-[10px] text-text-muted mt-1 uppercase tracking-widest">Health endpoint</div>
      </GlassCard>

      <GlassCard className="p-3 bg-white/[0.02]" hoverEffect={false}>
          <div className="flex items-center gap-3 mb-2">
              <Database size={14} className="text-purple-400" />
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Database</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">{stats.database}</div>
          <div className="text-[10px] text-text-muted mt-1 uppercase tracking-widest">PostgreSQL</div>
      </GlassCard>

      <GlassCard className="p-3 bg-white/[0.02]" hoverEffect={false}>
          <div className="flex items-center gap-3 mb-2">
              <Activity size={14} className="text-green-400" />
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Configuration</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">{stats.environment}</div>
          <div className="text-[10px] text-text-muted mt-1 uppercase tracking-widest">Required services</div>
      </GlassCard>
    </div>
  );
}
