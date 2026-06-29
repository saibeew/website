"use client";

import { motion } from "framer-motion";
import React from "react";
import styles from "./MainLayout.module.css";
import { fadeIn } from "@/lib/animations";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      {/* Global AI Wave Background */}
      <div className={styles.background}>
        <div className={styles.waveLayer1} />
        <div className={styles.waveLayer2} />
        <div className={styles.gridOverlay} />
      </div>

      <motion.main 
        className={styles.main}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {children}
      </motion.main>
    </div>
  );
}
