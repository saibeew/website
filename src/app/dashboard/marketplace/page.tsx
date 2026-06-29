"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { Star, TrendingUp, Download, ShieldCheck } from "lucide-react";
import styles from "./page.module.css";
import { staggerContainer, slideUp } from "@/lib/animations";

const STRATEGIES = [
  { id: 1, name: "Quantum Scalper", author: "AlgoLabs", type: "Scalping", risk: "High", price: "$49/mo" },
  { id: 2, name: "Golden Cross AI", author: "DeepTrade", type: "Trend", risk: "Medium", price: "Free" },
  { id: 3, name: "Mean Reversion X", author: "QuantOne", type: "Swing", risk: "Low", price: "$99/mo" },
  { id: 4, name: "Crypto Arbitrage", author: "FlashBot", type: "Arb", risk: "Low", price: "$299/mo" },
  { id: 5, name: "News Sentiment", author: "AlphaFeed", type: "Event", risk: "High", price: "$19/mo" },
  { id: 6, name: "Whale Hunter", author: "OceanFloor", type: "Volume", risk: "Medium", price: "Free" },
];

import { useStore } from "@/store/useStore";

export default function MarketplacePage() {
  const { addNotification } = useStore();
  
  const handleAction = (name: string, price: string) => {
    addNotification({
        title: price === "Free" ? "Asset Added" : "Subscription Initialized",
        message: `${name} has been added to your execution library.`,
        type: "success"
    });
  };

  return (
    <motion.div 
      className={styles.container}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.header}>
        <h2 className="neon-text">Strategy Marketplace</h2>
        <p className={styles.subtitle}>Discover, rent, and deploy advanced trading algorithms.</p>
      </div>

      <div className={styles.grid}>
        {STRATEGIES.map((strategy) => (
          <motion.div key={strategy.id} variants={slideUp}>
            <GlassCard className={styles.card} glowColor="secondary">
              <div className={styles.cardHeader}>
                <div className={styles.iconBox}>
                  <TrendingUp size={24} />
                </div>
                <div className={styles.badge}>{strategy.type}</div>
              </div>
              
              <h3 className={styles.strategyName}>{strategy.name}</h3>
              <p className={styles.author}>by {strategy.author}</p>
              
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <ShieldCheck size={14} className={styles.statIcon} />
                  <span>{strategy.risk} Risk</span>
                </div>
                <div className={styles.stat}>
                  <Star size={14} className={styles.statIcon} />
                  <span>4.8 (1.2k)</span>
                </div>
              </div>

              <div className={styles.footer}>
                <span className={styles.price}>{strategy.price}</span>
                <NeonButton 
                  size="sm" 
                  variant={strategy.price === "Free" ? "secondary" : "primary"}
                  onClick={() => handleAction(strategy.name, strategy.price)}
                >
                   {strategy.price === "Free" ? <Download size={14} /> : "Subscribe"}
                </NeonButton>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
