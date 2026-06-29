import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BEEW - Be Wealthy | AI Algorithmic Trading Platform",
  description: "The world's most advanced AI-powered trading ecosystem. Automate crypto, stocks, and forex trading with institutional-grade algorithms.",
  keywords: ["AI trading", "algo trading", "automated crypto trading", "trading bot", "investment automation", "fintech"],
  openGraph: {
    title: "BEEW - Be Wealthy | AI Algorithmic Trading",
    description: "Automate your wealth generation with AI-driven strategies.",
    type: "website",
    locale: "en_US",
    siteName: "BEEW",
  },
  twitter: {
    card: "summary_large_image",
    title: "BEEW - Be Wealthy",
    description: "The future of algorithmic trading is here.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
