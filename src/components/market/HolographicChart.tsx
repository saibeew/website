"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "./HolographicChart.module.css";
import GlassCard from "../ui/GlassCard";

// Types
interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export default function HolographicChart() {
  const [data, setData] = useState<Candle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverInfo, setHoverInfo] = useState<{ x: number, y: number, price: number, date: string } | null>(null);

  // Initialize Mock Data with real starting price
  useEffect(() => {
    const initChart = async () => {
      let startPrice = 90000;
      const clusters = ["api.binance.com", "api1.binance.com", "api2.binance.com"];
      const cluster = clusters[Math.floor(Math.random() * clusters.length)];

      try {
        const res = await fetch(`https://${cluster}/api/v3/ticker/price?symbol=BTCUSDT`);
        if (!res.ok) throw new Error("Binance down");
        const data = await res.json();
        startPrice = parseFloat(data.price);
      } catch (e) {
        console.error("Using fallback price due to fetch error:", e);
      }

      const initialData: Candle[] = [];
      let price = startPrice - 1000; // Start a bit lower
      const now = Date.now();
      
      for (let i = 0; i < 50; i++) {
        const volatility = Math.random() * 500;
        const direction = Math.random() > 0.45 ? 1 : -1;
        const open = price;
        const close = price + (volatility * direction);
        const high = Math.max(open, close) + Math.random() * 100;
        const low = Math.min(open, close) - Math.random() * 100;
        
        initialData.push({
          time: now - ((50 - i) * 60000),
          open,
          high,
          low,
          close
        });
        
        price = close;
      }
      setData(initialData);
    };

    initChart();
  }, []);

  // Simulate Live Ticks via Binance WebSocket
  useEffect(() => {
    const streamClusters = ["stream.binance.com:9443", "stream1.binance.com:9443", "stream2.binance.com:9443", "stream3.binance.com:9443"];
    const cluster = streamClusters[Math.floor(Math.random() * streamClusters.length)];
    const ws = new WebSocket(`wss://${cluster}/ws/btcusdt@ticker`);
    
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const newPrice = parseFloat(msg.c); // Current price
      
      setData(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        
        // Update last candle (simulate forming)
        return [
          ...prev.slice(0, -1),
          {
            ...last,
            close: newPrice,
            high: Math.max(last.high, newPrice),
            low: Math.min(last.low, newPrice)
          }
        ];
      });
    };

    return () => ws.close();
  }, []);

  // Rendering Helper
  const renderChart = () => {
    if (!data.length || !containerRef.current) return null;
    
    const width = containerRef.current.clientWidth;
    const height = 400; // Fixed chart height
    const candleWidth = width / data.length;
    const padding = 4;
    
    // Scale Logic
    const maxPrice = Math.max(...data.map(d => d.high));
    const minPrice = Math.min(...data.map(d => d.low));
    const priceRange = maxPrice - minPrice;
    
    const getY = (price: number) => height - ((price - minPrice) / priceRange) * height;

    return (
      <svg width="100%" height={height} className={styles.chartSvg}>
        <defs>
          <filter id="neonGlowGreen" x="-50%" y="-50%" width="200%" height="200%">
             <feGaussianBlur stdDeviation="2" result="coloredBlur" />
             <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
             </feMerge>
          </filter>
          <filter id="neonGlowRed" x="-50%" y="-50%" width="200%" height="200%">
             <feGaussianBlur stdDeviation="2" result="coloredBlur" />
             <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
             </feMerge>
          </filter>
        </defs>

        {/* Grid Lines */}
        {/* Render Candles */}
        {data.map((d, i) => {
          const x = i * candleWidth;
          const yOpen = getY(d.open);
          const yClose = getY(d.close);
          const yHigh = getY(d.high);
          const yLow = getY(d.low);
          
          const isGreen = d.close >= d.open;
          const color = isGreen ? "#00FFA3" : "#FF4D4D";
          const filter = isGreen ? "url(#neonGlowGreen)" : "url(#neonGlowRed)";
          
          return (
            <g key={i} className={styles.candleGroup} 
               onMouseEnter={() => setHoverInfo({ 
                 x: x + candleWidth + 20, 
                 y: yClose, 
                 price: d.close, 
                 date: new Date(d.time).toLocaleTimeString() 
               })}
            >
              <line x1={x + candleWidth/2} y1={yHigh} x2={x + candleWidth/2} y2={yLow} stroke={color} strokeWidth="1" opacity="0.8" />
              <rect
                x={x + padding}
                y={Math.min(yOpen, yClose)}
                width={Math.max(1, candleWidth - padding * 2)}
                height={Math.max(1, Math.abs(yClose - yOpen))}
                fill={isGreen ? "rgba(0, 255, 163, 0.2)" : "rgba(255, 77, 77, 0.2)"}
                stroke={color}
                strokeWidth="1"
                filter={filter}
              />
            </g>
          );
        })}

        {/* Current Price Line */}
        {data.length > 0 && (
          <line 
            x1="0" 
            y1={getY(data[data.length-1].close)} 
            x2={width} 
            y2={getY(data[data.length-1].close)} 
            stroke="rgba(255, 255, 255, 0.3)" 
            strokeDasharray="4 4" 
          />
        )}
      </svg>
    );
  };

  return (
    <GlassCard className={styles.chartContainer}>
       <div className={styles.chartHeader}>
         <div className={styles.pairTitle}>BTC/USDT <span className={styles.liveTag}>LIVE</span></div>
         <div className={styles.controls}>
            <button className={`${styles.timeBtn} ${styles.active}`}>1m</button>
            <button className={styles.timeBtn}>5m</button>
            <button className={styles.timeBtn}>1h</button>
         </div>
       </div>
       
       <div className={styles.chartBody} ref={containerRef}>
         {renderChart()}
         
         {/* Crosshair Tooltip */}
         {hoverInfo && (
           <motion.div 
             className={styles.tooltip}
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             style={{ left: hoverInfo.x, top: hoverInfo.y }}
           >
             <div className={styles.tooltipPrice}>${hoverInfo.price.toFixed(2)}</div>
             <div className={styles.tooltipDate}>{hoverInfo.date}</div>
           </motion.div>
         )}
       </div>
    </GlassCard>
  );
}
