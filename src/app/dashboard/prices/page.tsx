"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import styles from "./page.module.css";
import { slideFromRight } from "@/lib/animations";

interface Asset {
  symbol: string;
  name: string;
  price: string;
  change: string;
  cap: string;
  rank: number;
}

const ASSET_NAMES: Record<string, string> = {
  "BTCUSDT": "Bitcoin",
  "ETHUSDT": "Ethereum",
  "SOLUSDT": "Solana",
  "BNBUSDT": "Binance Coin",
  "XRPUSDT": "Ripple",
  "ADAUSDT": "Cardano",
  "DOGEUSDT": "Dogecoin",
  "AVAXUSDT": "Avalanche",
  "DOTUSDT": "Polkadot",
  "MATICUSDT": "Polygon"
};

export default function PricesPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const { setActiveSymbol, addNotification } = useStore();

  const handleTrade = (symbol: string) => {
    setActiveSymbol(symbol);
    addNotification({
        title: "Active Asset Changed",
        message: `${symbol} is now the primary execution target.`,
        type: "info"
    });
  };

  useEffect(() => {
    const fetchPrices = async () => {
      const clusters = ["api.binance.com", "api1.binance.com", "api2.binance.com"];
      const cluster = clusters[Math.floor(Math.random() * clusters.length)];

      try {
        const response = await fetch(`https://${cluster}/api/v3/ticker/24hr`);
        if (!response.ok) throw new Error("Binance API down");
        const data = await response.json();
        
        const filtered = data
          .filter((item: any) => ASSET_NAMES[item.symbol])
          .map((item: any, index: number) => ({
            rank: index + 1,
            symbol: item.symbol.replace("USDT", ""),
            name: ASSET_NAMES[item.symbol],
            price: parseFloat(item.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            change: (parseFloat(item.priceChangePercent) >= 0 ? "+" : "") + item.priceChangePercent + "%",
            cap: "$" + (parseFloat(item.quoteVolume) / 1000000).toFixed(1) + "M (Vol)"
          }));
        
        setAssets(filtered);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch prices:", error);
        // Fallback data if API is blocked/down
        setAssets((currentAssets) => {
            if (currentAssets.length === 0) {
                return Object.keys(ASSET_NAMES).map((symbol, i) => ({
                    rank: i + 1,
                    symbol: symbol.replace("USDT", ""),
                    name: ASSET_NAMES[symbol],
                    price: "---",
                    change: "0.00%",
                    cap: "---"
                }));
            }
            return currentAssets;
        });
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className={styles.container}
      variants={slideFromRight}
      initial="hidden"
      animate="visible"
    >
      <GlassCard>
        <div className={styles.header}>
          <h2 className="neon-text">Live Asset Prices</h2>
          <span className={styles.updateTag}>Updates Live (Binance)</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-text-muted">Initializing data stream...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Asset</th>
                <th>Price</th>
                <th>24h Change</th>
                <th>Volume (24h)</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.symbol} className="hover:bg-white/5 transition-colors">
                  <td className={styles.rank}>{asset.rank}</td>
                  <td className={styles.asset}>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary mr-3 shadow-[0_0_10px_rgba(0,242,254,0.2)]">
                      {asset.symbol[0]}
                    </div>
                    <div>
                      <div className={styles.symbol}>{asset.symbol}</div>
                      <div className={styles.name}>{asset.name}</div>
                    </div>
                  </td>
                  <td className={styles.price}>${asset.price}</td>
                  <td className={asset.change.startsWith("+") ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                    {asset.change}
                  </td>
                  <td className={styles.cap}>{asset.cap}</td>
                  <td className="text-right">
                    <button 
                        onClick={() => handleTrade(asset.symbol)}
                        className="px-4 py-1.5 bg-primary/20 hover:bg-primary/40 border border-primary/30 rounded-lg text-[10px] font-bold text-primary transition-all active:scale-95"
                    >
                        Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>
    </motion.div>
  );
}
