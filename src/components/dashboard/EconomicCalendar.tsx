"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ChevronRight, BarChart2, Filter } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

interface Event {
  id: string;
  time: string;
  currency: string;
  impact: string;
  event: string;
  actual: string;
  forecast: string;
  previous: string;
  bankForecast: string;
  playbook: any;
}

export default function EconomicCalendar({ events, onEventClick }: { events: Event[], onEventClick: (e: Event) => void }) {
  const [filter, setFilter] = useState<"ALL" | "High" | "Medium" | "Low">("ALL");

  const filteredEvents = events.filter(item => {
     if (filter === "ALL") return true;
     return item.impact === filter;
  });

  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
      {/* Header & Filters */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
         <h3 className="font-bold text-white flex items-center gap-2">
            Global Economic Events 
            <span className="text-xs font-normal text-text-muted px-2 py-0.5 rounded bg-white/5">GMT+5:30</span>
         </h3>
         <div className="flex bg-white/5 rounded-lg p-1 gap-1">
             {(["ALL", "High", "Medium", "Low"] as const).map((f) => (
                <button
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === f ? 'bg-primary text-black shadow-[0_0_10px_rgba(14,242,177,0.4)]' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                >
                   {f}
                </button>
             ))}
         </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/10 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-white/2">
        <div className="col-span-1">Time</div>
        <div className="col-span-1">Cur</div>
        <div className="col-span-4">Event</div>
        <div className="col-span-1 text-center">Imp</div>
        <div className="col-span-1 text-right">Act</div>
        <div className="col-span-1 text-right">Fcst</div>
        <div className="col-span-1 text-right">Prev</div>
        <div className="col-span-2 text-right">Bank Range</div>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredEvents.map((item, i) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onEventClick(item)}
            className="grid grid-cols-12 gap-2 p-4 border-b border-white/5 items-center hover:bg-white/5 cursor-pointer transition-colors group"
          >
            <div className="col-span-1 text-sm font-mono text-white/70">{item.time}</div>
            
            <div className="col-span-1">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${item.currency === 'USD' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {item.currency}
                </span>
            </div>
            
            <div className="col-span-4 font-medium text-white flex items-center gap-2">
               {item.event}
               {item.playbook && <BarChart2 size={12} className="text-primary opacity-50 group-hover:opacity-100" />}
            </div>

            <div className="col-span-1 flex justify-center">
               <div className={`w-2 h-2 rounded-full ${item.impact === 'High' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : item.impact === 'Medium' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
            </div>

            <div className="col-span-1 text-right font-mono text-white">{item.actual}</div>
            <div className="col-span-1 text-right font-mono text-text-muted">{item.forecast}</div>
            <div className="col-span-1 text-right font-mono text-text-muted">{item.previous}</div>
            
            <div className="col-span-2 flex justify-end">
               <span className="text-xs font-mono text-indigo-300 border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 rounded">
                  {item.bankForecast}
               </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
