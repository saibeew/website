"use client";

import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";

export default function ApplicationFormSection() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    country: "",
    broker: "",
    accountSize: "Under $25K",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to submit application.");
      setStatus("success");
      setMessage("Application received! Check your inbox for war room access.");
      setFormState({ name: "", email: "", country: "", broker: "", accountSize: "Under $25K" });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to submit application.");
    }
  };

  return (
    <section id="pricing" className="border-b border-white/10 px-5 py-16">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#5b8cff]">Founding Access</p>
          <h2 className="text-3xl font-black md:text-4xl">Apply for a Founding Seat</h2>
          <p className="text-sm leading-7 text-slate-300">
            10 seats available. $25K+ account required. Application reviewed within 24 hours.
          </p>
          <div className="rounded-lg border border-[#0ef2b1]/20 bg-[#0ef2b1]/5 p-5 text-sm leading-6 text-slate-300">
            Full EA license, war room access, forward-test platform, and founding price locked for 12 months. Pricing is shared privately after qualification.
          </div>
        </div>

        <form id="apply" onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-[#0b1020] p-5 md:p-6">
          <div className="mb-5">
            <h3 className="text-xl font-black">Apply for Access</h3>
            <p className="mt-2 text-sm text-slate-400">Your application is stored securely in Postgres.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input required value={formState.name} onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))} placeholder="Full name" className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-[#0ef2b1]" />
            <input required type="email" value={formState.email} onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))} placeholder="Email address" className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-[#0ef2b1]" />
            <input required value={formState.country} onChange={(e) => setFormState((s) => ({ ...s, country: e.target.value }))} placeholder="Country" className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-[#0ef2b1]" />
            <input value={formState.broker} onChange={(e) => setFormState((s) => ({ ...s, broker: e.target.value }))} placeholder="Broker / Platform (optional)" className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-[#0ef2b1]" />
            <select required value={formState.accountSize} onChange={(e) => setFormState((s) => ({ ...s, accountSize: e.target.value }))} className="rounded-md border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none focus:border-[#0ef2b1] md:col-span-2">
              <option>Under $25K</option>
              <option>$25K-$50K</option>
              <option>$50K-$100K</option>
              <option>$100K-$250K</option>
              <option>$250K+</option>
            </select>
          </div>
          {formState.accountSize === "Under $25K" && (
            <p className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              Minimum $25K required for beta.
            </p>
          )}
          <button disabled={status === "submitting"} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#0ef2b1] px-5 py-3 text-sm font-black text-[#04100c] transition hover:bg-[#6fffd3] disabled:opacity-60">
            {status === "submitting" ? "Submitting..." : "Submit Application"}
            <ArrowRight size={16} />
          </button>
          {message && (
            <p className={`mt-4 rounded-md border px-4 py-3 text-sm ${status === "success" ? "border-[#0ef2b1]/30 bg-[#0ef2b1]/10 text-[#b7ffe8]" : "border-red-500/30 bg-red-500/10 text-red-200"}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
