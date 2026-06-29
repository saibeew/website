export interface Entity {
  name: string;
  icon: string;
  type: string;
}

/**
 * Utility to parse and extract financial entities from text (title and summary).
 * Detects coins, exchanges, forex pairs, commodities, companies, geopolitical actors,
 * central banks, indices, and macro events.
 */
export function extractEntities(title = "", summary = ""): Entity[] {
  const text = `${title} ${summary || ""}`.toLowerCase();
  const entities: Entity[] = [];
  const matchedNames = new Set<string>();

  // ── Forex regexes (highest priority) ──────────────────────────────
  const forexRegexes = [
    { pattern: /\b(eur\s*\/\s*usd|eurusd)\b/i, name: "EUR/USD", icon: "💵", type: "forex" },
    { pattern: /\b(gbp\s*\/\s*usd|gbpusd)\b/i, name: "GBP/USD", icon: "💵", type: "forex" },
    { pattern: /\b(usd\s*\/\s*jpy|usdjpy)\b/i, name: "USD/JPY", icon: "💵", type: "forex" },
    { pattern: /\b(aud\s*\/\s*usd|audusd)\b/i, name: "AUD/USD", icon: "💵", type: "forex" },
    { pattern: /\b(usd\s*\/\s*cad|usdcad)\b/i, name: "USD/CAD", icon: "💵", type: "forex" },
    { pattern: /\b(nzd\s*\/\s*usd|nzdusd)\b/i, name: "NZD/USD", icon: "💵", type: "forex" },
    { pattern: /\b(usd\s*\/\s*chf|usdchf)\b/i, name: "USD/CHF", icon: "💵", type: "forex" },
    { pattern: /\b(xau\s*\/\s*usd|xauusd)\b/i, name: "XAU/USD (Gold)", icon: "✨", type: "forex" },
    { pattern: /\b(xag\s*\/\s*usd|xagusd)\b/i, name: "XAG/USD (Silver)", icon: "🥈", type: "forex" },
    { pattern: /\b(usd\s*\/\s*inr|usdinr)\b/i, name: "USD/INR", icon: "💵", type: "forex" },
    { pattern: /\b(usd\s*\/\s*cny|usdccny|yuan)\b/i, name: "USD/CNY", icon: "💵", type: "forex" },
    { pattern: /\bforex\b/i, name: "Forex", icon: "📈", type: "forex" },
    { pattern: /\bdxy\b|\bdollar\s+index\b/i, name: "DXY (Dollar Index)", icon: "💵", type: "forex" },
  ];

  for (const item of forexRegexes) {
    if (item.pattern.test(text)) {
      if (!matchedNames.has(item.name)) {
        entities.push({ name: item.name, icon: item.icon, type: item.type });
        matchedNames.add(item.name);
      }
    }
  }

  const addFromMap = (map: Record<string, Entity>) => {
    for (const key in map) {
      if (text.includes(key)) {
        const entry = map[key];
        if (!matchedNames.has(entry.name)) {
          entities.push(entry);
          matchedNames.add(entry.name);
        }
      }
    }
  };

  // ── Cryptocurrencies ───────────────────────────────────────────────
  addFromMap({
    bitcoin:      { name: "Bitcoin (BTC)",  icon: "🪙", type: "coin" },
    " btc ":      { name: "Bitcoin (BTC)",  icon: "🪙", type: "coin" },
    ethereum:     { name: "Ethereum (ETH)", icon: "🪙", type: "coin" },
    " eth ":      { name: "Ethereum (ETH)", icon: "🪙", type: "coin" },
    solana:       { name: "Solana (SOL)",   icon: "🪙", type: "coin" },
    " sol ":      { name: "Solana (SOL)",   icon: "🪙", type: "coin" },
    ripple:       { name: "XRP",            icon: "🪙", type: "coin" },
    " xrp ":      { name: "XRP",            icon: "🪙", type: "coin" },
    cardano:      { name: "Cardano (ADA)",  icon: "🪙", type: "coin" },
    dogecoin:     { name: "Dogecoin",       icon: "🪙", type: "coin" },
    doge:         { name: "Dogecoin",       icon: "🪙", type: "coin" },
    uniswap:      { name: "Uniswap (UNI)", icon: "🪙", type: "coin" },
    altcoin:      { name: "Altcoins",       icon: "🪙", type: "coin" },
    stablecoin:   { name: "Stablecoins",    icon: "🪙", type: "coin" },
    cryptocurrency: { name: "Crypto",       icon: "🪙", type: "coin" },
    crypto:       { name: "Crypto",         icon: "🪙", type: "coin" },
    blockchain:   { name: "Blockchain",     icon: "🪙", type: "coin" },
    defi:         { name: "DeFi",           icon: "🪙", type: "coin" },
  });

  // ── Crypto Exchanges ───────────────────────────────────────────────
  addFromMap({
    coinbase:  { name: "Coinbase",  icon: "💼", type: "exchange" },
    binance:   { name: "Binance",   icon: "💼", type: "exchange" },
    kraken:    { name: "Kraken",    icon: "💼", type: "exchange" },
    bybit:     { name: "Bybit",     icon: "💼", type: "exchange" },
    okx:       { name: "OKX",       icon: "💼", type: "exchange" },
    bitfinex:  { name: "Bitfinex",  icon: "💼", type: "exchange" },
    huobi:     { name: "Huobi",     icon: "💼", type: "exchange" },
  });

  // ── Commodities ───────────────────────────────────────────────────
  addFromMap({
    gold:         { name: "Gold",          icon: "✨", type: "commodity" },
    silver:       { name: "Silver",        icon: "🥈", type: "commodity" },
    "crude oil":  { name: "Crude Oil",     icon: "🛢️", type: "commodity" },
    "crude":      { name: "Crude Oil",     icon: "🛢️", type: "commodity" },
    brent:        { name: "Brent Crude",   icon: "🛢️", type: "commodity" },
    " wti ":      { name: "WTI Oil",       icon: "🛢️", type: "commodity" },
    opec:         { name: "OPEC",          icon: "🛢️", type: "commodity" },
    "natural gas": { name: "Natural Gas",  icon: "🔥", type: "commodity" },
    "nat gas":    { name: "Natural Gas",   icon: "🔥", type: "commodity" },
    lng:          { name: "LNG",           icon: "🔥", type: "commodity" },
    copper:       { name: "Copper",        icon: "🟠", type: "commodity" },
    wheat:        { name: "Wheat",         icon: "🌾", type: "commodity" },
    corn:         { name: "Corn",          icon: "🌽", type: "commodity" },
    platinum:     { name: "Platinum",      icon: "⬜", type: "commodity" },
    palladium:    { name: "Palladium",     icon: "⬜", type: "commodity" },
  });

  // ── Equity Indices ─────────────────────────────────────────────────
  addFromMap({
    "s&p 500":    { name: "S&P 500",       icon: "📊", type: "index" },
    "s&p500":     { name: "S&P 500",       icon: "📊", type: "index" },
    "sp500":      { name: "S&P 500",       icon: "📊", type: "index" },
    nasdaq:       { name: "Nasdaq",         icon: "📊", type: "index" },
    "dow jones":  { name: "Dow Jones",      icon: "📊", type: "index" },
    "dow":        { name: "Dow Jones",      icon: "📊", type: "index" },
    nikkei:       { name: "Nikkei 225",     icon: "📊", type: "index" },
    "hang seng":  { name: "Hang Seng",      icon: "📊", type: "index" },
    "ftse":       { name: "FTSE 100",       icon: "📊", type: "index" },
    "dax":        { name: "DAX",            icon: "📊", type: "index" },
    "vix":        { name: "VIX (Fear Index)", icon: "📊", type: "index" },
    "russell":    { name: "Russell 2000",   icon: "📊", type: "index" },
  });

  // ── Central Banks & Macro Actors ───────────────────────────────────
  addFromMap({
    "federal reserve": { name: "Federal Reserve", icon: "🏦", type: "macro" },
    " fed ":           { name: "Federal Reserve", icon: "🏦", type: "macro" },
    "fomc":            { name: "FOMC",             icon: "🏦", type: "macro" },
    "jerome powell":   { name: "Powell (Fed)",     icon: "🏦", type: "macro" },
    " ecb ":           { name: "ECB",              icon: "🏦", type: "macro" },
    "european central bank": { name: "ECB",        icon: "🏦", type: "macro" },
    " boe ":           { name: "Bank of England",  icon: "🏦", type: "macro" },
    "bank of england": { name: "Bank of England",  icon: "🏦", type: "macro" },
    " boj ":           { name: "Bank of Japan",    icon: "🏦", type: "macro" },
    "bank of japan":   { name: "Bank of Japan",    icon: "🏦", type: "macro" },
    "pboc":            { name: "PBOC (China)",      icon: "🏦", type: "macro" },
    "interest rate":   { name: "Interest Rates",   icon: "🏦", type: "macro" },
    "rate cut":        { name: "Rate Cut",          icon: "🏦", type: "macro" },
    "rate hike":       { name: "Rate Hike",         icon: "🏦", type: "macro" },
    "quantitative":    { name: "QE/QT Policy",      icon: "🏦", type: "macro" },
    " cpi ":           { name: "CPI (Inflation)",   icon: "📉", type: "macro" },
    " pce ":           { name: "PCE (Inflation)",   icon: "📉", type: "macro" },
    " gdp ":           { name: "GDP",               icon: "📉", type: "macro" },
    "nonfarm":         { name: "NFP Jobs Report",   icon: "📉", type: "macro" },
    "unemployment":    { name: "Unemployment",      icon: "📉", type: "macro" },
    " imf ":           { name: "IMF",               icon: "🏦", type: "macro" },
    "world bank":      { name: "World Bank",        icon: "🏦", type: "macro" },
  });

  // ── Geopolitical Actors & Conflict Zones ──────────────────────────
  addFromMap({
    ukraine:     { name: "Ukraine War",      icon: "⚔️", type: "geopolitical" },
    russia:      { name: "Russia",           icon: "⚔️", type: "geopolitical" },
    "middle east": { name: "Middle East",    icon: "⚔️", type: "geopolitical" },
    israel:      { name: "Israel",           icon: "⚔️", type: "geopolitical" },
    iran:        { name: "Iran",             icon: "⚔️", type: "geopolitical" },
    hamas:       { name: "Hamas/Gaza",       icon: "⚔️", type: "geopolitical" },
    gaza:        { name: "Gaza",             icon: "⚔️", type: "geopolitical" },
    hezbollah:   { name: "Hezbollah",        icon: "⚔️", type: "geopolitical" },
    "north korea": { name: "North Korea",    icon: "⚔️", type: "geopolitical" },
    taiwan:      { name: "Taiwan Strait",    icon: "⚔️", type: "geopolitical" },
    china:       { name: "China",            icon: "⚔️", type: "geopolitical" },
    sanction:    { name: "Sanctions",        icon: "⚔️", type: "geopolitical" },
    ceasefire:   { name: "Ceasefire",        icon: "🕊️", type: "geopolitical" },
    airstrike:   { name: "Airstrike",        icon: "⚔️", type: "geopolitical" },
    nato:        { name: "NATO",             icon: "⚔️", type: "geopolitical" },
    tariff:      { name: "Tariffs",          icon: "🌐", type: "geopolitical" },
    "trade war":  { name: "Trade War",       icon: "🌐", type: "geopolitical" },
    "trade deal": { name: "Trade Deal",      icon: "🌐", type: "geopolitical" },
  });

  // ── Major Companies / Equities ────────────────────────────────────
  addFromMap({
    nvidia:      { name: "Nvidia",      icon: "🏢", type: "company" },
    apple:       { name: "Apple",       icon: "🏢", type: "company" },
    microsoft:   { name: "Microsoft",   icon: "🏢", type: "company" },
    google:      { name: "Google",      icon: "🏢", type: "company" },
    amazon:      { name: "Amazon",      icon: "🏢", type: "company" },
    meta:        { name: "Meta",        icon: "🏢", type: "company" },
    tesla:       { name: "Tesla",       icon: "🏢", type: "company" },
    jpmorgan:    { name: "JPMorgan",    icon: "🏢", type: "company" },
    "goldman sachs": { name: "Goldman Sachs", icon: "🏢", type: "company" },
    blackrock:   { name: "BlackRock",   icon: "🏢", type: "company" },
    spacex:      { name: "SpaceX",      icon: "🏢", type: "company" },
    intel:       { name: "Intel",       icon: "🏢", type: "company" },
    "bank of america": { name: "Bank of America", icon: "🏢", type: "company" },
  });

  return entities;
}
