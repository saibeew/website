"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await response.json();
      setMessage(body.message || "If an account exists, a password-reset email has been sent.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] px-5 py-20 text-white">
      <form onSubmit={submit} className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-black">Reset your password</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">Enter your account email. For privacy, the response is the same whether an account exists or not.</p>
        {message && <p className="mt-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</p>}
        <label className="mt-6 block text-sm text-slate-300">Email address</label>
        <input type="email" required maxLength={320} value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-indigo-400" />
        <button disabled={loading} className="mt-6 w-full rounded-xl bg-indigo-500 px-4 py-3 font-bold disabled:opacity-60">{loading ? "Sending…" : "Send reset link"}</button>
        <Link href="/login" className="mt-6 block text-center text-sm text-indigo-300 hover:underline">Back to sign in</Link>
      </form>
    </main>
  );
}
