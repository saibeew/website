"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { Server, Activity, Lock, Terminal } from "lucide-react";
import styles from "./page.module.css";
import { staggerContainer, slideUp } from "@/lib/animations";

export default function ExecutionPage() {
  return (
    <motion.div 
      className={styles.container}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.grid}>
        {/* Broker Connections */}
        <motion.div variants={slideUp} className={styles.brokersColumn}>
          <h3 className={styles.columnTitle}>Exchange Connections</h3>
          <div className={styles.brokerList}>
             <BrokerCard name="Binance" status="connected" latency="24ms" />
             <BrokerCard name="Coinbase Pro" status="disconnected" />
             <BrokerCard name="Bybit" status="connected" latency="31ms" />
          </div>
        </motion.div>

        {/* Live Execution Log */}
        <motion.div variants={slideUp} className={styles.logsColumn}>
          <h3 className={styles.columnTitle}>Live Execution Engine</h3>
          <GlassCard className={styles.logTerminal}>
            <div className={styles.logHeader}>
              <Terminal size={16} />
              <span>/var/logs/execution.log</span>
            </div>
            <div className={styles.logContent}>
              <LogEntry time="11:42:01" level="INFO" msg="Scanning BTC/USDT pairs..." />
              <LogEntry time="11:42:05" level="INFO" msg="Signal Detected: RSI < 30" />
              <LogEntry time="11:42:06" level="WARN" msg="Volatility spike > 2.5%" />
              <LogEntry time="11:42:08" level="SUCCESS" msg="Order Filled: BUY 0.5 BTC @ 98,420" />
              <LogEntry time="11:42:15" level="INFO" msg="Monitoring position..." />
            </div>
            <div className={styles.cursor} />
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}

function BrokerCard({ name, status, latency }: { name: string, status: string, latency?: string }) {
  return (
    <GlassCard className={styles.brokerCard} glowColor={status === "connected" ? "success" : "danger"}>
      <div className={styles.brokerHeader}>
        <div className={styles.brokerIcon}><Server size={18} /></div>
        <div className={styles.brokerInfo}>
          <div className={styles.brokerName}>{name}</div>
          <div className={status === "connected" ? styles.statusConnected : styles.statusDisconnected}>
            {status === "connected" ? "• Online" : "• Offline"}
          </div>
        </div>
        {status === "connected" && (
          <div className={styles.latency}>
            <Activity size={12} /> {latency}
          </div>
        )}
      </div>
      <div className={styles.apiKeyInput}>
        <Lock size={12} className={styles.lockIcon} />
        <input type="password" value="************************" readOnly disabled />
      </div>
    </GlassCard>
  );
}

function LogEntry({ time, level, msg }: { time: string, level: string, msg: string }) {
  return (
    <div className={styles.logEntry}>
      <span className={styles.logTime}>[{time}]</span>
      <span className={`${styles.logLevel} ${styles[level]}`}>{level}</span>
      <span className={styles.logMsg}>{msg}</span>
    </div>
  );
}
