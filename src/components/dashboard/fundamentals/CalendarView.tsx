"use client";

import { useRef, useEffect } from "react";

export default function MarketingEconomicCalendar() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "colorTheme": "dark",
      "isTransparent": true,
      "width": "100%",
      "height": "100%",
      "locale": "en",
      "importanceFilter": "0,1",
      "currencyFilter": "USD,EUR,GBP,JPY,AUD,CAD,CHF"
    });
    container.current.appendChild(script);
  }, []);

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Global Economic Calendar</h2>
          <p className="text-text-muted">High-impact events shaping the market narrative.</p>
      </div>
      <div className="flex-1 bg-surface/30 border border-white/5 rounded-xl overflow-hidden relative">
         <div className="tradingview-widget-container h-full w-full" ref={container}></div>
      </div>
    </div>
  );
}
