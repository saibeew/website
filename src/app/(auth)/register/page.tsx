"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { useStore } from "@/store/useStore";

import TradingDNA from "@/components/landing/TradingDNA";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();
  const { register, loginWithGoogle } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsRegistering(true);
    
    try {
        const result = await register(name, email, password);
        if (result.success) {
            window.location.href = "/dashboard";
        } else {
            setError(result.error || "Registration failed. Email might be taken.");
        }
    } finally {
        setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#020617] overflow-hidden">
        {/* Left Section: Immersive 3D Visual */}
        <div className="hidden lg:flex relative items-center justify-center bg-gradient-to-br from-[#020617] to-[#0A0F1E]">
            <div className="absolute inset-0 opacity-40 scale-x-[-1]">
                <TradingDNA />
            </div>
            
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative z-10 p-12 max-w-xl"
            >
                <div className="inline-block px-3 py-1 bg-success/10 border border-success/20 rounded-full text-xs font-bold text-success mb-6 tracking-widest uppercase">
                    Recruitment Phase Open
                </div>
                <h2 className="text-5xl font-black text-white mb-6 leading-tight">
                    Join the Elite <span className="text-gradient from-success/80 to-primary/80">Network</span>
                </h2>
                <p className="text-text-muted text-lg leading-relaxed mb-8">
                    Gain access to institutional-grade technology. Every operative starts with a personalized trading vault and neural-link strategies.
                </p>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success">✓</div>
                        <div>
                            <div className="text-white font-bold">Neural Sync</div>
                            <div className="text-xs text-text-muted">Direct AI strategy integration</div>
                        </div>
                    </div>
                </div>
            </motion.div>
            
            {/* Animated Grid Overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] mix-blend-overlay pointer-events-none" />
        </div>

        {/* Right Section: Premium Register Terminal */}
        <div className="flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-success/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[440px] relative z-20"
            >
                <div className="mb-10 text-center lg:text-left">
                    <h2 className="text-3xl font-bold text-white mb-3">Initialize Account</h2>
                    <p className="text-text-muted">Create your unique identifier for the ecosystem.</p>
                </div>

                <GlassCard className="!p-0 border-white/5 shadow-2xl overflow-visible" glowColor="success">
                    <div className="p-8 lg:p-10 space-y-8">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl flex items-start gap-3"
                            >
                                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2 group">
                                <label className="text-sm font-semibold text-text-muted/80 group-focus-within:text-success transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-success/50" />
                                    Operative Name
                                </label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#0d1525]/80 border border-white/5 rounded-xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-success/50 focus:ring-1 focus:ring-success/20 transition-all font-mono"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-sm font-semibold text-text-muted/80 group-focus-within:text-success transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-success/50" />
                                    Primary Email
                                </label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0d1525]/80 border border-white/5 rounded-xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-success/50 focus:ring-1 focus:ring-success/20 transition-all"
                                    placeholder="trader@bewe.io"
                                    required
                                />
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-sm font-semibold text-text-muted/80 group-focus-within:text-success transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-success/50" />
                                    Access Key
                                </label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0d1525]/80 border border-white/5 rounded-xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-success/50 focus:ring-1 focus:ring-success/20 transition-all font-mono"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                        <div className="pt-4 space-y-4">
                            <NeonButton 
                                fullWidth 
                                variant="success" 
                                size="lg"
                                className="h-14 font-black tracking-[0.2em] uppercase text-sm"
                                onClick={() => {}} 
                            >
                                {isRegistering ? "SYCHRONIZING..." : "INITIALIZE"}
                            </NeonButton>

                            <div className="text-center text-[10px] text-[#64748b] relative py-2">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                                <span className="relative px-3 bg-[#0d1525] backdrop-blur-sm">OR</span>
                            </div>

                            <button 
                                type="button"
                                onClick={() => {
                                    setError("");
                                    loginWithGoogle().catch(err => setError(err.message || "Google login failed."));
                                }}
                                className="w-full py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white flex items-center justify-center gap-3 hover:bg-white/[0.08] transition-all"
                            >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" width="18" alt="Google" />
                                <span className="text-sm font-semibold">Continue with Google</span>
                            </button>
                        </div>
                    </form>
                    </div>

                    <div className="px-8 py-4 bg-white/5 border-t border-white/5 flex justify-between items-center rounded-b-3xl">
                        <div className="text-[10px] font-mono text-text-muted uppercase tracking-tighter">
                            SECURE CHANNEL 02
                        </div>
                        <div className="flex gap-1.5 italic text-[9px] text-[#0EF2B1]">
                            ENCRYPTION ACTIVE
                        </div>
                    </div>

                    <div className="absolute -top-1 -right-1 w-24 h-24 border-t-2 border-r-2 border-success/40 rounded-tr-3xl pointer-events-none" />
                    <div className="absolute -bottom-1 -left-1 w-24 h-24 border-b-2 border-l-2 border-success/40 rounded-bl-3xl pointer-events-none" />
                </GlassCard>

                <div className="mt-10 text-center">
                    <div className="mt-6">
                        <Link href="/login" className="group text-sm font-bold text-white inline-flex items-center gap-2">
                            Already an Operative? <span className="text-primary group-hover:translate-x-1 transition-transform">Command Center →</span>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    </div>
  );
}
