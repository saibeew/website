"use client";

import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";
import styles from "./PortfolioWidget.module.css";
import { ArrowUpRight, Wallet, PieChart } from "lucide-react";

export default function PortfolioWidget() {
  return (
    <GlassCard className={styles.container} glowColor="accent">
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconWrapper}>
            <Wallet size={20} />
          </div>
          <h3 className={styles.title}>Total Equity</h3>
        </div>
        <button className={styles.actionBtn}>
          <PieChart size={18} />
        </button>
      </div>

      <div className={styles.balanceSection}>
        <motion.div 
          className={styles.balance}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className={styles.currency}>$</span>
          <span className="neon-text">124,592.40</span>
        </motion.div>
        
        <div className={styles.pnlBadge}>
          <ArrowUpRight size={16} />
          <span>+$3,420.50 (2.8%)</span>
        </div>
      </div>

      <div className={styles.chartContainer}>
        {/* Simulated Holographic Area Chart */}
        <div className={styles.hologram}>
          <svg viewBox="0 0 500 150" className={styles.chartSvg}>
            <defs>
              <linearGradient id="equityGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FF3EEC" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FF3EEC" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path 
              d="M0,100 C50,90 100,110 150,80 C200,50 250,70 300,40 C350,10 400,30 450,20 L500,10" 
              fill="none" 
              stroke="#FF3EEC" 
              strokeWidth="3"
            />
            <path 
              d="M0,100 C50,90 100,110 150,80 C200,50 250,70 300,40 C350,10 400,30 450,20 L500,10 V150 H0 Z" 
              fill="url(#equityGradient)" 
            />
          </svg>
          <div className={styles.scanLine} />
          
          {/* Floating Data Points */}
          <motion.div 
            className={styles.dataPoint} 
            style={{ left: "60%", top: "20%" }}
            animate={{ scale: [1, 1.2, 1], boxShadow: ["0 0 0px #FF3EEC", "0 0 10px #FF3EEC", "0 0 0px #FF3EEC"] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Daily PnL</span>
          <span className={styles.statValue}>+$1,240.20</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Win Rate</span>
          <span className={styles.statValue}>68.4%</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Open Pos</span>
          <span className={styles.statValue}>5</span>
        </div>
      </div>
    </GlassCard>
  );
}
