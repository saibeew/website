export type BrandTemplateKind = "market" | "educational" | "announcement" | "data-stat" | "quote";

export type BrandTemplate = {
  id: BrandTemplateKind;
  label: string;
  assetPath: string;
  tone: string;
};

export const BEEW_BRAND = {
  name: "Beew Quant",
  primary: "#001b4d",
  navy: "#020b1a",
  blue: "#4f8fe8",
  white: "#ffffff",
  logoDark: "/brand-assets/logos/Primary%20logo%20dark%20version_.png",
  logoLight: "/brand-assets/logos/Primary%20logo%20light%20version_.png",
  reelCover: "/brand-assets/ig-reel-cover.png",
};

export const BRAND_TEMPLATES: BrandTemplate[] = [
  {
    id: "market",
    label: "Market Edge",
    assetPath: "templates/Market_.png",
    tone: "Macro market breakdowns and risk-on/risk-off explainers.",
  },
  {
    id: "educational",
    label: "Educational",
    assetPath: "templates/Educational_.png",
    tone: "Trading education, concepts, and playbook content.",
  },
  {
    id: "announcement",
    label: "Announcement",
    assetPath: "templates/Announcement.png",
    tone: "Product updates, alerts, and release notices.",
  },
  {
    id: "data-stat",
    label: "Data Stat",
    assetPath: "templates/Data%20Stat.png",
    tone: "Numbers, signals, performance snapshots, and key metrics.",
  },
  {
    id: "quote",
    label: "Quote",
    assetPath: "templates/Quote.png",
    tone: "Founder notes, market wisdom, and punchy opinions.",
  },
];

export function getBrandTemplate(id: string) {
  return BRAND_TEMPLATES.find((template) => template.id === id) || BRAND_TEMPLATES[0];
}
