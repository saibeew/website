"use client";

import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { Check, Lock, Shield, MessageCircle } from "lucide-react";

export default function SubscriptionPage() {
  const paymentUrl = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_FOUNDING_URL || "";

  const handleFoundingCheckout = () => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
      return;
    }

    alert("Founding client checkout is shared privately after qualification. Add NEXT_PUBLIC_LEMON_SQUEEZY_FOUNDING_URL when the product link is ready.");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-10">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">
          <Lock size={14} />
          Private Founding Access
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
          beew.ai Founding Client Subscription
        </h1>
        <p className="text-text-muted max-w-2xl mx-auto">
          Subscription access is unlocked after qualification. Founding members receive the MT5 EA license, war room feed, forward-test platform, and support.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-8 items-stretch">
        <GlassCard className="p-8 space-y-8 border-primary/30 relative overflow-hidden" glowColor="primary">
          <div className="absolute top-0 right-0 bg-primary/20 text-primary text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">
            10 seats
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">Founding Seat</h2>
            <p className="text-sm text-text-muted">
              Pricing is shared privately after the qualification call. Founding price is locked for 12 months.
            </p>
          </div>

          <ul className="space-y-4 text-sm text-white">
            <li className="flex items-center gap-3"><Check size={18} className="text-primary" /> Full MT5 EA license</li>
            <li className="flex items-center gap-3"><Check size={18} className="text-primary" /> Severity-scored war room access</li>
            <li className="flex items-center gap-3"><Check size={18} className="text-primary" /> Forward-test platform</li>
            <li className="flex items-center gap-3"><Check size={18} className="text-primary" /> Founding price locked 12 months</li>
            <li className="flex items-center gap-3"><Check size={18} className="text-primary" /> Private onboarding support</li>
          </ul>

          <NeonButton variant="primary" className="w-full py-4 text-lg" onClick={handleFoundingCheckout}>
            {paymentUrl ? "Open Private Checkout" : "Await Private Checkout Link"}
          </NeonButton>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-6 space-y-4" glowColor="secondary">
            <Shield className="text-secondary" size={24} />
            <h3 className="text-lg font-bold text-white">$25K+ Account Required</h3>
            <p className="text-sm text-text-muted leading-6">
              The product is designed for serious traders using an MT5-compatible broker and enough account size for meaningful risk management.
            </p>
          </GlassCard>

          <GlassCard className="p-6 space-y-4" glowColor="accent">
            <MessageCircle className="text-accent" size={24} />
            <h3 className="text-lg font-bold text-white">Qualification First</h3>
            <p className="text-sm text-text-muted leading-6">
              Apply from the landing page first. Qualified applicants receive war room access, platform login, and private subscription instructions.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
