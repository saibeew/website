import { LockKeyhole } from "lucide-react";

export default function RiskDisclosureSection() {
  return (
    <section className="border-b border-white/10 px-5 py-12">
      <div className="mx-auto max-w-7xl rounded-lg border border-amber-500/20 bg-amber-500/5 p-6">
        <div className="mb-3 flex items-center gap-2 text-amber-300">
          <LockKeyhole size={18} />
          <h2 className="font-black">Risk Disclosure & Eligibility</h2>
        </div>
        <div className="space-y-4 text-sm leading-7 text-amber-100/80">
          <p>beew.ai is a software vendor. We are not a money manager, investment adviser, or financial institution. The beew EA is an automated trading tool for use on MetaTrader 5 (MT5) platforms.</p>
          <p>Trading foreign exchange and CFDs involves substantial risk of loss and is not suitable for all investors. Past performance, including backtested results, is not indicative of future results. Backtested figures are based on historical data and do not account for slippage, spread variation, or broker execution differences.</p>
          <p>It is your responsibility to ensure that use of this software complies with the laws and regulations of your jurisdiction. We do not accept clients where such use would be contrary to local law.</p>
          <p>By applying, you confirm that you understand and accept these risks.</p>
        </div>
      </div>
    </section>
  );
}
