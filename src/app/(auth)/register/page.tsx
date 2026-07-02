"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Mail, User } from "lucide-react";
import { useStore } from "@/store/useStore";
import TradingDNA from "@/components/landing/TradingDNA";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const { register } = useStore();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
            Approved Account Setup
          </div>
          <h2 className="text-5xl font-black text-white mb-6 leading-tight">
            Create your <span className="text-gradient from-success/80 to-primary/80">beew.ai dashboard</span>
          </h2>
          <p className="text-text-muted text-lg leading-relaxed mb-8">
            Platform accounts are for approved beta applicants who are ready to test the MT5 EA and war room workflow.
          </p>
        </motion.div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-success/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px] relative z-20"
        >
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-3">Create Account</h2>
            <p className="text-text-muted">Use the email you applied with for beta access.</p>
          </div>

          <div className="bg-[#0d1525]/80 border border-white/5 rounded-3xl shadow-2xl p-8 lg:p-10">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-muted/80">Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-4 text-white/30" />
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full bg-[#0d1525]/80 border border-white/5 rounded-xl pl-12 pr-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-success/50 focus:ring-1 focus:ring-success/20 transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-muted/80">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-4 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-[#0d1525]/80 border border-white/5 rounded-xl pl-12 pr-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-success/50 focus:ring-1 focus:ring-success/20 transition-all"
                    placeholder="trader@beew.ai"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-muted/80">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-4 text-white/30" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-[#0d1525]/80 border border-white/5 rounded-xl pl-12 pr-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-success/50 focus:ring-1 focus:ring-success/20 transition-all"
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full h-14 rounded-xl bg-success/10 border border-success/30 text-success hover:bg-success/15 hover:text-white transition-all font-black tracking-[0.2em] uppercase text-sm disabled:opacity-60"
              >
                {isRegistering ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-text-muted">
              Already have an account?
              <Link href="/login" className="text-primary hover:underline ml-1">
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
