import Link from "next/link";
import { Activity, AlertTriangle, ArrowRight, BarChart3, CheckCircle2, FlaskConical, Lock, Newspaper, Radio, ShieldCheck } from "lucide-react";
import WarRoomPreviewSection from "@/components/landing/WarRoomPreviewSection";
import PerformanceSection from "@/components/landing/PerformanceSection";
import RiskDisclosureSection from "@/components/landing/RiskDisclosureSection";
import ApplicationFormSection from "@/components/landing/ApplicationFormSection";

const problemCards = [
  ["EA vendors hide the drawdown", "If they will not show you the losing months, that is your answer."],
  ["You cannot trust a backtest you did not run", "Anyone can show you a cherry-picked curve."],
  ["No context for market moves", "Most systems trade blind: no news, no macro awareness."],
  ["Pay first, discover problems later", "The industry standard is to take your money before you have seen real results."],
];

const featureCards = [
  { icon: FlaskConical, title: "Test the algo free", body: "Run it on our platform in forward-test mode. Watch real results before spending a cent." },
  { icon: Newspaper, title: "Live war room access", body: "Real-time news scraped and severity-scored. Understand the fundamental driver behind every market move." },
  { icon: Lock, title: "Founding member pricing", body: "Beta seats are limited. Lock in your price before public launch." },
];

const heroMetrics = [
  ["Forward mode", "Active"],
  ["Primary pair", "XAUUSD"],
  ["Risk control", "Client account"],
  ["News filter", "Live"],
];

const equityBars = [38, 43, 41, 49, 54, 51, 61, 66, 62, 71, 75, 72, 81, 86, 83, 90, 88, 94];

const heroFeed = [
  ["High", "USD news impact detected", "Risk throttled before spread expansion"],
  ["Medium", "Gold momentum shift", "Trend module waiting for confirmation"],
  ["Low", "Asia session liquidity", "Position sizing remains conservative"],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#05070c] text-white">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#05070c]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-lg font-black tracking-tight text-white">
            beew.ai
          </Link>
          <div className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-white">What You Get</a>
            <a href="#warroom" className="hover:text-white">War Room</a>
            <a href="#performance" className="hover:text-white">Results</a>
            <a href="#pricing" className="hover:text-white">Founding Access</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-semibold text-slate-300 hover:text-white sm:inline">
              Login
            </Link>
            <a href="#apply" className="rounded-md bg-[#0ef2b1] px-4 py-2 text-sm font-bold text-[#04100c] transition hover:bg-[#6fffd3]">
              Apply for Beta
            </a>
          </div>
        </div>
      </nav>

      <section className="relative min-h-[calc(100vh-73px)] overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#0ef2b1]/40 to-transparent" />
        <div className="relative mx-auto grid min-h-[calc(100vh-73px)] w-full max-w-[1680px] grid-cols-1 gap-8 px-5 py-10 md:px-8 lg:grid-cols-12 lg:px-12 xl:px-16">
          <div className="flex flex-col justify-center space-y-8 lg:col-span-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#0ef2b1]/25 bg-[#0ef2b1]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#0ef2b1]">
              <ShieldCheck size={14} />
              MT5 Forex EA + Live War Room
            </div>
            <div className="space-y-5">
              <h1 className="max-w-5xl text-4xl font-black leading-[1.02] tracking-tight text-white md:text-6xl xl:text-7xl">
                Test the algo. Use the war room. Pay only when you are satisfied.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                A systematic MT5 trading system - backtested 2018-2026, forward-tested on your own account, with real-time market intelligence built in.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="#apply" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0ef2b1] px-6 py-3 text-sm font-black text-[#04100c] transition hover:bg-[#6fffd3]">
                Apply for Beta Access
                <ArrowRight size={16} />
              </a>
              <a href="#warroom" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                See the War Room
              </a>
            </div>
            <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2 xl:grid-cols-4">
              {["Backtested 2018-2026", "You control your account", "No fund-holding", "Cancel anytime"].map((item) => (
                <div key={item} className="flex min-h-12 items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                  <CheckCircle2 size={15} className="shrink-0 text-[#0ef2b1]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center lg:col-span-7">
            <div className="w-full overflow-hidden rounded-lg border border-white/10 bg-[#080d19]/95 shadow-2xl shadow-black/40">
              <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0ef2b1]">
                    <Radio size={14} />
                    Forward Test Console
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white">MT5 Algo Monitor</h2>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-[#0ef2b1]/30 bg-[#0ef2b1]/10 px-3 py-1 text-xs font-bold text-[#0ef2b1]">
                  <span className="h-2 w-2 rounded-full bg-[#0ef2b1]" />
                  Live environment
                </div>
              </div>

              <div className="grid gap-4 p-5 xl:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {heroMetrics.map(([label, value]) => (
                      <div key={label} className="rounded-md border border-white/10 bg-white/[0.035] p-4">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
                        <p className="mt-2 text-sm font-bold text-white">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-md border border-white/10 bg-[#06110f] p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                          <BarChart3 size={14} />
                          Equity development
                        </p>
                        <p className="mt-1 text-sm text-slate-500">Backtest + forward-test view</p>
                      </div>
                      <p className="rounded-md bg-white/5 px-3 py-1 text-xs font-bold text-[#0ef2b1]">2018-2026</p>
                    </div>
                    <div className="flex h-72 items-end gap-2">
                      {equityBars.map((height, index) => (
                        <div key={index} className="flex-1 rounded-t bg-[#0ef2b1]/75" style={{ height: `${height}%` }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-white/10 bg-white/[0.035] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      <Activity size={14} />
                      War room stream
                    </p>
                    <span className="rounded-full bg-red-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-red-300">News aware</span>
                  </div>
                  <div className="space-y-3">
                    {heroFeed.map(([level, title, body]) => (
                      <div key={title} className="border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-white">{title}</p>
                          <span className="text-xs font-bold text-[#0ef2b1]">{level}</span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-400">{body}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-md border border-amber-400/20 bg-amber-400/10 p-3 text-xs leading-5 text-amber-100">
                    Backtest and forward-test data is shown with drawdown context. Results are not guarantees.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#5b8cff]">Why this exists</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">Most EA vendors hide the part serious traders care about.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {problemCards.map(([title, body]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
                <AlertTriangle className="mb-5 text-amber-400" size={22} />
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-white/10 px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0ef2b1]">What You Get</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">Built around proof before payment.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featureCards.map((feature) => (
              <div key={feature.title} className="rounded-lg border border-[#0ef2b1]/15 bg-[#0ef2b1]/[0.04] p-6 shadow-[0_0_24px_rgba(14,242,177,0.06)]">
                <feature.icon className="mb-5 text-[#0ef2b1]" size={24} />
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="border-b border-white/10 px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0ef2b1]">How It Works</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["1", "Apply", "Claim your beta seat and get instant war room access."],
              ["2", "Test", "Run the algo on our platform and watch forward-test results live."],
              ["3", "Subscribe", "Once satisfied, unlock the full EA for your own MT5 account."],
            ].map(([number, title, body]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-[#0ef2b1] text-sm font-black text-[#04100c]">{number}</div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WarRoomPreviewSection />
      <PerformanceSection />
      <RiskDisclosureSection />
      <ApplicationFormSection />

      <footer className="px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold text-white">beew.ai</p>
            <p className="mt-1">© 2026 beew.ai. Software vendor. No fund holding.</p>
            <p className="mt-1 max-w-xl text-xs">beew.ai is a software vendor, not a financial adviser. Trading involves risk. Past performance is not indicative of future results.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="#apply" className="hover:text-white">Apply</a>
            <a href="#warroom" className="hover:text-white">War Room</a>
            <a href="https://t.me/" className="hover:text-white">Telegram</a>
            <a href="https://www.linkedin.com/" className="hover:text-white">LinkedIn</a>
            <a href="https://www.youtube.com/" className="hover:text-white">YouTube</a>
            <a href="https://x.com/" className="hover:text-white">X</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
