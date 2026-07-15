"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => setToken(new URLSearchParams(window.location.search).get("token") || ""), []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const body = await response.json();
      if (!response.ok) setError(body.error || "Password could not be reset.");
      else setMessage("Password updated. All existing sessions were signed out.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] px-5 py-20 text-white">
      <form onSubmit={submit} className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-black">Choose a new password</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">Use at least 8 characters with uppercase, lowercase, and a number.</p>
        {error && <p className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        {message && <p className="mt-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">{message} <Link href="/login" className="underline">Sign in</Link></p>}
        <label className="mt-6 block text-sm text-slate-300">New password</label>
        <input type="password" required minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-indigo-400" />
        <button disabled={loading || !token || Boolean(message)} className="mt-6 w-full rounded-xl bg-indigo-500 px-4 py-3 font-bold disabled:opacity-60">{loading ? "Updating…" : "Update password"}</button>
      </form>
    </main>
  );
}
