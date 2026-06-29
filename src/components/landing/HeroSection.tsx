"use client";
import { motion } from "framer-motion";
import NeonButton from "../ui/NeonButton";
import Magnetic from "../ui/Magnetic";
import { slideUp, staggerContainer, hologramFlicker } from "@/lib/animations";
import { ArrowRight, Zap, Activity, TrendingUp, ShieldCheck, CheckCircle } from "lucide-react";
import TradingGlobe from "./TradingGlobe";
import GlassCard from "../ui/GlassCard";

const TRUST_ITEMS = [
  { icon: CheckCircle, text: "Backtested 2018–2026" },
  { icon: ShieldCheck, text: "You control your account" },
  { icon: ShieldCheck, text: "No fund-holding, ever" },
  { icon: CheckCircle, text: "Cancel anytime" },
];

export default function HeroSection() {
  const handleCTAClick = () => {
    const target = document.getElementById("register");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="min-h-[95vh] flex items-center justify-center relative z-10 pt-20"
    >
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-16 w-full max-w-7xl mx-auto px-6 items-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* ── Text Column ─────────────────────────────────────── */}
        <motion.div
          className="flex flex-col gap-6 items-center md:items-start text-center md:text-left"
          variants={slideUp}
        >
          {/* Badge */}
          <motion.div
            variants={hologramFlicker}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full text-primary text-sm font-medium"
          >
            <Zap size={14} className="text-primary" />
            <span>Beta Access — Limited Seats</span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl leading-tight font-extrabold tracking-tighter neon-text">
            Test the algo.{" "}
            <br />
            Use the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0EF2B1] to-[#5B8CFF] pb-2">
              war room.
            </span>
            <br />
            Pay only when you&apos;re satisfied.
          </h1>

          {/* Sub-headline */}
          <p className="text-xl text-text-muted max-w-[520px] leading-relaxed">
            A systematic MT5 trading system — backtested 2018–2026,
            forward-tested on your own account, with real-time market
            intelligence built in.
          </p>

          {/* CTA */}
          <div className="flex gap-4 mt-4">
            <Magnetic>
              <NeonButton
                id="hero-cta"
                variant="primary"
                size="lg"
                icon={<ArrowRight size={18} />}
                onClick={handleCTAClick}
              >
                Claim a Beta Seat
              </NeonButton>
            </Magnetic>
          </div>

          {/* Trust Strip */}
          <div className="mt-8 pt-8 border-t border-white/5 w-full">
            {/* Mobile: 2×2 grid  |  Desktop: single row */}
            <ul className="grid grid-cols-2 md:flex md:flex-row md:flex-wrap gap-x-6 gap-y-3">
              {TRUST_ITEMS.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-2 text-sm text-text-muted whitespace-nowrap"
                >
                  <Icon size={14} className="text-primary shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* ── Visual Column ───────────────────────────────────── */}
        <motion.div
          className="relative h-[650px] flex items-center justify-center pointer-events-auto"
          variants={slideUp}
        >
          {/* Globe */}
          <div className="absolute inset-0 z-0">
            <TradingGlobe />
          </div>

          {/* Floating card — AI Bias */}
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

          {/* Floating card — Active Flows */}
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

          {/* Bottom gradient fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
        </motion.div>
      </motion.div>
    </section>
  );
}
