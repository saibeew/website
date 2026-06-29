"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Target, TrendingUp, TrendingDown, BookOpen } from "lucide-react";

interface PlaybookProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
}

export default function InstitutionalPlaybook({ isOpen, onClose, event }: PlaybookProps) {
  if (!event || !event.playbook) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           {/* Backdrop */}
           <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
           />

           {/* Modal */}
           <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0B0F1A] border border-primary/30 rounded-2xl shadow-[0_0_50px_rgba(14,242,177,0.1)] overflow-hidden"
           >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-gradient-to-r from-primary/5 to-transparent">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                       <BookOpen size={20} />
                    </div>
                    <div>
                       <div className="text-xs text-primary font-bold uppercase tracking-wider">Institutional Narrative</div>
                       <h2 className="text-xl font-bold text-white">{event.event}</h2>
                    </div>
                 </div>
                 <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/60 hover:text-white transition-colors">
                    <X size={20} />
                 </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                       <div className="text-xs text-text-muted mb-1">Bias</div>
                       <div className="text-lg font-bold text-white flex items-center gap-2">
                          {event.playbook.bias.includes("Bullish") ? <TrendingUp size={18} className="text-green-500" /> : <TrendingDown size={18} className="text-red-500" />}
                          {event.playbook.bias}
                       </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                       <div className="text-xs text-text-muted mb-1">Bank Consensus</div>
                       <div className="text-lg font-bold text-white font-mono">{event.bankForecast}</div>
                    </div>
                 </div>

                 <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                    <div className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wide">AI Scenario Analysis</div>
                    <p className="text-white/90 leading-relaxed text-sm">
                       {event.playbook.scenario}
                    </p>
                 </div>

                 <div>
                    <div className="text-xs font-bold text-text-muted uppercase mb-3 flex items-center gap-2">
                       <Target size={14} /> Actionable Targets
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {event.playbook.targets.map((target: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 rounded-lg bg-surface border border-white/10 text-sm text-white font-mono hover:border-primary/50 transition-colors cursor-default">
                             {target}
                          </span>
                       ))}
                    </div>
                 </div>
              </div>
           </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
