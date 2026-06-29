"use client";

import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";
import { Newspaper, TrendingUp, BarChart3, Globe2 } from "lucide-react";
import Magnetic from "../ui/Magnetic";
import NeonButton from "../ui/NeonButton";

export default function FundamentalsSection() {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Visual - News/Fundamentals Dashboard Mockup */}
        <motion.div
           initial={{ opacity: 0, x: -50 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           className="order-2 lg:order-1"
        >
             <GlassCard className="p-0 overflow-hidden border-primary/20" glowColor="primary">
                <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                   <div className="font-bold text-white flex items-center gap-2">
                      <Newspaper size={18} className="text-primary" />
                      Global Sentiment Analysis
                   </div>
                   <div className="text-xs text-primary px-2 py-1 bg-primary/10 rounded">Live Feed</div>
                </div>
                
                <div className="p-6 flex flex-col gap-4">
                   {[
                      { source: "Bloomberg", title: "Fed signals rate cuts in Q4 2025", sentiment: "Bullish", score: 85 },
                      { source: "Reuters", title: "Tech sector earnings beat expectations", sentiment: "Bullish", score: 92 },
                      { source: "CoinDesk", title: "Bitcoin supply shock imminent post-halving", sentiment: "Very Bullish", score: 95 },
                      { source: "WSJ", title: "Manufacturing output slows slightly", sentiment: "Neutral", score: 45 }
                   ].map((news, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface/50 border border-white/5 hover:bg-white/5 transition-colors">
                         <div>
                            <div className="text-xs text-text-muted mb-1">{news.source}</div>
                            <div className="font-medium text-white text-sm">{news.title}</div>
                         </div>
                         <div className={`text-xs font-bold px-3 py-1 rounded-full ${news.score > 80 ? 'bg-green-500/20 text-green-500' : news.score > 50 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-500/20 text-gray-400'}`}>
                            {news.score}%
                         </div>
                      </div>
                   ))}
                </div>
             </GlassCard>
        </motion.div>

        {/* Right Content */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="order-1 lg:order-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-primary text-sm font-medium mb-6">
            <Globe2 size={14} />
            <span>Macro Intelligence</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Trade the News <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0EF2B1] to-[#00EF6B]">Before It Breaks</span>
          </h2>
          
          <p className="text-text-muted text-lg mb-8 leading-relaxed">
            Price action is only half the story. BEWE’s NLP engine scans 50,000+ news sources, earnings reports, and social feeds to predict market moves before they happen.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
             <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                   <BarChart3 size={20} />
                </div>
                <div>
                   <h4 className="font-bold text-white mb-1">Sentiment Scoring</h4>
                   <p className="text-sm text-text-muted">Real-time bullish/bearish index.</p>
                </div>
             </div>
             <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                   <TrendingUp size={20} />
                </div>
                <div>
                   <h4 className="font-bold text-white mb-1">Impact Prediction</h4>
                   <p className="text-sm text-text-muted">Know how assets react to events.</p>
                </div>
             </div>
          </div>

          <Magnetic>
             <NeonButton variant="primary" size="lg">
               Explore Intelligence
             </NeonButton>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}
