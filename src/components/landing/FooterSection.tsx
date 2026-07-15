"use client";

import Link from "next/link";
import GlassCard from "../ui/GlassCard";

export default function FooterSection() {
  const socialLinks = [
    ["Telegram Channel", process.env.NEXT_PUBLIC_TELEGRAM_URL],
    ["LinkedIn", process.env.NEXT_PUBLIC_LINKEDIN_URL],
    ["YouTube", process.env.NEXT_PUBLIC_YOUTUBE_URL],
    ["X", process.env.NEXT_PUBLIC_X_URL],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <footer className="py-10 px-6 max-w-7xl mx-auto">
      <GlassCard className="p-6 border border-white/5" hoverEffect={false}>
          <div className="flex flex-wrap justify-between items-center gap-5 text-center md:text-left flex-col md:flex-row">
            <div>
              <p className="text-text-muted text-sm">&copy; 2026 beew.ai</p>
              <p className="text-text-muted/70 text-xs mt-2">beew.ai is a software vendor, not a financial adviser. Trading involves risk. Past performance is not indicative of future results.</p>
            </div>
            <div className="flex gap-6 flex-wrap justify-center">
              <Link href="/privacy" className="text-text-muted no-underline text-sm transition-colors hover:text-primary">Privacy</Link>
              <Link href="/terms" className="text-text-muted no-underline text-sm transition-colors hover:text-primary">Terms</Link>
              <Link href="/risk-disclosure" className="text-text-muted no-underline text-sm transition-colors hover:text-primary">Risk Disclosure</Link>
              {socialLinks.map(([label, href]) => (
                <a 
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted no-underline text-sm transition-colors hover:text-primary"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
      </GlassCard>
    </footer>
  );
}
