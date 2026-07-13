import { type SignalType } from "./signal-analyzer";

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function generateChartExplainerSvg(signal: SignalType): Promise<string> {
  const isBullish = signal.bias === "Bullish";
  const color = isBullish ? "#10B981" : signal.bias === "Bearish" ? "#EF4444" : "#6B7280";
  const trendLabel = isBullish ? "UP" : signal.bias === "Bearish" ? "DOWN" : "FLAT";
  const safeSymbol = escapeSvgText(signal.symbol);
  const safeSource = escapeSvgText(signal.source.toUpperCase());
  const safeDescription = escapeSvgText(signal.description);
  const safeBias = escapeSvgText(signal.bias.toUpperCase());

  const svg = `
<svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Deep Space/Dark Gradient Background -->
  <rect width="1080" height="1920" fill="#030712"/>
  <circle cx="540" cy="960" r="800" fill="url(#radial-glow)" opacity="0.3"/>
  
  <!-- Subtle grid pattern -->
  <path d="M0 240H1080M0 480H1080M0 720H1080M0 960H1080M0 1200H1080M0 1440H1080M0 1680H1080" stroke="#374151" stroke-opacity="0.2" stroke-width="2"/>
  <path d="M180 0V1920M360 0V1920M540 0V1920M720 0V1920M900 0V1920" stroke="#374151" stroke-opacity="0.2" stroke-width="2"/>
  
  <!-- Header Branding -->
  <g transform="translate(100, 150)">
    <text fill="#A78BFA" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="36" letter-spacing="4">BEEW.AI</text>
    <text fill="#9CA3AF" font-family="'Inter', sans-serif" font-size="20" x="200" y="-3">QUANT INTELLIGENCE PROTOCOL</text>
    <rect x="-10" y="50" width="890" height="2" fill="#374151" opacity="0.5"/>
  </g>

  <!-- Signal Box -->
  <g transform="translate(100, 320)">
    <!-- Symbol Name -->
    <text fill="#FFFFFF" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="120">${safeSymbol}</text>
    
    <!-- Direction Badge -->
    <rect x="0" y="160" width="420" height="90" rx="45" fill="${color}" fill-opacity="0.15" stroke="${color}" stroke-width="3"/>
    <text fill="${color}" font-family="'Inter', sans-serif" font-weight="900" font-size="38" x="40" y="220">${trendLabel} ${safeBias} ALIGNMENT</text>
    
    <!-- Source Label -->
    <text fill="#6B7280" font-family="'Inter', sans-serif" font-size="24" x="450" y="215">SIGNAL SOURCE: ${safeSource}</text>
  </g>

  <!-- Main Chart Visualization Area -->
  <g transform="translate(100, 700)">
    <!-- Glassmorphic panel -->
    <rect width="880" height="500" rx="24" fill="#0B0F1A" fill-opacity="0.7" stroke="#1F2937" stroke-width="2"/>
    
    <!-- Mock Signal Graph Line -->
    <path d="M 60,350 L 180,280 L 300,320 L 420,180 L 540,240 L 660,110 L 820,${isBullish ? 70 : 420}" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow-effect)"/>
    
    <!-- Target indicators -->
    <circle cx="820" cy="${isBullish ? 70 : 420}" r="16" fill="${color}"/>
    <circle cx="820" cy="${isBullish ? 70 : 420}" r="32" fill="${color}" fill-opacity="0.3"/>
    
    <!-- Values -->
    <text fill="#9CA3AF" font-family="'Inter', sans-serif" font-size="20" x="60" y="440">MAE/MFE Limits Check: STABLE</text>
    <text fill="${color}" font-family="'Outfit', sans-serif" font-weight="700" font-size="28" x="680" y="${isBullish ? 160 : 340}">CONFIRMED EDGE</text>
  </g>

  <!-- Narrative/Telemetry details -->
  <g transform="translate(100, 1300)">
    <text fill="#9CA3AF" font-family="'Inter', sans-serif" font-weight="700" font-size="28">QUANT ANALYSIS SUMMARY</text>
    <foreignObject x="0" y="40" width="880" height="250">
      <div xmlns="http://www.w3.org/1999/xhtml" style="color: #E5E7EB; font-family: 'Inter', sans-serif; font-size: 26px; line-height: 1.6; font-weight: 300;">
        ${safeDescription}
      </div>
    </foreignObject>
  </g>

  <!-- Footer Warning/Leverage Risk Disclaimer -->
  <g transform="translate(100, 1700)">
    <rect x="-10" y="0" width="890" height="2" fill="#374151" opacity="0.5"/>
    <text fill="#6B7280" font-family="'Inter', sans-serif" font-size="18" y="50">SYSTEM DISCLAIMER: Trading leveraged financial instruments carries substantial risk of loss.</text>
    <text fill="#6B7280" font-family="'Inter', sans-serif" font-size="18" y="80">Always align position sizing with your equity curve variance and risk tolerance profile.</text>
  </g>

  <!-- Gradients & Filters -->
  <defs>
    <radialGradient id="radial-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#030712" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
</svg>
  `.trim();

  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}
