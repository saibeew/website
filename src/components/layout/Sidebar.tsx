"use client";

import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  BarChart2, 
  Cpu, 
  Settings, 
  Layers, 
  Zap, 
  LogOut 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import GlassCard from "../ui/GlassCard";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Market", href: "/dashboard/market", icon: BarChart2 },
  { label: "Strategy", href: "/dashboard/strategy", icon: Layers },
  { label: "Execution", href: "/dashboard/execution", icon: Zap },
  { label: "Prices", href: "/dashboard/prices", icon: BarChart2 },
  { label: "AI Lab", href: "/dashboard/ai-lab", icon: Cpu },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside 
      className={styles.sidebar}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <GlassCard className={styles.dock} hoverEffect={false}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>AG</div>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                <div className={styles.iconWrapper}>
                  <Icon size={22} />
                  {isActive && <motion.div layoutId="activeGlow" className={styles.activeGlow} />}
                </div>
                <div className={styles.tooltip}>{item.label}</div>
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <button className={styles.logoutBtn}>
            <LogOut size={20} />
          </button>
        </div>
      </GlassCard>
    </motion.aside>
  );
}
