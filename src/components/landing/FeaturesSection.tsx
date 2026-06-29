"use client";

import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";
import { Zap, Cpu, Layers, Activity } from "lucide-react";
import { staggerContainer, slideUp, float } from "@/lib/animations";

const FEATURES = [
  {
    icon: Layers,
    title: "AI Strategy Builder",
    desc: "Turn ideas into live algorithms instantly using our visual node editor."
  },
  {
    icon: Activity,
    title: "Real-Time Market Engine",
    desc: "<500ms price feeds from multiple exchanges with immersive 3D visualization."
  },
  {
    icon: Zap,
    title: "Automated Execution",
    desc: "Execute smart trades with sub-second accuracy across all connected brokers."
  },
  {
    icon: Cpu,
    title: "Backtesting Lab",
    desc: "Run 1–5 year simulations and compare strategies with deep analytics."
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-6 relative z-10" id="features">
      <div className="max-w-7xl mx-auto">
        <motion.div 
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
        >
            <h2 className="text-3xl md:text-4xl font-bold neon-text">What Makes It Legendary</h2>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {FEATURES.map((feat, idx) => (
            <motion.div key={idx} variants={slideUp} className="h-full">
              <motion.div variants={float} animate="animate" className="h-full">
                <GlassCard className="h-full flex flex-col p-8" hoverEffect={true}>
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <feat.icon size={32} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{feat.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{feat.desc}</p>
                </GlassCard>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
