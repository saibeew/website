import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

export interface TranscribedWord {
  word: string;
  start: number;
  end: number;
}

export interface TranscriptionResult {
  text: string;
  words: TranscribedWord[];
  language?: string;
}

function buildTranscribeScript(audioPath: string): string {
  return `
import sys, json
try:
    from faster_whisper import WhisperModel
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    segments, info = model.transcribe("${audioPath.replace(/\\/g, "/")}", word_timestamps=True)
    words = []
    for seg in segments:
        for w in seg.words:
            words.append({"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})
    text = " ".join([w["word"] for w in words])
    print(json.dumps({"text": text, "words": words, "language": info.language}))
except Exception as e:
    print(json.dumps({"error": str(e)}), file=sys.stderr)
    sys.exit(1)
`;
}

export async function transcribeAudio(audioPath: string): Promise<TranscriptionResult> {
  const script = buildTranscribeScript(audioPath);
  const tmpDir = path.join(os.tmpdir(), "beew-studio");
  fs.mkdirSync(tmpDir, { recursive: true });
  const tmpScript = path.join(tmpDir, `tmp_transcribe_${Date.now()}.py`);
  fs.writeFileSync(tmpScript, script, "utf-8");

  return new Promise((resolve, reject) => {
    const proc = spawn("python", [tmpScript]);
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));

    proc.on("error", (err) => {
      fs.rmSync(tmpScript, { force: true });
      reject(new Error(`Python not found: ${err.message}`));
    });

    proc.on("close", (code) => {
      fs.rmSync(tmpScript, { force: true });
      if (code !== 0) {
        reject(new Error(`Transcription failed: ${stderr}`));
        return;
      }
      try {
        const result = JSON.parse(stdout.trim());
        if (result.error) reject(new Error(result.error));
        else resolve(result as TranscriptionResult);
      } catch {
        reject(new Error(`Invalid transcription output: ${stdout}`));
      }
    });
  });
}
