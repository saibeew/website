"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../ui/GlassCard";
import styles from "./WatchlistWidget.module.css";
import { TrendingUp, TrendingDown, MoreHorizontal } from "lucide-react";

// Mock Initial Data
const INITIAL_DATA = [
  { symbol: "BTC", name: "Bitcoin", price: 98450.00, change: 2.4, history: [40, 50, 45, 60, 55, 70, 80] },
  { symbol: "ETH", name: "Ethereum", price: 3850.50, change: 1.2, history: [30, 35, 32, 40, 42, 48, 50] },
  { symbol: "SOL", name: "Solana", price: 145.20, change: -0.8, history: [60, 55, 58, 52, 50, 48, 45] },
  { symbol: "NVDA", name: "Nvidia", price: 1150.00, change: 3.5, history: [20, 25, 30, 40, 60, 80, 100] },
  { symbol: "TSLA", name: "Tesla", price: 175.40, change: -1.5, history: [80, 75, 70, 65, 60, 55, 50] },
];

export default function WatchlistWidget() {
  const [assets, setAssets] = useState(INITIAL_DATA);

  // Simulate Live Ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prev => prev.map(asset => {
        const volatility = Math.random() * 0.002; // 0.2% movement
        const direction = Math.random() > 0.5 ? 1 : -1;
        const newPrice = asset.price * (1 + volatility * direction);
        
        return {
          ...asset,
          price: newPrice,
        };
      }));
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard className={styles.widget}>
      <div className={styles.header}>
        <h3 className={styles.title}>Market Watchlist</h3>
        <button className={styles.moreBtn}><MoreHorizontal size={18} /></button>
      </div>

      <div className={styles.list}>
        <div className={styles.listHeader}>
          <span>Asset</span>
          <span className={styles.alignRight}>Price</span>
          <span className={styles.alignRight}>24h Change</span>
          <span className={styles.alignRight}>7d Trend</span>
        </div>

        <AnimatePresence>
          {assets.map((asset) => (
            <motion.div 
              key={asset.symbol} 
              className={styles.row}
              layout
            >
              <div className={styles.assetInfo}>
                <div className={styles.symbolIcon}>{asset.symbol[0]}</div>
                <div>
                  <div className={styles.symbol}>{asset.symbol}</div>
                  <div className={styles.name}>{asset.name}</div>
                </div>
              </div>

              <div className={styles.priceCell}>
                 <PriceDisplay price={asset.price} />
              </div>

              <div className={`${styles.changeCell} ${asset.change >= 0 ? styles.positive : styles.negative}`}>
                {asset.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(asset.change).toFixed(2)}%
              </div>

              <div className={styles.chartCell}>
                 <Sparkline data={asset.history} color={asset.change >= 0 ? "#00FFA3" : "#FF4D4D"} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

// Sub-component to handle flash animation on price change
function PriceDisplay({ price }: { price: number }) {
  return (
    <motion.span
      key={price} // Trigger animation on value change
      initial={{ color: "#fff" }}
      animate={{ 
        color: ["#fff", "rgba(0, 246, 255, 1)", "#fff"],
        textShadow: ["none", "0 0 10px rgba(0, 246, 255, 0.8)", "none"] 
      }}
      transition={{ duration: 0.6 }}
      className={styles.price}
    >
      ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </motion.span>
  );
}

// Simple Sparkline chart
function Sparkline({ data, color }: { data: number[], color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width="100%" height="30" viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.sparkline}>
      <polyline 
        points={points} 
        fill="none" 
        stroke={color} 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}
