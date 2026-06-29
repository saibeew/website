"use client";

import { motion } from "framer-motion";
import styles from "./Topbar.module.css";
import { Bell, Search, User } from "lucide-react";
import NeonButton from "../ui/NeonButton";

export default function Topbar() {
  return (
    <motion.header 
      className={styles.header}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className={styles.searchBar}>
        <Search size={18} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search markets, strategies..." 
          className={styles.searchInput} 
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn}>
          <Bell size={20} />
          <span className={styles.badge} />
        </button>
        
        <div className={styles.profile}>
          <div className={styles.avatar}>
            <User size={18} />
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Trader One</span>
            <span className={styles.userStatus}>PRO</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
