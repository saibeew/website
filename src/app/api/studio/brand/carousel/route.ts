import { NextResponse } from "next/server";
import fs from "fs";
import os from "os";
import path from "path";
import sharp from "sharp";
import { z } from "zod";
import { getCurrentUser, isDatabaseConnectionError, unauthorizedResponse } from "@/lib/auth/user";
import { BEEW_BRAND, BRAND_TEMPLATES, getBrandTemplate } from "@/lib/studio/brand-assets";

export const dynamic = "force-dynamic";

const STUDIO_TEMP_ROOT = path.join(os.tmpdir(), "beew-studio");
const BRAND_OUTPUT_ROOT = path.join(STUDIO_TEMP_ROOT, "brand-carousels");
const PUBLIC_BRAND_ROOT = path.join(process.cwd(), "public", "brand-assets");

const carouselSchema = z.object({
  templateId: z.string().default("market"),
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().max(360).default(""),
  cta: z.string().trim().max(120).default("Follow Beew for market intelligence."),
  slideCount: z.number().int().min(1).max(7).default(3),
});

function escapeXml(value: string) {
  return value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] || char);
}

function wrapText(value: string, maxChars: number, maxLines: number) {
  const words = value.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines) break;
    } else {
      current = next;
    }
  }

  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:!?-]+$/, "")}...`;
  }

  return lines;
}

function svgTextLines(lines: string[], params: {
  x: number;
  y: number;
  lineHeight: number;
  fill: string;
  size: number;
  weight: number;
  letterSpacing?: number;
}) {
  return lines
    .map((line, index) => {
      const y = params.y + index * params.lineHeight;
      return `<text x="${params.x}" y="${y}" fill="${params.fill}" font-family="Arial, Helvetica, sans-serif" font-size="${params.size}" font-weight="${params.weight}" letter-spacing="${params.letterSpacing ?? 0}">${escapeXml(line)}</text>`;
    })
    .join("\n  ");
}

function mediaUrl(relativePath: string) {
  return `/api/studio/media?file=${encodeURIComponent(relativePath.replace(/\\/g, "/"))}`;
}

function readBrandAssetDataUri(assetPath: string) {
  const decodedAssetPath = decodeURIComponent(assetPath);
  const resolvedPath = path.resolve(PUBLIC_BRAND_ROOT, decodedAssetPath);
  if (!resolvedPath.startsWith(PUBLIC_BRAND_ROOT + path.sep)) {
    throw new Error("Invalid brand template path.");
  }
  const buffer = fs.readFileSync(resolvedPath);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

function renderSlideSvg(params: {
  backgroundDataUri: string;
  title: string;
  subtitle: string;
  cta: string;
  slideIndex: number;
  slideCount: number;
}) {
  const footerLines = wrapText(params.subtitle || params.title, 70, 1);
  const kicker = escapeXml("BEEW STUDIO");

  return `
<svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pageBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#020817"/>
      <stop offset="1" stop-color="#06142c"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1350" fill="url(#pageBg)"/>
  <rect x="38" y="30" width="1004" height="1255" rx="18" fill="#020817" opacity="0.72"/>
  <image href="${params.backgroundDataUri}" x="54" y="46" width="972" height="1215" preserveAspectRatio="xMidYMid meet"/>
  <rect x="54" y="46" width="972" height="1215" rx="8" fill="none" stroke="#213b68" stroke-width="2" opacity="0.65"/>
  <rect x="54" y="1288" width="972" height="1" fill="#284a7d" opacity="0.85"/>
  <text x="54" y="1324" fill="${BEEW_BRAND.blue}" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="900" letter-spacing="4">${kicker}</text>
  ${svgTextLines(footerLines, { x: 300, y: 1324, lineHeight: 22, fill: "#dbeafe", size: 18, weight: 700 })}
  <text x="972" y="1324" text-anchor="end" fill="#8aa7d6" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="800">${params.slideIndex + 1}/${params.slideCount}</text>
</svg>`.trim();
}

export async function GET() {
  return NextResponse.json({ success: true, brand: BEEW_BRAND, templates: BRAND_TEMPLATES });
}

export async function POST(request: Request) {
  try {
    try {
      const user = await getCurrentUser();
      if (!user) return unauthorizedResponse();
    } catch (error) {
      if (!isDatabaseConnectionError(error)) throw error;
    }

    const input = carouselSchema.parse(await request.json());
    const template = getBrandTemplate(input.templateId);
    const backgroundDataUri = readBrandAssetDataUri(template.assetPath);
    const jobId = crypto.randomUUID();
    const outputDir = path.join(BRAND_OUTPUT_ROOT, jobId);
    fs.mkdirSync(outputDir, { recursive: true });

    const slides = await Promise.all(Array.from({ length: input.slideCount }, async (_, index) => {
      const outputPath = path.join(outputDir, `beew_carousel_${index + 1}.png`);
      const svg = renderSlideSvg({
        backgroundDataUri,
        title: index === 0 ? input.title : `${input.title} (${index + 1})`,
        subtitle: input.subtitle,
        cta: input.cta,
        slideIndex: index,
        slideCount: input.slideCount,
      });
      await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outputPath);
      const relativePath = path.relative(STUDIO_TEMP_ROOT, outputPath);
      return {
        index: index + 1,
        path: outputPath,
        url: mediaUrl(relativePath),
      };
    }));

    return NextResponse.json({ success: true, template, slides });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues[0]?.message || "Invalid carousel data" }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to generate carousel" },
      { status: 500 }
    );
  }
}
