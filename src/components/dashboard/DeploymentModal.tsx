"use client";

import { useState } from "react";
import GlassCard from "../ui/GlassCard";
import CyberButton from "../ui/CyberButton";
import { X, Rocket, ShieldAlert, Zap } from "lucide-react";
import styles from "./DeploymentModal.module.css";
import { motion, AnimatePresence } from "framer-motion";

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategyName: string;
  onDeploy: (config: any) => void;
}

export default function DeploymentModal({ isOpen, onClose, strategyName, onDeploy }: DeploymentModalProps) {
  const [lotSize, setLotSize] = useState("0.01");
  const [maxDrawdown, setMaxDrawdown] = useState("5.0");
  const [accountType, setAccountType] = useState("demo");

  const handleSubmit = () => {
    onDeploy({
      lotSize: parseFloat(lotSize),
      maxDrawdown: parseFloat(maxDrawdown),
      accountType
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md"
          >
            <GlassCard className="p-0 overflow-hidden" glowColor="primary">
              {/* Header */}
              <div className="p-6 border-b border-white/5 bg-gradient-to-r from-primary/10 to-transparent">
                <div className="flex justify-between items-start">
                   <div>
                     <h2 className="text-xl font-bold text-white flex items-center gap-2">
                       <Rocket className="text-primary" size={20} />
                       Deploy Strategy
                     </h2>
                     <p className="text-sm text-text-muted mt-1">Ready to launch <span className="text-white font-medium">{strategyName}</span>?</p>
                   </div>
                   <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
                     <X size={20} />
                   </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                 
                 {/* Account Selector */}
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Target Account</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setAccountType("demo")}
                          className={`p-3 rounded-lg border text-sm font-medium transition-all ${accountType === "demo" ? "bg-primary/20 border-primary text-primary" : "bg-surface border-white/5 text-text-muted hover:border-white/20"}`}
                        >
                          METAVERSE (Demo)
                        </button>
                        <button 
                          onClick={() => setAccountType("real")}
                          className={`p-3 rounded-lg border text-sm font-medium transition-all ${accountType === "real" ? "bg-danger/20 border-danger text-danger" : "bg-surface border-white/5 text-text-muted hover:border-white/20"}`}
                        >
                          LIVE EXECUTION
                        </button>
                    </div>
                 </div>

                 {/* Risk Config */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase">Lot Size</label>
                        <div className="relative">
                           <input 
                             type="number" 
                             value={lotSize} 
                             onChange={(e) => setLotSize(e.target.value)}
                             className="w-full bg-surface/50 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                           />
                           <span className="absolute right-3 top-3 text-xs text-text-muted">Lots</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase">Max Drawdown</label>
                        <div className="relative">
                           <input 
                             type="number" 
                             value={maxDrawdown} 
                             onChange={(e) => setMaxDrawdown(e.target.value)}
                             className="w-full bg-surface/50 border border-white/10 rounded-lg p-3 text-white focus:border-danger focus:outline-none transition-colors"
                           />
                           <span className="absolute right-3 top-3 text-xs text-text-muted">%</span>
                        </div>
                    </div>
                 </div>

                 {/* Warning */}
                 <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-3 items-start">
                    <ShieldAlert className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-yellow-200/80 leading-relaxed">
                       You are about to authorize automated trading. Ensure your VPS/Local Terminal is running and "AutoTrading" is enabled in MT4.
                    </p>
                 </div>

              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/5 bg-black/20 flex gap-3">
                 <CyberButton 
                    onClick={onClose} 
                    variant="glass" 
                    className="flex-1"
                 >
                    Cancel
                 </CyberButton>
                 
                 <CyberButton 
                    onClick={handleSubmit} 
                    variant="action" 
                    glowColor="#00f2fe"
                    className="flex-[2] bg-primary/10" // Tint the background slightly
                    startIcon={<Zap size={18} />}
                 >
                    EXECUTE DEPLOYMENT
                 </CyberButton>
              </div>

            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
