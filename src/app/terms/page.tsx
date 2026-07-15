import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Terms of Service | beew.ai" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <section><h2>Service</h2><p>beew.ai provides software, analytics, automation tools, and market-information features. We are not a broker, custodian, money manager, investment adviser, or financial institution, and we do not provide individualized investment advice.</p></section>
      <section><h2>Eligibility and accounts</h2><p>You must be legally able to enter a contract and permitted to use trading software in your jurisdiction. You are responsible for accurate registration information, account security, broker permissions, and all activity performed through your account.</p></section>
      <section><h2>Trading responsibility</h2><p>You retain sole control of trading decisions, configuration, capital, leverage, and broker accounts. You must test software in a demo environment and independently determine whether it is appropriate before enabling live execution.</p></section>
      <section><h2>Acceptable use</h2><p>You may not bypass access controls, abuse APIs, upload malicious material, interfere with the service, reverse engineer protected components except where law permits, or use the service unlawfully.</p></section>
      <section><h2>Availability and third parties</h2><p>Features may depend on brokers, market-data sources, AI providers, messaging platforms, and cloud services. We do not guarantee uninterrupted service, execution, data accuracy, profitability, or compatibility with every broker.</p></section>
      <section><h2>Liability</h2><p>To the fullest extent permitted by law, beew.ai is not liable for trading losses, lost profits, data-source errors, broker execution, outages, or indirect or consequential damages. Rights that cannot legally be excluded remain unaffected.</p></section>
      <section><h2>Contact</h2><p>Questions about these terms may be sent to <a href="mailto:support@beew.ai">support@beew.ai</a>.</p></section>
    </LegalPage>
  );
}
