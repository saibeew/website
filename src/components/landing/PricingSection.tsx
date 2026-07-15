"use client";

import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";
import NeonButton from "../ui/NeonButton";
import { Check } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    name: "Starter",
    price: "₹499",
    period: "/mo",
    features: ["AI Strategies", "Live Charts", "Basic Journaling"],
    glow: "primary" as const
  },
  {
    name: "Pro",
    price: "₹1199",
    period: "/mo",
    features: ["Backtesting Lab", "Auto Execution", "Premium Alerts"],
    glow: "accent" as const
  },
  {
    name: "Institutional",
    price: "₹4999",
    period: "/mo",
    features: ["API Access", "Unlimited Strategies", "Advanced AI Models"],
    glow: "secondary" as const
  }
];

export default function PricingSection() {
  return (
    <section className="py-24 px-6" id="pricing">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-4xl mb-16 text-white neon-text font-bold">Choose Your Edge</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <GlassCard 
                className="p-8 flex flex-col h-full hover:-translate-y-2 transition-transform duration-300" 
                glowColor={plan.glow}
              >
                <h3 className="text-2xl text-white mb-4 font-bold">{plan.name}</h3>
                <div className="flex items-baseline mb-8">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-text-muted ml-2">{plan.period}</span>
                </div>
                
                <ul className="list-none p-0 m-0 mb-10 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 mb-4 text-text-muted">
                      <Check size={16} className="text-primary" /> {f}
                    </li>
                  ))}
                </ul>

                <Link href={`/register?plan=${plan.name.toLowerCase()}`} className="w-full mt-auto block">
                  <NeonButton variant="primary" fullWidth>Select Plan</NeonButton>
                </Link>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
