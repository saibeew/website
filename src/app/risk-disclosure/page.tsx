import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Risk Disclosure | beew.ai" };

export default function RiskDisclosurePage() {
  return (
    <LegalPage title="Trading Risk Disclosure">
      <section><h2>Substantial risk of loss</h2><p>Foreign exchange, CFDs, leveraged products, and automated trading involve substantial risk and are not suitable for every person. You may lose some or all of the capital committed and, depending on your broker and jurisdiction, may lose more than your initial deposit.</p></section>
      <section><h2>No performance guarantee</h2><p>Past, backtested, simulated, or forward-tested performance does not predict future results. Backtests may omit or simplify spreads, slippage, latency, liquidity, rejected orders, data errors, financing costs, and changing market regimes.</p></section>
      <section><h2>Automation and technology risk</h2><p>Automated systems can behave unexpectedly because of configuration errors, software defects, connectivity failures, broker differences, market gaps, or external-service outages. Monitor any enabled system and maintain independent risk controls and emergency-stop procedures.</p></section>
      <section><h2>Your decision</h2><p>Use demo testing first, understand every setting, limit leverage and position size, and seek independent professional advice where appropriate. You alone decide whether and how to trade.</p></section>
    </LegalPage>
  );
}
