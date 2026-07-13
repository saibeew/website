import fs from "fs";
import { runFfmpegCommand } from "../effects/ffmpeg";
import { type TranscribedWord } from "./transcribe";

function generateClipAssSubtitles(words: TranscribedWord[], startOffset: number): string {
  const header = `[Script Info]
Title: Beew Reel Captions
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Outfit,72,&H00FFFFFF,&H00A78BFA,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,4,0,2,40,40,80,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const formatTime = (sec: number) => {
    const adjusted = Math.max(0, sec - startOffset);
    const h = Math.floor(adjusted / 3600);
    const m = Math.floor((adjusted % 3600) / 60);
    const s = Math.floor(adjusted % 60);
    const cs = Math.floor((adjusted * 100) % 100);
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  };

  let events = "";
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
    events += `Dialogue: 0,${formatTime(start)},${formatTime(end)},Default,,0,0,0,,${karaokeText}\n`;
  }

  return header + events;
}

export async function burnCaptions(params: {
  inputPath: string;
  outputPath: string;
  words: TranscribedWord[];
  clipStartSec: number;
}): Promise<{ success: boolean; error?: string }> {
  const assContent = generateClipAssSubtitles(params.words, params.clipStartSec);
  const assPath = params.outputPath.replace(/\.[^.]+$/, "_captions.ass");
  fs.writeFileSync(assPath, assContent, "utf-8");

  const escapedAssPath = assPath.replace(/\\/g, "/").replace(/:/g, "\\:");

  const args = [
    "-y",
    "-i", params.inputPath,
    "-vf", `ass='${escapedAssPath}'`,
    "-c:a", "copy",
    params.outputPath,
  ];

  return runFfmpegCommand(args);
}
