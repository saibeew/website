"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MainLayout from "./MainLayout";
import React from "react";
import styles from "./DashboardLayout.module.css";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";
import AIAssistantWidget from "../dashboard/AIAssistantWidget";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout>
      <div className={styles.layout}>
        <Sidebar />
        <div className={styles.contentWrapper}>
          <Topbar />
          <motion.div 
            className={styles.pageContent}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            {children}
          </motion.div>
        </div>
        <AIAssistantWidget />
      </div>
    </MainLayout>
  );
}
