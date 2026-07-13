import fs from "fs";
import { runFfmpegCommand } from "./ffmpeg";

export type CaptionStyle = "plain" | "karaoke" | "lower-third";

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

function generateAssSubtitles(
  words: WordTimestamp[],
  style: CaptionStyle
): string {
  const header = `[Script Info]
Title: Beew Studio Captions
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Style: Default,Outfit,64,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,0,2,30,30,60,1
Style: Karaoke,Outfit,64,&H00FFFFFF,&H00A78BFA,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,0,2,30,30,60,1
Style: LowerThird,Outfit,52,&H00FFFFFF,&H000000FF,&H00000000,&HAA000000,-1,0,0,0,100,100,0,0,1,4,0,8,30,30,1700,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    const cs = Math.floor((sec * 100) % 100);
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  };

  let events = "";

  if (style === "karaoke") {
    // Group words into chunks of ~5 for readability
    const chunkSize = 5;
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize);
      const start = chunk[0].start;
      const end = chunk[chunk.length - 1].end;
      const karaokeText = chunk
        .map((w) => {
          const dur = Math.round((w.end - w.start) * 100);
          return `{\\kf${dur}}${w.word}`;
        })
        .join(" ");
      events += `Dialogue: 0,${formatTime(start)},${formatTime(end)},Karaoke,,0,0,0,,${karaokeText}\n`;
    }
  } else if (style === "lower-third") {
    const chunkSize = 8;
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize);
      const start = chunk[0].start;
      const end = chunk[chunk.length - 1].end;
      const text = chunk.map((w) => w.word).join(" ");
      events += `Dialogue: 0,${formatTime(start)},${formatTime(end)},LowerThird,,0,0,0,,${text}\n`;
    }
  } else {
    // Plain style
    const chunkSize = 6;
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize);
      const start = chunk[0].start;
      const end = chunk[chunk.length - 1].end;
      const text = chunk.map((w) => w.word).join(" ");
      events += `Dialogue: 0,${formatTime(start)},${formatTime(end)},Default,,0,0,0,,${text}\n`;
    }
  }

  return header + events;
}

export async function recaptionVideo(params: {
  inputPath: string;
  outputPath: string;
  words: WordTimestamp[];
  style: CaptionStyle;
}): Promise<{ success: boolean; error?: string }> {
  // 1. Generate ASS subtitle file
  const assContent = generateAssSubtitles(params.words, params.style);
  const assPath = params.outputPath.replace(/\.[^.]+$/, ".ass");
  fs.writeFileSync(assPath, assContent, "utf-8");

  // 2. Burn subtitles into video
  // Use ass filter for ASS subtitles (better styling than subtitles filter)
  const escapedAssPath = assPath.replace(/\\/g, "/").replace(/:/g, "\\:");
  const args = [
    "-y",
    "-i",
    params.inputPath,
    "-vf",
    `ass='${escapedAssPath}'`,
    "-c:a",
    "copy",
    params.outputPath,
  ];

  return runFfmpegCommand(args);
}

export { generateAssSubtitles, type WordTimestamp };
