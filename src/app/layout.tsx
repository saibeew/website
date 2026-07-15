import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "beew.ai - MT5 Forex EA | War Room | Test Before You Pay",
  description: "Systematic MT5 trading system backtested 2018-2026. Test the algo free on our forward-test platform. Real-time severity-scored war room included. Limited founding seats.",
  keywords: ["MT5 expert advisor", "forex algo trading", "systematic trading", "war room trading", "MT5 EA", "automated forex"],
  metadataBase: new URL("https://beew.ai"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "beew.ai - Test the algo. Use the war room. Pay only when satisfied.",
    description: "MT5 Forex EA + live macro news war room. Backtested 2018-2026. Forward-test before you commit.",
    url: "https://beew.ai",
    type: "website",
    locale: "en_US",
    siteName: "beew.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "beew.ai - MT5 Forex EA + War Room",
    description: "Test the algo free. Use the war room. Pay only when satisfied.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
