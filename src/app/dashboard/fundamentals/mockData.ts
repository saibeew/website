export const ECONOMIC_EVENTS = [
  {
    id: "1",
    date: "2025-12-19",
    time: "08:30",
    currency: "USD",
    impact: "High",
    event: "Core CPI (MoM)",
    actual: "0.3%",
    forecast: "0.3%",
    previous: "0.2%",
    bankForecast: "0.2% - 0.4%",
    playbook: {
      bias: "Bearish USD",
      scenario: "If CPI < 0.2%, unexpected disinflation could trigger dovish repricing.",
      targets: ["Long XAUUSD", "Short USDJPY"]
    }
  },
  {
    id: "2",
    date: "2025-12-19",
    time: "14:00",
    currency: "USD",
    impact: "High",
    event: "FOMC Interest Rate Decision",
    actual: "5.50%",
    forecast: "5.50%",
    previous: "5.50%",
    bankForecast: "5.50%",
    playbook: {
      bias: "Neutral",
      scenario: "Rates likely hold. Watch dot plot for 2026 cuts.",
      targets: ["Watch DXY", "Range Trade SPX"]
    }
  },
  {
    id: "3",
    date: "2025-12-20",
    time: "03:00",
    currency: "JPY",
    impact: "Medium",
    event: "BOJ Monetary Policy Statement",
    actual: "-",
    forecast: "-",
    previous: "-",
    bankForecast: "Hold",
    playbook: {
      bias: "Volatile",
      scenario: "Speculation on YCC tweak. Any hawkish hint spikes JPY.",
      targets: ["Short EURJPY"]
    }
  },
  {
    id: "4",
    date: "2025-12-20",
    time: "07:00",
    currency: "GBP",
    impact: "Low",
    event: "Retail Sales (YoY)",
    actual: "-",
    forecast: "1.2%",
    previous: "1.0%",
    bankForecast: "1.0% - 1.5%",
    playbook: null
  }
];

export const NEWS_FEED = [
  {
    id: "1",
    time: "10:45",
    tags: ["XAUUSD", "Geopolitics"],
    headline: "Gold spikes as tensions rise in Middle East; safe haven flows intensify.",
    sentiment: "Bullish"
  },
  {
    id: "2",
    time: "09:30",
    tags: ["BTC", "ETF"],
    headline: "BlackRock Bitcoin ETF sees record inflows for 3rd consecutive day.",
    sentiment: "Bullish"
  },
  {
    id: "3",
    time: "08:15",
    tags: ["EURUSD", "ECB"],
    headline: "Lagarde hints at 'pause' in rate hikes during panel discussion.",
    sentiment: "Bearish"
  }
];

export const MARKET_SENTIMENT = {
  bias: "Slightly Bullish",
  score: 65, // 0-100
  drivers: ["Dovish Fed Bets", "Strong Tech Earnings", "Stable Oil"]
};
