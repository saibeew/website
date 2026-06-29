"use client";

import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";
import { AlertCircle, TrendingDown, Clock, XCircle } from "lucide-react";
import { staggerContainer, slideUp } from "@/lib/animations";

const PROBLEMS = [
  {
    icon: TrendingDown,
    title: "Market Volatility",
    desc: "Traditional traders lose 80% of capital in high-volatility events due to emotional decisions."
  },
  {
    icon: Clock,
    title: "Time Constraints",
    desc: "Manual trading is a full-time job. Who has 14 hours a day to stare at charts?"
  },
  {
    icon: AlertCircle,
    title: "Lack of Strategy",
    desc: "Relying on 'gut feeling' instead of proven, data-driven, backtested models."
  },
  {
    icon: XCircle,
    title: "Complex Tools",
    desc: "Platforms are either too simplistic (e.g., Robinhood) or require complex coding (e.g., Python)."
  }
];

export default function ProblemSection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <motion.div 
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
        >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">The Old Way <span className="text-red-500">Is Broken</span></h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
              Most traders fail because the market is designed to extract wealth from human emotion.
            </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {PROBLEMS.map((prob, idx) => (
            <motion.div key={idx} variants={slideUp}>
              <GlassCard className="h-full p-8 border-t-red-500/20 hover:border-red-500 shadow-none hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]" glowColor="danger" hoverEffect={true}>
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 text-red-500">
                  <prob.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{prob.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{prob.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
