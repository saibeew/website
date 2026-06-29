"use client";

import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { Check, Shield, Zap, Cpu, Globe } from "lucide-react";

export default function SubscriptionPage() {
  const handleUpgrade = () => {
    alert("Payment Gateway Integration is scheduled for Phase 4.\n\nSimulating 'Success' for now...");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
          Upgrade to BEEW Pro
        </h1>
        <p className="text-text-muted max-w-xl mx-auto">
          Unlock the full potential of algorithmic trading with dedicated cloud agents, institutional data feeds, and unrestricted AI access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Starter Plan */}
        <GlassCard className="p-8 space-y-6 opacity-80" glowColor="primary">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Starter</h3>
            <div className="text-3xl font-bold text-white">$0 <span className="text-sm font-normal text-text-muted">/mo</span></div>
            <p className="text-xs text-text-muted">Perfect for learning and backtesting.</p>
          </div>
          <ul className="space-y-4 text-sm text-text-muted">
            <li className="flex items-center gap-3"><Check size={16} className="text-primary" /> 1 Active Strategy</li>
            <li className="flex items-center gap-3"><Check size={16} className="text-primary" /> Daily Backtests (Limited)</li>
            <li className="flex items-center gap-3"><Check size={16} className="text-primary" /> Community Support</li>
            <li className="flex items-center gap-3 text-white/20"><Check size={16} /> <span className="line-through">Cloud Execution</span></li>
            <li className="flex items-center gap-3 text-white/20"><Check size={16} /> <span className="line-through">AI Market Context</span></li>
          </ul>
          <button className="w-full py-3 rounded-lg border border-white/10 text-white font-medium cursor-not-allowed bg-white/5">
            Current Plan
          </button>
        </GlassCard>

        {/* Pro Plan (Featured) */}
        <div className="relative transform md:-translate-y-4">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-secondary/20 blur-3xl -z-10 rounded-full opacity-50"></div>
          <GlassCard className="p-8 space-y-8 border-primary/30 relative overflow-hidden" glowColor="secondary">
            <div className="absolute top-0 right-0 bg-primary/20 text-primary text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">
              Most Popular
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Pro Trader</h3>
              <div className="text-4xl font-bold text-white">$49 <span className="text-sm font-normal text-text-muted">/mo</span></div>
              <p className="text-sm text-text-muted">For serious algotraders seeking edge.</p>
            </div>

            <ul className="space-y-4 text-sm text-white">
              <li className="flex items-center gap-3"><Zap size={18} className="text-secondary" /> Unlimited Strategies</li>
              <li className="flex items-center gap-3"><Cpu size={18} className="text-secondary" /> 5 Cloud Agents</li>
              <li className="flex items-center gap-3"><Globe size={18} className="text-secondary" /> Real-time News Feed</li>
              <li className="flex items-center gap-3"><Shield size={18} className="text-secondary" /> Priority Support</li>
              <li className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse"></div> Gemini 1.5 Pro Brain</li>
            </ul>

            <NeonButton variant="primary" className="w-full py-4 text-lg" onClick={handleUpgrade}>
              Upgrade Now
            </NeonButton>
          </GlassCard>
        </div>

        {/* Enterprise Plan */}
        <GlassCard className="p-8 space-y-6 opacity-80" glowColor="accent">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Institutional</h3>
            <div className="text-3xl font-bold text-white">$299 <span className="text-sm font-normal text-text-muted">/mo</span></div>
            <p className="text-xs text-text-muted">For funds and high-frequency setups.</p>
          </div>
          <ul className="space-y-4 text-sm text-text-muted">
             <li className="flex items-center gap-3"><Check size={16} className="text-accent" /> Dedicated Server</li>
             <li className="flex items-center gap-3"><Check size={16} className="text-accent" /> 0ms Latency Cross-Connect</li>
             <li className="flex items-center gap-3"><Check size={16} className="text-accent" /> Custom AI Models</li>
             <li className="flex items-center gap-3"><Check size={16} className="text-accent" /> White-Glove Onboarding</li>
          </ul>
          <button className="w-full py-3 rounded-lg border border-white/10 text-text-muted hover:bg-white/5 transition-colors" onClick={() => alert("Contact Sales: sales@beew.io")}>
            Contact Sales
          </button>
        </GlassCard>
      </div>

    </div>
  );
}
