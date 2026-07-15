"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import { useStore } from "@/store/useStore";
import TradingDNA from "@/components/landing/TradingDNA";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useStore();

  useEffect(() => {
    const verification = new URLSearchParams(window.location.search).get("verification");
    if (verification === "success") setNotice("Email verified. You can now sign in.");
    if (verification === "invalid") setError("Verification link is invalid or expired.");
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
            Secure Platform Access
          </div>
          <h2 className="text-5xl font-black text-white mb-6 leading-tight">
            Continue testing the <span className="text-gradient">beew.ai MT5 system</span>
          </h2>
          <p className="text-text-muted text-lg leading-relaxed mb-8">
            Sign in to access the dashboard, war room, backtesting lab, and deployment tools after your beta approval.
          </p>
        </motion.div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12 relative overflow-hidden bg-[#0f172a]/50">
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
              <p className="text-[#94a3b8] text-sm">Enter your beew.ai account credentials.</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] rounded-lg">
                {error}
              </div>
            )}
            {notice && (
              <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[13px] rounded-lg">
                {notice}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[13px] text-[#cbd5e1] ml-1">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-[#818cf8] focus:bg-white/[0.1] transition-all"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] text-[#cbd5e1] ml-1">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-[#818cf8] focus:bg-white/[0.1] transition-all"
                    placeholder="Password"
                    required
                  />
                </div>
              </div>

              <div className="text-right">
                <Link href="/forgot-password" className="text-xs text-[#818cf8] hover:underline">Forgot password?</Link>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-4 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white font-semibold hover:scale-[1.02] hover:shadow-[0_10px_15px_-3px_rgba(118,75,162,0.4)] transition-all active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
              >
                {isLoggingIn ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-[#94a3b8]">
              Do not have an account?
              <Link href="/register" className="text-[#818cf8] hover:underline ml-1">
                Sign up
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
