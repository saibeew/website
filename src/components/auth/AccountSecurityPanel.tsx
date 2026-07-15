"use client";

import { useEffect, useState } from "react";

type Session = {
  id: string;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  expires_at: string;
  current: boolean;
};

export default function AccountSecurityPanel() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");

  async function loadSessions() {
    const response = await fetch("/api/auth/sessions", { cache: "no-store" });
    if (response.ok) setSessions((await response.json()).sessions || []);
  }

  useEffect(() => {
    let active = true;
    void fetch("/api/auth/sessions", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((body) => { if (active && body) setSessions(body.sessions || []); });
    return () => { active = false; };
  }, []);

  async function revoke(sessionId: string) {
    const response = await fetch("/api/auth/sessions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    if (response.ok) await loadSessions();
  }

  async function deleteAccount() {
    if (!window.confirm("Permanently delete your account and associated data? This cannot be undone.")) return;
    const response = await fetch("/api/auth/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, confirmation }),
    });
    const body = await response.json();
    if (!response.ok) setMessage(body.error || "Account could not be deleted.");
    else window.location.href = "/";
  }

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xl font-bold text-white">Active sessions</h3>
        <p className="mt-2 text-sm text-slate-400">Review devices with access to your account and revoke anything unfamiliar.</p>
        <div className="mt-4 space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="min-w-0 text-sm">
                <p className="truncate font-medium text-white">{session.user_agent || "Unknown device"} {session.current ? "(current)" : ""}</p>
                <p className="mt-1 text-xs text-slate-500">{session.ip_address || "Unknown IP"} · Created {new Date(session.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => void revoke(session.id)} className="shrink-0 text-sm font-semibold text-red-300 hover:text-red-200">Revoke</button>
            </div>
          ))}
          {sessions.length === 0 && <p className="text-sm text-slate-500">No active sessions found.</p>}
        </div>
      </section>

      <section className="border-t border-white/10 pt-7">
        <h3 className="text-xl font-bold text-white">Your data</h3>
        <p className="mt-2 text-sm text-slate-400">Download a JSON export of your account and application records.</p>
        <a href="/api/auth/export" className="mt-4 inline-flex rounded-lg border border-indigo-400/30 px-4 py-2 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/10">Download data export</a>
      </section>

      <section className="border-t border-red-500/20 pt-7">
        <h3 className="text-xl font-bold text-red-300">Delete account</h3>
        <p className="mt-2 text-sm text-slate-400">This permanently removes your account and user-owned records. Enter your password and type DELETE.</p>
        {message && <p className="mt-3 text-sm text-red-300">{message}</p>}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Current password" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-red-400" />
          <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Type DELETE" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-red-400" />
        </div>
        <button disabled={!password || confirmation !== "DELETE"} onClick={() => void deleteAccount()} className="mt-4 rounded-lg bg-red-500/15 px-4 py-2 text-sm font-bold text-red-300 disabled:opacity-40">Permanently delete account</button>
      </section>
    </div>
  );
}
