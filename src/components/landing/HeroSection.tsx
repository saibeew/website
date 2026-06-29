"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import NeonButton from "../ui/NeonButton";
import Magnetic from "../ui/Magnetic";
import { slideUp, staggerContainer, hologramFlicker } from "@/lib/animations";
import {
  ArrowRight,
  Zap,
  Activity,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Users,
  Clock,
} from "lucide-react";
import TradingGlobe from "./TradingGlobe";
import GlassCard from "../ui/GlassCard";

/* ─── Trust strip ───────────────────────────────────────────────── */
const TRUST_ITEMS = [
  { icon: CheckCircle, text: "Backtested 2018–2026" },
  { icon: ShieldCheck, text: "You control your account" },
  { icon: ShieldCheck, text: "No fund-holding, ever" },
  { icon: CheckCircle, text: "Cancel anytime" },
];

/* ─── Animated counter hook ─────────────────────────────────────── */
function useAnimatedCount(target: number, duration = 1.8) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(count, target, { duration });
    const unsub = rounded.on("change", setDisplay);
    return () => { controls.stop(); unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return display;
}

/* ─── Live stats bar ────────────────────────────────────────────── */
function StatsBar() {
  const winRate   = useAnimatedCount(74);
  const seatsLeft = useAnimatedCount(14);
  const years     = useAnimatedCount(8);

  const stats = [
    { value: `${winRate}%`,    label: "Historical Win Rate" },
    { value: `${years}yr`,     label: "Backtest Depth" },
    { value: `${seatsLeft}`,   label: "Beta Seats Left", hot: true },
  ];

  return (
    <div className="flex items-center gap-6 mt-8 pt-8 border-t border-white/5 w-full justify-center md:justify-start">
      {stats.map(({ value, label, hot }, i) => (
        <div key={label} className="flex items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className={`text-2xl font-extrabold ${hot ? "text-red-400" : "text-white"}`}>
              {value}
              {hot && (
                <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-red-400 animate-pulse align-middle" />
              )}
            </span>
            <span className="text-xs text-text-muted whitespace-nowrap">{label}</span>
          </div>
          {i < stats.length - 1 && <div className="w-px h-10 bg-white/10 shrink-0" />}
        </div>
      ))}
    </div>
  );
}

/* ─── Hero ──────────────────────────────────────────────────────── */
export default function HeroSection() {
  const handleCTAClick = () => {
    document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
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
        {/* ── Left: Copy ──────────────────────────────────────── */}
        <motion.div
          className="flex flex-col gap-6 items-center md:items-start text-center md:text-left"
          variants={slideUp}
        >
          {/* Scarcity badge */}
          <motion.div
            variants={hologramFlicker}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/40 rounded-full text-red-400 text-sm font-semibold"
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <Users size={13} />
            <span>Only 14 beta seats remaining</span>
            <Clock size={13} className="ml-0.5" />
          </motion.div>

          {/* Headline — outcome first */}
          <h1 className="text-5xl md:text-[4.5rem] leading-[1.08] font-extrabold tracking-tighter">
            <span className="text-white">
              Trade with precision.<br />
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0EF2B1] via-[#5B8CFF] to-[#0EF2B1] bg-[length:200%] animate-gradient">
              Execute with confidence.
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg text-text-muted max-w-[500px] leading-relaxed">
            A battle-tested MT5 system with{" "}
            <span className="text-white font-semibold">8 years of backtest data</span>,
            a live war room, and real-time AI market intelligence — running on{" "}
            <span className="text-white font-semibold">your account</span>, under{" "}
            <span className="text-white font-semibold">your control</span>.
            Pay only after you see results.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 mt-2">
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
            <a
              href="#features"
              className="text-sm text-text-muted hover:text-white underline underline-offset-4 transition-colors"
            >
              How it works →
            </a>
          </div>

          {/* Trust strip */}
          <ul className="grid grid-cols-2 md:flex md:flex-row md:flex-wrap gap-x-5 gap-y-2.5 mt-1">
            {TRUST_ITEMS.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-1.5 text-xs text-text-muted whitespace-nowrap"
              >
                <Icon size={12} className="text-primary shrink-0" />
                {text}
              </li>
            ))}
          </ul>

          {/* Animated proof stats */}
          <StatsBar />
        </motion.div>

        {/* ── Right: Visuals ──────────────────────────────────── */}
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

          {/* Floating card — backtest win */}
          <motion.div
            className="absolute left-0 top-[150px] z-20"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <GlassCard glowColor="secondary" className="flex items-center gap-3 p-4 !min-w-[170px]">
              <TrendingUp size={20} className="text-secondary" />
              <div>
                <div className="text-xs text-text-muted">Backtest 2018–2026</div>
                <div className="font-bold text-green-400">74% Win Rate</div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Live trade signal card */}
          <motion.div
            className="absolute left-8 bottom-[220px] z-20"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          >
            <GlassCard glowColor="primary" className="flex items-center gap-3 p-3 !min-w-[160px]">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shrink-0" />
              <div>
                <div className="text-xs text-text-muted">Live Signal</div>
                <div className="font-bold text-primary text-sm">XAUUSD BUY 3321.4</div>
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
