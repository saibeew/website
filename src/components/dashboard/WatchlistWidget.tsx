"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../ui/GlassCard";
import styles from "./WatchlistWidget.module.css";
import { TrendingUp, TrendingDown, MoreHorizontal } from "lucide-react";

const INITIAL_DATA = [
  { symbol: "BTC", name: "Bitcoin", price: 0, change: 0, history: [] as number[] },
  { symbol: "ETH", name: "Ethereum", price: 0, change: 0, history: [] as number[] },
  { symbol: "SOL", name: "Solana", price: 0, change: 0, history: [] as number[] },
];

export default function WatchlistWidget() {
  const [assets, setAssets] = useState(INITIAL_DATA);

  useEffect(() => {
    const update = async () => {
      const updates = await Promise.all(INITIAL_DATA.map(async (asset) => {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${asset.symbol}USDT`, { cache: "no-store" });
        if (!response.ok) throw new Error("Market feed unavailable");
        const data = await response.json();
        return { symbol: asset.symbol, price: Number(data.lastPrice), change: Number(data.priceChangePercent) };
      })).catch(() => []);
      if (updates.length === 0) return;
      setAssets((current) => current.map((asset) => {
        const update = updates.find((item) => item.symbol === asset.symbol);
        if (!update) return asset;
        return { ...asset, price: update.price, change: update.change, history: [...asset.history, update.price].slice(-20) };
      }));
    };
    void update();
    const interval = setInterval(update, 15_000);
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
          <span className={styles.alignRight}>Live Updates</span>
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
                 {asset.price > 0 ? <PriceDisplay price={asset.price} /> : <span className={styles.price}>Unavailable</span>}
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
  if (data.length < 2) return <span className="text-text-muted">—</span>;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
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
