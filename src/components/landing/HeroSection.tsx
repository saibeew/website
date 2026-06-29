"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import NeonButton from "../ui/NeonButton";
import GlassCard from "../ui/GlassCard";
import Magnetic from "../ui/Magnetic";
import { slideUp, staggerContainer, float, hologramFlicker } from "@/lib/animations";
import { ArrowRight, Activity, Zap, TrendingUp, Shield } from "lucide-react";
import TradingGlobe from "./TradingGlobe";

export default function HeroSection() {
  return (
    <section className="min-h-[95vh] flex items-center justify-center relative z-10 pt-20">
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-16 w-full max-w-7xl mx-auto px-6 items-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Text Content */}
        <motion.div className="flex flex-col gap-6 items-center md:items-start text-center md:text-left" variants={slideUp}>
          <motion.div variants={hologramFlicker} className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full text-primary text-sm font-medium">
            <Zap size={14} className="text-primary" />
            <span>Wealth Generation Engine V3.0</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl leading-tight font-extrabold tracking-tighter neon-text">
            Build Wealth With <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0EF2B1] to-[#5B8CFF] pb-2">AI Intelligence</span>
          </h1>
          
          <p className="text-xl text-text-muted max-w-[500px] leading-relaxed">
            The world’s most advanced AI-powered trading ecosystem — fast, visual, and truly universal.
          </p>
          
          <div className="flex gap-4 mt-4">
            <Link href="/login">
              <Magnetic>
                <NeonButton variant="primary" size="lg" icon={<ArrowRight size={18} />}>
                  Launch App
                </NeonButton>
              </Magnetic>
            </Link>
            <a href="#features">
              <Magnetic>
                <NeonButton variant="secondary" size="lg">
                  View Strategies
                </NeonButton>
              </Magnetic>
            </a>
          </div>
          
          {/* Stats Bar */}
          <div className="flex items-center gap-8 mt-8 pt-8 border-t border-white/5 w-full md:w-auto justify-center md:justify-start">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">$4.2B+</span>
              <span className="text-sm text-text-muted">Volume Traded</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">12ms</span>
              <span className="text-sm text-text-muted">Latency</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">99.9%</span>
              <span className="text-sm text-text-muted">Uptime</span>
            </div>
          </div>
        </motion.div>

        {/* Visuals / Hologram with Trading Globe */}
        <motion.div 
          className="relative h-[650px] flex items-center justify-center pointer-events-auto" 
          variants={slideUp}
        >
          {/* Background Globe Animation */}
          <div className="absolute inset-0 z-0">
            <TradingGlobe />
          </div>

          {/* Secondary Floating Elements */}
          <motion.div 
            className="absolute right-0 bottom-[150px] z-30"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
             <GlassCard glowColor="accent" className="flex items-center gap-3 p-4 !min-w-[180px]">
               <Activity size={20} className="text-accent" />
               <div>
                 <div className="text-xs text-text-muted">AI Global Bias</div>
                 <div className="font-bold text-accent">Bullish Liquidity</div>
               </div>
             </GlassCard>
          </motion.div>
          
          <motion.div 
            className="absolute left-0 top-[150px] z-20"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
             <GlassCard glowColor="secondary" className="flex items-center gap-3 p-4 !min-w-[160px]">
               <TrendingUp size={20} className="text-secondary" />
               <div>
                 <div className="text-xs text-text-muted">Active Flows</div>
                 <div className="font-bold text-accent">+8.2T/Day</div>
               </div>
             </GlassCard>
          </motion.div>
           
          {/* Bottom Gradient Fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
        </motion.div>
      </motion.div>
    </section>
  );
}
