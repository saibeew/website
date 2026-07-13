import { type TranscribedWord } from "./transcribe";

const HIGH_IMPACT_KEYWORDS = [
  "important", "key", "crucial", "breaking", "alert", "warning", "remember",
  "note", "critical", "significant", "massive", "huge", "major", "finally",
  // Finance / quant specific
  "rally", "crash", "breakout", "signal", "buy", "sell", "bearish", "bullish",
  "inflation", "fed", "rate", "yield", "liquidity", "volatility",
];

export interface ClipWindow {
  startSec: number;
  endSec: number;
  score: number;
  words: TranscribedWord[];
  preview: string;
}

function scoreWindow(words: TranscribedWord[]): number {
  const text = words.map((w) => w.word.toLowerCase()).join(" ");
  let score = 0;

  // Keyword hits
  for (const kw of HIGH_IMPACT_KEYWORDS) {
    if (text.includes(kw)) score += 2;
  }

  // Speech density (words per second)
  const durationSec = (words[words.length - 1]?.end ?? 0) - (words[0]?.start ?? 0);
  if (durationSec > 0) {
    const wps = words.length / durationSec;
    score += Math.min(wps * 0.5, 3); // Cap at 3 pts for density
  }

  // Sentence completeness (ends with punctuation)
  const lastWord = words[words.length - 1]?.word || "";
  if (/[.!?]$/.test(lastWord.trim())) score += 1.5;

  return Math.round(score * 10) / 10;
}

export function selectBestClips(
  words: TranscribedWord[],
  clipCount = 5,
  targetDurationSec = 30
): ClipWindow[] {
  if (words.length === 0) return [];

  const windows: ClipWindow[] = [];
  const step = Math.floor(targetDurationSec / 2); // Sliding window step in seconds

  const totalDur = words[words.length - 1].end;
  let t = 0;

  while (t < totalDur - targetDurationSec) {
    const end = t + targetDurationSec;
    const windowWords = words.filter((w) => w.start >= t && w.end <= end);

    if (windowWords.length > 3) {
      windows.push({
        startSec: t,
        endSec: end,
        score: scoreWindow(windowWords),
        words: windowWords,
        preview: windowWords
          .slice(0, 12)
          .map((w) => w.word)
          .join(" ") + "...",
      });
    }
    t += step;
  }

  // Sort by score, return top N, ensure no overlapping clips
  const sorted = windows.sort((a, b) => b.score - a.score);
  const selected: ClipWindow[] = [];

  for (const clip of sorted) {
    const overlaps = selected.some(
      (s) => clip.startSec < s.endSec && clip.endSec > s.startSec
    );
    if (!overlaps) {
      selected.push(clip);
      if (selected.length >= clipCount) break;
    }
  }

  return selected.sort((a, b) => a.startSec - b.startSec);
}
