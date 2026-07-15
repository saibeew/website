"use client";

import { useState, useRef } from "react";
import { motion, type PanInfo } from "framer-motion";
import styles from "./StrategyCanvas.module.css";
import GlassCard from "../ui/GlassCard";
import { X, Plus, Play, Brain, Trash2 } from "lucide-react";
import { useStrategyStore } from "@/store/useStrategyStore";
import { auditStrategy } from "@/lib/strategy_auditor";

export default function StrategyCanvas() {
  const { nodes, edges, removeNode, updateNodePosition, addEdge, clearStrategy } = useStrategyStore();
  const [connecting, setConnecting] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDrag = (id: string, info: PanInfo) => {
    if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        updateNodePosition(id, info.point.x - rect.left - 80, info.point.y - rect.top - 40);
    }
  };

  const startConnection = (id: string) => {
    if (connecting && connecting !== id) {
        addEdge(connecting, id);
        setConnecting(null);
    } else {
        setConnecting(id);
    }
  };

  const handleAudit = async () => {
    if (nodes.length === 0) return;
    const prompt = auditStrategy(nodes, edges);
    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: prompt })
        });
        const data = await res.json();
        alert(`STRATEGY AUDIT:\n\n${data.reply}`);
    } catch (e) {
        console.error("Audit failed", e);
    }
  };

  return (
    <div className={styles.canvasContainer} ref={canvasRef}>
      <div className={styles.gridPattern} />
      
      {/* Canvas Controls */}
      <div className={styles.controls}>
          <button className={styles.controlBtn} onClick={() => {}} title="Simulation Preview">
              <Play size={16} />
              <span>Simulate</span>
          </button>
          <button className={styles.controlBtn} onClick={handleAudit} title="AI Strategy Audit">
              <Brain size={16} className="text-primary" />
              <span>Audit Brain</span>
          </button>
          <button className={`${styles.controlBtn} ${styles.dangerBtn}`} onClick={clearStrategy} title="Clear Canvas">
              <Trash2 size={16} className="text-danger" />
              <span>Clear Strategy</span>
          </button>
      </div>

      {/* Reactive Connections */}
      <svg className={styles.connections}>
        {edges.map(edge => {
            const startNode = nodes.find(n => n.id === edge.source);
            const endNode = nodes.find(n => n.id === edge.target);
            if (!startNode || !endNode) return null;
            
            return (
                <motion.path 
                    key={edge.id}
                    d={`M${startNode.x + 150},${startNode.y + 40} L${endNode.x},${endNode.y + 40}`} 
                    stroke={edge.id.includes('sell') ? "rgba(255, 75, 75, 0.4)" : "rgba(0, 246, 255, 0.4)"} 
                    strokeWidth="2" 
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                />
            );
        })}
      </svg>

      {nodes.map((node) => (
         <motion.div
           key={node.id}
           drag
           dragMomentum={false}
           onDrag={(e, info) => handleDrag(node.id, info)}
           style={{ position: "absolute", left: node.x, top: node.y, zIndex: 50 }}
           transition={{ type: "spring", stiffness: 300, damping: 30 }}
         >
            <GlassCard 
                className={`${styles.canvasNode} ${connecting === node.id ? styles.connecting : ""}`}
                hoverEffect={false}
            >
                <div className={styles.nodeHeader}>
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full bg-primary animate-pulse`} />
                        <span>{node.label}</span>
                    </div>
                    <button className={styles.closeBtn} onClick={() => removeNode(node.id)}><X size={14} /></button>
                </div>
                <div className={styles.nodeBody}>
                    <div className={styles.portIn} onClick={() => startConnection(node.id)} />
                    <div className={styles.portOut} onClick={() => startConnection(node.id)} />
                    <div className="text-[10px] text-text-muted mt-2 font-mono">
                        {node.type.toUpperCase()} NODE
                    </div>
                </div>
            </GlassCard>
         </motion.div>
      ))}
      
      {nodes.length === 0 && (
        <div className={styles.instruction}>
            <Plus size={32} className="text-white/10 mb-2" />
            <p>Select metadata components from the palette to initialize a visual strategy</p>
        </div>
      )}
    </div>
  );
}
