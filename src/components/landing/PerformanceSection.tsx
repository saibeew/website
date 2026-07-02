const performanceRows = [
  { metric: "Avg Monthly Return", conservative: "~0.7%", aggressive: "~2.0%" },
  { metric: "Max Drawdown", conservative: "Shown during review", aggressive: "Shown during review" },
  { metric: "Backtest Period", conservative: "2018-2026", aggressive: "2018-2026" },
  { metric: "Assets Traded", conservative: "Multi-asset MT5", aggressive: "Multi-asset MT5" },
];

export default function PerformanceSection() {
  return (
    <section id="performance" className="border-b border-white/10 px-5 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#5b8cff]">Honest Numbers</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">Performance without hiding drawdown.</h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-slate-400">
            Every return figure is shown with drawdown context. We do not sell a curve without showing risk.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th className="p-4">Metric</th>
                <th className="p-4">Conservative Mode</th>
                <th className="p-4">Aggressive Mode</th>
              </tr>
            </thead>
            <tbody>
              {performanceRows.map((row) => (
                <tr key={row.metric} className="border-t border-white/10">
                  <td className="p-4 font-bold">{row.metric}</td>
                  <td className="p-4 text-slate-300">{row.conservative}</td>
                  <td className="p-4 text-slate-300">{row.aggressive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 rounded-md border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm leading-6 text-amber-100/85">
          Backtested averages only. Past performance is not indicative of future results. Drawdown figures are the worst recorded in the test period.
        </p>
      </div>
    </section>
  );
}
