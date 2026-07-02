"use client";

import { motion } from "framer-motion";
import styles from "./NodePalette.module.css";
import { 
  Activity, 
  GitMerge, 
  Zap, 
  TrendingUp, 
  AlertTriangle 
} from "lucide-react";

import { useStrategyStore } from "@/store/useStrategyStore";

const NODE_TYPES = [
  { id: "rsi", label: "RSI", icon: Activity, type: "indicator" },
  { id: "macd", label: "MACD", icon: TrendingUp, type: "indicator" },
  { id: "logic", label: "IF / ELSE", icon: GitMerge, type: "logic" },
  { id: "buy", label: "BUY Action", icon: Zap, type: "action", color: "success" },
  { id: "sell", label: "SELL Action", icon: AlertTriangle, type: "action", color: "danger" },
];

export default function NodePalette() {
  const addNode = useStrategyStore((state) => state.addNode);

  const handleAddNode = (nodeDef: typeof NODE_TYPES[0]) => {
    const newNode = {
      // eslint-disable-next-line react-hooks/purity
      id: `${nodeDef.id}-${Date.now()}`,
      type: nodeDef.id,
      label: nodeDef.label,
      // eslint-disable-next-line react-hooks/purity
      x: 100 + Math.random() * 50,
      // eslint-disable-next-line react-hooks/purity
      y: 100 + Math.random() * 50,
    };
    addNode(newNode);
  };

  return (
    <div className={styles.palette}>
      <h3 className={styles.title}>Strategy Nodes</h3>
      <div className={styles.grid}>
        {NODE_TYPES.map((node) => {
          const Icon = node.icon;
          return (
            <motion.div
              key={node.id}
              className={`${styles.node} ${styles[node.type]} ${node.color ? styles[node.color] : ""}`}
              onClick={() => handleAddNode(node)}
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0, 246, 255, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              layoutId={node.id}
            >
              <Icon size={20} />
              <span>{node.label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
