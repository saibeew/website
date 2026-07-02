"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Zap, CheckCircle, AlertTriangle, Layers } from "lucide-react";
import NeonButton from "../ui/NeonButton";
import Link from "next/link";
import styles from "./AuthForm.module.css"; // Reusing auth styles for base glassmorphism, or creates new if needed
import TrustBadges from "./TrustBadges";

const brokers = [
    { id: 'mt5', name: 'MetaTrader 5' },
    { id: 'mt4', name: 'MetaTrader 4' },
    { id: 'ibkr', name: 'Interactive Brokers' }
];

export default function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("trader@beew.ai"); // Pre-filled
    const [password, setPassword] = useState("Trade@2025");   // Pre-filled
    const [broker, setBroker] = useState("mt5");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Simulation
        setTimeout(() => {
            if (email === "trader@beew.ai" && password === "Trade@2025") {
                 // Success
                 window.location.href = "/dashboard";
            } else {
                setError("Invalid Credentials. Access Denied.");
                setIsLoading(false);
            }
        }, 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md"
        >
             {/* Main Glass Card */}
            <div className={`
                backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-8 
                shadow-[0_0_50px_rgba(0,229,255,0.1)] 
                hover:shadow-[0_0_80px_rgba(0,229,255,0.2)]
                hover:border-cyan-500/30
                transition-all duration-500
                group
            `}>
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 mb-2"
                    >
                         <div className="p-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                            <Zap size={20} className="text-cyan-400" />
                         </div>
                         <span className="text-sm font-mono text-cyan-400 tracking-wider">beew.ai access</span>
                    </motion.div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Welcome Back
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Sign in to access your MT5 testing dashboard.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Active Broker */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400 ml-1 flex items-center gap-1">
                            <Layers size={12} /> Trading Platform
                        </label>
                        <div className="relative group/input">
                            <select 
                                value={broker}
                                onChange={(e) => setBroker(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-slate-200 outline-none focus:border-cyan-500/50 appearance-none transition-all hover:bg-white/5"
                            >
                                {brokers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                            <div className="absolute right-4 top-3.5 pointer-events-none opacity-50">▼</div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400 ml-1">Identity</label>
                        <div className="relative group/input">
                            <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                            <input 
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-600 outline-none focus:border-cyan-500/50 focus:bg-cyan-950/20 transition-all font-mono text-sm"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                         <label className="text-xs font-medium text-slate-400 ml-1 flex justify-between">
                            <span>Passcode</span>
                            <span className="text-cyan-400/80 hover:text-cyan-300 cursor-pointer text-[10px] tracking-wide">FORGOT KEY?</span>
                        </label>
                        <div className="relative group/input">
                            <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-12 py-3 text-white placeholder-slate-600 outline-none focus:border-cyan-500/50 focus:bg-cyan-950/20 transition-all font-mono text-sm"
                                placeholder="••••••••"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors p-1"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Error Feedback */}
                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }} 
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-xs text-red-300"
                            >
                                <AlertTriangle size={14} /> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Action */}
                    <NeonButton 
                        variant="primary" 
                        fullWidth 
                        size="lg" 
                        disabled={isLoading}
                        icon={isLoading ? null : <ArrowRight size={18} />}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span className="animate-pulse">Authenticating...</span>
                            </div>
                        ) : "Establish Connection"}
                    </NeonButton>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center text-xs text-slate-500">
                    Need an invite? <Link href="/register" className="text-cyan-400 hover:text-cyan-300 ml-1 font-medium transition-colors">Request Access</Link>
                </div>
            </div>

            <TrustBadges />
        </motion.div>
    );
}
