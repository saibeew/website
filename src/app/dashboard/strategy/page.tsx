"use client";

import NodePalette from "@/components/strategy/NodePalette";
import StrategyCanvas from "@/components/strategy/StrategyCanvas";
import { motion } from "framer-motion";
import { rotatePerspective } from "@/lib/animations";

export default function StrategyPage() {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={rotatePerspective}
      style={{ display: "flex", height: "calc(100vh - 100px)", gap: "0" }}
    >
      <NodePalette />
      <StrategyCanvas />
    </motion.div>
  );
}
