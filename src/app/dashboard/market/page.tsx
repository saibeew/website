"use client";

import { motion } from "framer-motion";
import styles from "./page.module.css";
import HolographicChart from "@/components/market/HolographicChart";
import { zoomIn, slideUp } from "@/lib/animations";
import WatchlistWidget from "@/components/dashboard/WatchlistWidget";

export default function MarketPage() {
  return (
    <motion.div 
      className={styles.container}
      variants={zoomIn}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.mainChart}>
        <motion.div variants={slideUp} style={{ height: "100%" }}>
           <HolographicChart />
        </motion.div>
      </div>
      
      <div className={styles.sidePanel}>
        <motion.div variants={slideUp} style={{ height: "100%" }}>
           <WatchlistWidget />
        </motion.div>
      </div>

    </motion.div>
  );
}
