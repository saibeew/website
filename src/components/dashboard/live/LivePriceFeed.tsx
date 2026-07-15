"use client";

import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LivePriceFeed({ symbol = "BTCUSDT" }: { symbol?: string }) {
  const [price, setPrice] = useState<number | null>(null);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<"up" | "down" | "none">("none");
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        let url = "";
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 4000);

        // 1. Determine Source & Format
        if (symbol === "XAUUSD") {
            // Gold Fallback (Matching MarketChart logic)
            url = "https://data-asg.goldprice.org/dbXRates/USD";
        } else {
            // Crypto/Forex on Binance
            // Most indices/forex need to be USDT on Binance spot, or aren't there
            const formattedSymbol = symbol.includes("USD") && !symbol.includes("USDT") 
                ? symbol.replace("USD", "USDT") 
                : symbol;
            
            // Try different Binance API clusters to avoid local blocks
            const clusters = ["api.binance.com", "api1.binance.com", "api2.binance.com"];
            const cluster = clusters[Math.floor(Math.random() * clusters.length)];
            url = `https://${cluster}/api/v3/ticker/price?symbol=${formattedSymbol}`;
        }

        const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        let newPrice = 0;

        if (symbol === "XAUUSD") {
            if (data.items && data.items[0] && data.items[0].xauPrice) {
                newPrice = data.items[0].xauPrice;
            } else {
                throw new Error("Invalid Gold Data");
            }
        } else if (data.price) {
            newPrice = parseFloat(data.price);
        }

        if (newPrice > 0) {
          setUnavailable(false);
          setPrice(current => {
            if (current !== null) {
                setPrevPrice(current);
                if (newPrice > current) setPriceChange("up");
                else if (newPrice < current) setPriceChange("down");
            }
            return newPrice;
          });
        } else throw new Error("Price unavailable");
        window.clearTimeout(timeout);
      } catch {
        setUnavailable(true);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 5000); // 5s is safer for rate limits

    return () => clearInterval(interval);
  }, [symbol]);

  if (!price) return <div className="text-xl font-bold text-amber-300">{unavailable ? "Live price unavailable" : "Loading live price…"}</div>;

  const tickChange = prevPrice ? ((price - prevPrice) / prevPrice) * 100 : null;

  return (
    <div className="text-center relative">
      <AnimatePresence mode="wait">
        <motion.div 
          key={price}
          initial={{ y: priceChange === "up" ? 10 : -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`text-6xl font-black font-mono tracking-tighter transition-colors duration-300 ${
            priceChange === "up" ? "text-green-400" : priceChange === "down" ? "text-red-400" : "text-white"
          }`}
        >
          ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </motion.div>
      </AnimatePresence>
      
      <div className={`mt-2 font-bold text-xl flex items-center justify-center gap-2 ${
        priceChange === "up" ? "text-green-500" : priceChange === "down" ? "text-red-500" : "text-text-muted"
      }`}>
        {priceChange === "up" ? <ArrowUp size={24} /> : priceChange === "down" ? <ArrowDown size={24} /> : null}
        {symbol.replace("USDT", "")}/USD {tickChange === null ? "Awaiting next tick" : `${tickChange >= 0 ? "+" : ""}${tickChange.toFixed(4)}% last tick`}
        {unavailable ? " · feed reconnecting" : ""}
      </div>
    </div>
  );
}
