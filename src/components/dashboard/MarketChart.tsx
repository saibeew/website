"use client";

import { useEffect, useRef, memo } from "react";

const TradingViewWidget = memo(({ symbol }: { symbol: string }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear previous chart
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol,
      "interval": "60",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "hide_top_toolbar": true, 
      "hide_legend": true,
      "hide_side_toolbar": true,
      "allow_symbol_change": false,
      "calendar": false,
      "saveimage": false,
      "withdateranges": false,
      "show_popup_button": false,
      "support_host": "https://www.tradingview.com",
      "backgroundColor": "rgba(0, 0, 0, 0.0)", 
      "gridColor": "rgba(0, 0, 0, 0)",
      "hide_volume": true,
      "studies": [],
      "overrides": {
        "paneProperties.background": "#000000",
        "paneProperties.backgroundType": "solid",
        "paneProperties.vertGridProperties.color": "rgba(0, 0, 0, 0)",
        "paneProperties.vertGridProperties.style": 0,
        "paneProperties.horzGridProperties.color": "rgba(0, 0, 0, 0)",
        "paneProperties.horzGridProperties.style": 0,
        "scalesProperties.lineColor": "rgba(0, 0, 0, 0)",
        "scalesProperties.textColor": "#9ca3af", // text-gray-400
        "mainSeriesProperties.candleStyle.borderUpColor": "#22c55e",
        "mainSeriesProperties.candleStyle.borderDownColor": "#ef4444",
        "mainSeriesProperties.candleStyle.wickUpColor": "#22c55e",
        "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
        "paneProperties.legendProperties.showBackground": false
      }
    });
    container.current.appendChild(script);
  }, [symbol]);

  return <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }} />;
});

TradingViewWidget.displayName = "TradingViewWidget";

export default function MarketChart({ symbol = "XAUUSD" }: { symbol?: string }) {
  const getTVSymbol = (s: string) => {
      // Commodities
      if (s === "XAUUSD" || s === "GOLD") return "OANDA:XAUUSD";

      // Indices
      if (s === "US30" || s === "DJI") return "GLOBALPRIME:US30";
      if (s === "NAS100" || s === "NDX") return "GLOBALPRIME:NAS100";
      if (s === "SPX500" || s === "SPX") return "GLOBALPRIME:US500";
      
      // Crypto
      if (s.includes("BTC") || s.includes("ETH") || s.includes("SOL") || s.includes("XRP")) {
         return `BINANCE:${s.replace("USD", "USDT")}`;
      }

      // Default Forex
      if (s.includes(":")) return s;
      return `FX:${s}`;
  };

  return (
    <div className="w-full h-full relative group">
        <div className="w-full h-full" style={{ minHeight: "400px" }}>
            <TradingViewWidget symbol={getTVSymbol(symbol)} />
        </div>
    </div>
  );
}
