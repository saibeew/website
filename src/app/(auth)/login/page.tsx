"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { useStore } from "@/store/useStore";

import TradingDNA from "@/components/landing/TradingDNA";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const { login, loginWithGoogle } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);
    
    try {
        const result = await login(email, password);
        if (result.success) {
            window.location.href = "/dashboard";
        } else {
            setError(result.error || "Invalid email or password.");
        }
    } finally {
        setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#020617] overflow-hidden font-inter">
        {/* Left Section: Immersive 3D Visual (Restored) */}
        <div className="hidden lg:flex relative items-center justify-center bg-gradient-to-br from-[#020617] to-[#0A0F1E]">
            <div className="absolute inset-0 opacity-40">
                <TradingDNA />
            </div>
            
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative z-10 p-12 max-w-xl"
            >
                <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary mb-6 tracking-widest uppercase">
                    Neural Network Active
                </div>
                <h2 className="text-5xl font-black text-white mb-6 leading-tight">
                    The Interface of <span className="text-gradient">Wealth Automation</span>
                </h2>
                <p className="text-text-muted text-lg leading-relaxed mb-8">
                    Your gateway to institutional-grade algorithmic trading. Log in to synchronize your strategies with the global market pulse.
                </p>
            </motion.div>
            
            {/* Animated Grid Overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] mix-blend-overlay pointer-events-none" />
        </div>

        {/* Right Section: Refined Login Card */}
        <div className="flex items-center justify-center p-6 lg:p-12 relative overflow-hidden bg-[#0f172a]/50">
            {/* Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[400px] z-10"
            >
                <div className="bg-white/[0.05] backdrop-blur-[15px] border border-white/10 p-10 rounded-[24px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] text-white">
                    <div className="mb-8 text-left">
                        <h2 className="text-[28px] font-bold mb-2">Welcome Back</h2>
                        <p className="text-[#94a3b8] text-sm">Enter your details to access your premium dashboard.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-[13px] text-[#cbd5e1] ml-1">Email Address</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-[#818cf8] focus:bg-white/[0.1] transition-all"
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[13px] text-[#cbd5e1] ml-1">Password</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-[#818cf8] focus:bg-white/[0.1] transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between text-[13px] py-1">
                            <label className="flex items-center gap-2 cursor-pointer text-[#94a3b8]">
                                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-[#818cf8]" />
                                Remember me
                            </label>
                            <Link href="#" className="text-[#818cf8] hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full py-4 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white font-semibold hover:scale-[1.02] hover:shadow-[0_10px_15px_-3px_rgba(118,75,162,0.4)] transition-all active:scale-[0.98]"
                        >
                            {isLoggingIn ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <div className="text-center my-6 text-[12px] text-[#64748b] relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                        <span className="relative px-3 bg-[#161d2f]/0 backdrop-blur-sm">or</span>
                    </div>

                    <button 
                        type="button"
                        onClick={() => {
                            setError("");
                            loginWithGoogle().catch(err => setError(err.message || "Google login failed."));
                        }}
                        className="w-full py-3 bg-transparent border border-white/10 rounded-xl text-white flex items-center justify-center gap-3 hover:bg-white/[0.05] transition-all"
                    >
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" width="18" alt="Google" />
                        <span className="text-sm">Continue with Google</span>
                    </button>

                    <div className="mt-8 text-center text-sm text-[#94a3b8]">
                        Don't have an account? <Link href="/register" className="text-[#818cf8] hover:underline ml-1">Sign up</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    </div>
  );
}
