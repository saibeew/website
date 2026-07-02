"use client";

import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";
import { BarChart3, Globe2, Newspaper, TrendingUp } from "lucide-react";
import Magnetic from "../ui/Magnetic";
import NeonButton from "../ui/NeonButton";

const previewNews = [
  { source: "Example feed", title: "Fed statement reprices USD risk before New York session", score: 88 },
  { source: "Example feed", title: "Gold volatility rises as safe-haven flows accelerate", score: 82 },
  { source: "Example feed", title: "Euro data mixed; directional bias remains cautious", score: 54 },
  { source: "Example feed", title: "JPY intervention risk monitored near key levels", score: 76 },
];

export default function FundamentalsSection() {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
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
                War Room Intelligence
              </div>
              <div className="text-xs text-primary px-2 py-1 bg-primary/10 rounded">Preview</div>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {previewNews.map((news) => (
                <div key={news.title} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-surface/50 border border-white/5 hover:bg-white/5 transition-colors">
                  <div>
                    <div className="text-xs text-text-muted mb-1">{news.source}</div>
                    <div className="font-medium text-white text-sm">{news.title}</div>
                  </div>
                  <div className={`text-xs font-bold px-3 py-1 rounded-full ${news.score > 80 ? "bg-red-500/20 text-red-300" : news.score > 60 ? "bg-yellow-500/20 text-yellow-300" : "bg-green-500/20 text-green-300"}`}>
                    {news.score}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

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
            See the risk behind <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0EF2B1] to-[#00EF6B]">every market move</span>
          </h2>

          <p className="text-text-muted text-lg mb-8 leading-relaxed">
            Price action is only half the story. beew.ai adds severity-scored macro context so traders can see the fundamental driver behind major market moves.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <BarChart3 size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Severity Scoring</h4>
                <p className="text-sm text-text-muted">Risk context before execution.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">MT5 Context</h4>
                <p className="text-sm text-text-muted">Built around the EA workflow.</p>
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
