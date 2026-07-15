import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy | beew.ai" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <section><h2>Information we collect</h2><p>We collect account details, application information, service usage, device and security logs, trading configuration you submit, and communications with us. We do not take custody of customer funds.</p></section>
      <section><h2>How we use information</h2><p>We use information to provide and secure the service, authenticate users, process applications, deliver requested integrations, communicate service updates, prevent abuse, and comply with legal obligations.</p></section>
      <section><h2>Service providers and transfers</h2><p>We may share only the information necessary with hosting, database, email, analytics, AI, and messaging providers that help operate the service. Their processing may occur in other countries and is governed by their terms and applicable safeguards.</p></section>
      <section><h2>Retention and security</h2><p>We retain information only as long as needed for the purposes described above or required by law. We use access controls, encrypted transport, restricted session cookies, and operational monitoring, but no system can guarantee absolute security.</p></section>
      <section><h2>Your choices</h2><p>Subject to applicable law, you may request access, correction, export, restriction, or deletion of your personal information and may withdraw marketing consent.</p></section>
      <section><h2>Contact</h2><p>For privacy questions or requests, email <a href="mailto:privacy@beew.ai">privacy@beew.ai</a>.</p></section>
    </LegalPage>
  );
}
