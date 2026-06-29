"use client";

import GlassCard from "../ui/GlassCard";

export default function FooterSection() {
  return (
    <footer className="py-10 px-6 max-w-7xl mx-auto">
      <GlassCard className="p-6 border border-white/5" hoverEffect={false}>
          <div className="flex flex-wrap justify-between items-center gap-5 text-center md:text-left flex-col md:flex-row">
            <p className="text-text-muted text-sm">&copy; 2025 BEEW - Be Wealthy</p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms', 'Support'].map((link) => (
                <a 
                  key={link} 
                  href="#" 
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
