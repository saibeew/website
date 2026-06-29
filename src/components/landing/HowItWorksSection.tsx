"use client";

import { motion } from "framer-motion";
import { useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import GlassCard from "../ui/GlassCard";

const STEPS = [
  {
    num: "01",
    title: "Connect Exchange",
    desc: "Seamlessly link your Binance, Kraken, or Coinbase account via secure API keys."
  },
  {
    num: "02",
    title: "Build or Clone",
    desc: "Use our drag-and-drop editor to build a strategy, or clone a profitable one from the marketplace."
  },
  {
    num: "03",
    title: "Backtest Instantly",
    desc: "Run your strategy against 5 years of historical data in seconds to verify performance."
  },
  {
    num: "04",
    title: "Go Live",
    desc: "Deploy with one click. Our cloud servers run your strategy 24/7 with 99.9% uptime."
  }
];

export default function HowItWorksSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="py-24 px-6 relative" ref={containerRef}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4 neon-text">How It Works</h2>
            <p className="text-text-muted">From zero to automated trading in 4 simple steps.</p>
        </div>

        <div className="relative">
          {/* Central Line */}
          <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-1 bg-white/5 -translate-x-1/2 rounded-full hidden md:block" />
          <motion.div 
             className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-1 bg-primary/50 shadow-[0_0_10px_rgba(14,242,177,0.5)] -translate-x-1/2 rounded-full origin-top hidden md:block"
             style={{ height: lineHeight }}
          />

          <div className="flex flex-col gap-16 md:gap-24">
            {STEPS.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${idx % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
              >
                {/* Number / Node */}
                <div className="relative z-10 shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-surface border border-primary/50 flex items-center justify-center text-xl md:text-2xl font-bold text-primary shadow-[0_0_20px_rgba(14,242,177,0.2)]">
                    {step.num}
                  </div>
                </div>

                {/* Content Card */}
                <div className={`flex-1 ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'} text-center w-full`}>
                   <GlassCard className="p-8 inline-block w-full md:max-w-lg hover:border-primary/50 transition-colors" hoverEffect={true}>
                      <h3 className="text-2xl font-bold mb-3 text-white">{step.title}</h3>
                      <p className="text-text-muted leading-relaxed">{step.desc}</p>
                   </GlassCard>
                </div>
                
                {/* Empty Spacer for alternating layout */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
