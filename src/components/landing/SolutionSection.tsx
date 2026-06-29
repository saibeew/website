"use client";

import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";
import NeonButton from "../ui/NeonButton";
import { Brain, Cpu, Globe, Rocket } from "lucide-react";
import Magnetic from "../ui/Magnetic";

export default function SolutionSection() {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/30 rounded-full text-secondary text-sm font-medium mb-6">
            <Brain size={14} />
            <span>AI-Driven Architecture</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Institutional-Grade <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B8CFF] to-[#0EF2B1]">Made Simple</span>
          </h2>
          
          <p className="text-text-muted text-lg mb-8 leading-relaxed">
            BEWE democratizes hedge-fund technology. We replaced complex coding with visual nodes, and emotional trading with cold, hard AI logic.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <Cpu size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">No-Code Algorithms</h4>
                <p className="text-sm text-text-muted">Drag-and-drop strategy builder.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <Globe size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Universal Access</h4>
                <p className="text-sm text-text-muted">Trade Crypto, Stocks, & Forex.</p>
              </div>
            </div>
          </div>

          <Magnetic>
             <NeonButton variant="accent" size="lg" icon={<Rocket size={18} />}>
               Start Automating Now
             </NeonButton>
          </Magnetic>
        </motion.div>

        {/* Right Visual */}
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
           className="relative"
        >
             {/* Abstract UI representation */}
             <GlassCard className="p-0 overflow-hidden !bg-black/40 border-secondary/20" glowColor="secondary">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                   <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/50" />
                   </div>
                   <div className="text-xs text-text-muted">BEWE Strategy Engine.exe</div>
                </div>
                <div className="p-8 relative min-h-[400px] flex items-center justify-center">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary/10 to-transparent" />
                   
                   {/* Node Graph Mockup */}
                   <div className="relative z-10 w-full max-w-sm">
                      <div className="flex justify-between mb-8">
                         <div className="p-4 bg-surface border border-white/10 rounded-xl shadow-lg">
                            <div className="text-xs text-secondary mb-1">Input Source</div>
                            <div className="font-bold">Binance BTC/USDT</div>
                         </div>
                         <div className="p-4 bg-surface border border-white/10 rounded-xl shadow-lg">
                             <div className="text-xs text-accent mb-1">Condition</div>
                             <div className="font-bold">RSI &lt; 30</div>
                         </div>
                      </div>
                      
                      {/* Connecting lines (SVG) */}
                      <svg className="absolute top-1/2 left-0 w-full h-20 -z-10 -translate-y-1/2 pointer-events-none">
                         <path d="M 80 20 C 150 20, 150 80, 220 80" stroke="rgba(91, 140, 255, 0.5)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                         <path d="M 280 80 C 320 80, 320 20, 360 20" stroke="rgba(0, 239, 107, 0.5)" strokeWidth="2" fill="none" />
                      </svg>

                      <div className="flex justify-center mt-12">
                          <div className="p-4 bg-accent/10 border border-accent/50 rounded-xl shadow-[0_0_30px_rgba(0,239,107,0.2)]">
                             <div className="text-xs text-accent mb-1">Action</div>
                             <div className="font-bold text-white">Execute Buy Order</div>
                          </div>
                      </div>
                   </div>
                </div>
             </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
