"use client";

import GlassCard from "../ui/GlassCard";

export default function FooterSection() {
  return (
    <footer className="py-10 px-6 max-w-7xl mx-auto">
      <GlassCard className="p-6 border border-white/5" hoverEffect={false}>
          <div className="flex flex-wrap justify-between items-center gap-5 text-center md:text-left flex-col md:flex-row">
            <div>
              <p className="text-text-muted text-sm">&copy; 2026 beew.ai</p>
              <p className="text-text-muted/70 text-xs mt-2">beew.ai is a software vendor, not a financial adviser. Trading involves risk. Past performance is not indicative of future results.</p>
            </div>
            <div className="flex gap-6 flex-wrap justify-center">
              {['Telegram Channel', 'LinkedIn', 'YouTube', 'X'].map((link) => (
                <a 
                  key={link} 
                  href={link === 'Telegram Channel' ? 'https://t.me/' : link === 'LinkedIn' ? 'https://www.linkedin.com/' : link === 'YouTube' ? 'https://www.youtube.com/' : 'https://x.com/'} 
                  className="text-text-muted no-underline text-sm transition-colors hover:text-primary"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
      </GlassCard>
    </footer>
  );
}
