"use client";

import { useEffect, useState } from "react";
import { Scissors, Loader2, Link, Film, Calendar } from "lucide-react";

/**
 * Converts a local beew-studio temp path to a browser-accessible URL.
 * e.g. C:\Users\saibi\AppData\Local\Temp\beew-studio\clips\abc\reel_1.mp4
 *   -> /api/studio/media?file=clips/abc/reel_1.mp4
 */
function toMediaUrl(localPath: string): string {
  // Normalize to forward slashes
  const normalized = localPath.replace(/\\/g, "/");
  const marker = "beew-studio/";
  const idx = normalized.indexOf(marker);
  if (idx === -1) return localPath; // fallback: return as-is
  const relativePath = normalized.substring(idx + marker.length);
  return `/api/studio/media?file=${encodeURIComponent(relativePath)}`;
}
import JobStatusCard from "./JobStatusCard";

interface Clip {
  index: number;
  outputPath: string;
  startSec: number;
  endSec: number;
  score: number;
  preview: string;
}

type ActiveJob = {
  status: "idle" | "queued" | "processing" | "done" | "failed";
  progress: number;
  message: string;
  jobId?: string;
};

type MediaFile = {
  name: string;
  path: string;
  url: string;
  type: string;
  size: number;
};

type StudioJob = {
  id: string;
  service: string;
  status: "queued" | "processing" | "done" | "failed";
  progress: number;
  output?: {
    clips?: Clip[];
    transcript?: string;
    totalDurationSec?: number;
  } | null;
  error?: string | null;
};

export default function ClipperPanel() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [localFilePath, setLocalFilePath] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [clipCount, setClipCount] = useState(3);
  const [duration, setDuration] = useState(30);

  const [loading, setLoading] = useState(false);
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [processingMode, setProcessingMode] = useState<{
    checked: boolean;
    localProcessingEnabled: boolean;
    ffmpegAvailable: boolean;
  }>({ checked: false, localProcessingEnabled: false, ffmpegAvailable: false });

  const [result, setResult] = useState<{
    clips: Clip[];
    transcript: string;
    totalDurationSec: number;
  } | null>(null);

  useEffect(() => {
    let alive = true;

    fetch("/api/studio/clipper")
      .then((res) => res.json())
      .then((data) => {
        if (!alive || !data.success) return;
        setProcessingMode({
          checked: true,
          localProcessingEnabled: Boolean(data.localProcessingEnabled),
          ffmpegAvailable: Boolean(data.ffmpegAvailable),
        });
      })
      .catch(() => {
        if (alive) setProcessingMode((prev) => ({ ...prev, checked: true }));
      });

    fetch("/api/studio/media")
      .then((res) => res.json())
      .then((data) => {
        if (!alive || !data.success) return;
        setMediaFiles((data.files || []).filter((file: MediaFile) => file.type === "video" || file.type?.startsWith("video/")));
      })
      .catch(() => undefined);

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!activeJob?.jobId || activeJob.status === "done" || activeJob.status === "failed") return;

    let alive = true;

    const pollJob = async () => {
      try {
        const res = await fetch("/api/studio/jobs?limit=20");
        const data = await res.json();
        if (!alive || !data.success) return;

        const job = (data.jobs || []).find((item: StudioJob) => item.id === activeJob.jobId);
        if (!job) return;

        if (job.status === "done" && job.output?.clips) {
          setResult({
            clips: job.output.clips,
            transcript: job.output.transcript || "",
            totalDurationSec: job.output.totalDurationSec || 0,
          });
          setActiveJob({
            status: "done",
            progress: 100,
            jobId: job.id,
            message: "Clipper job complete. Reel preview is ready below.",
          });
          return;
        }

        if (job.status === "failed") {
          setActiveJob({
            status: "failed",
            progress: job.progress || 0,
            jobId: job.id,
            message: job.error || "Clipper worker failed.",
          });
          return;
        }

        setActiveJob({
          status: job.status,
          progress: job.progress || 0,
          jobId: job.id,
          message:
            job.status === "queued"
              ? "Queued. Keep npm.cmd run studio:worker running in another terminal."
              : "Worker is processing this video.",
        });
      } catch {
        if (!alive) return;
      }
    };

    pollJob();
    const interval = window.setInterval(pollJob, 5000);

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [activeJob?.jobId, activeJob?.status]);

  const handleStartClipper = async () => {
    if (!sourceUrl && !localFilePath) {
      alert("Please specify a YouTube URL or local video filepath");
      return;
    }

    setLoading(true);
    setResult(null);
    setActiveJob({ status: "processing", progress: 5, message: "Initiating clip streams..." });

    try {
      // Simulate progress checkpoints for clipper
      const progressSteps = [
        { progress: 15, message: "Acquiring source video via yt-dlp..." },
        { progress: 35, message: "Extracting reference audio signals..." },
        { progress: 60, message: "Transcribing speech files (Whisper Tiny)..." },
        { progress: 80, message: "Scoring hook boundaries and reframing 9:16..." },
        { progress: 95, message: "Burning karaoke captions..." },
      ];

      let stepIdx = 0;
      const interval = setInterval(() => {
        if (stepIdx < progressSteps.length) {
          setActiveJob({
            status: "processing",
            progress: progressSteps[stepIdx].progress,
            message: progressSteps[stepIdx].message,
          });
          stepIdx++;
        }
      }, 2500);

      const res = await fetch("/api/studio/clipper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceUrl: sourceUrl || undefined,
          localFilePath: localFilePath || undefined,
          clipCount,
          targetDurationSec: duration,
        }),
      });

      clearInterval(interval);
      const data = await res.json();

      if (data.success && data.queued) {
        setActiveJob({
          status: "queued",
          progress: data.job?.progress ?? 0,
          jobId: data.job?.id,
          message: data.message || "Clipper job queued for worker processing.",
        });
      } else if (data.success) {
        setResult(data);
        setActiveJob({ status: "done", progress: 100, message: "Short-form clips extraction completed!" });
      } else {
        setActiveJob({ status: "failed", progress: 0, message: data.error || "Clipping pipeline failed" });
      }
    } catch (err: any) {
      setActiveJob({ status: "failed", progress: 0, message: err.message || "Request failed" });
    } finally {
      setLoading(false);
    }
  };

  const handlePublishClip = async (clip: Clip) => {
    try {
      const mediaUrl = toMediaUrl(clip.outputPath);
      const res = await fetch("/api/studio/publisher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Reel #${clip.index}: Quant Intelligence`,
          caption: `${clip.preview}\n\n#BeewStudio #Algos #Trading`,
          mediaUrl,
          platform: "telegram",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Clip #${clip.index} enqueued for review!`);
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Parameter Inputs */}
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Scissors className="h-5 w-5 text-violet-400" />
            Reel Clipper (Async)
          </h2>
          <p className="text-sm text-gray-400">
            Extract engaging vertical shorts from horizontal video materials.
          </p>
          {processingMode.checked && !processingMode.localProcessingEnabled && (
            <p className="mt-2 rounded-lg border border-yellow-500/20 bg-yellow-950/20 px-3 py-2 text-xs text-yellow-200">
              Hosted mode queues video jobs for the Studio worker. Local rendering runs only with FFmpeg and
              ENABLE_LOCAL_STUDIO_PROCESSING=true.
            </p>
          )}
          {processingMode.localProcessingEnabled && !processingMode.ffmpegAvailable && (
            <p className="mt-2 rounded-lg border border-red-500/20 bg-red-950/20 px-3 py-2 text-xs text-red-200">
              Local processing is enabled, but FFmpeg was not found on this machine.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase block mb-1.5">Uploaded Video</label>
            <select
              value={localFilePath}
              onChange={(e) => {
                setLocalFilePath(e.target.value);
                if (e.target.value) setSourceUrl("");
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
            >
              <option value="">Select uploaded video</option>
              {mediaFiles.map((file) => (
                <option key={file.path} value={file.path}>
                  {file.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase block mb-1.5 flex items-center gap-1">
              <Link className="h-3.5 w-3.5" /> Source Link / YouTube URL
            </label>
            <input
              type="text"
              value={sourceUrl}
              onChange={(e) => {
                setSourceUrl(e.target.value);
                if (e.target.value) setLocalFilePath("");
              }}
              placeholder="https://youtube.com/watch?..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 placeholder-gray-600"
            />
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-3 text-[10px] text-gray-500 uppercase font-bold">OR manual path</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase block mb-1.5">Local Server File Path</label>
            <input
              type="text"
              value={localFilePath}
              onChange={(e) => {
                setLocalFilePath(e.target.value);
                if (e.target.value) setSourceUrl("");
              }}
              placeholder="e.g. public/studio/uploads/input.mp4"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 placeholder-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase block mb-1.5">Clip count</label>
              <input
                type="number"
                min="1"
                max="10"
                value={clipCount}
                onChange={(e) => setClipCount(parseInt(e.target.value) || 3)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase block mb-1.5">Target Duration (s)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              >
                <option value="15">15 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">60 seconds</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStartClipper}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-sm font-bold text-white transition shadow-lg shadow-violet-500/20"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}
            Queue Clip Job
          </button>
        </div>

        {activeJob && (
          <JobStatusCard
            title={sourceUrl ? "YT Video" : "Local File"}
            service="Reel Clipper"
            status={activeJob.status}
            progress={activeJob.progress}
            message={activeJob.message}
            jobId={activeJob.jobId}
          />
        )}
      </div>

      {/* Output list of clips */}
      <div className="lg:col-span-2 space-y-6">
        {result ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-violet-300 flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Film className="h-4 w-4" />
              Extracted Short Clips ({result.clips.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.clips.map((clip) => (
                <div key={clip.index} className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-white">Clip #{clip.index}</span>
                      <span className="text-xs text-violet-400">Score: {clip.score}</span>
                    </div>
                    {/* Video Preview */}
                    <div className="aspect-[9/16] max-h-[200px] rounded-lg overflow-hidden border border-white/10 bg-gray-950 mb-3">
                      <video
                        src={toMediaUrl(clip.outputPath)}
                        controls
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                    </div>
                    <p className="text-xs text-gray-300 line-clamp-3 italic mb-3">
                      &quot;{clip.preview}&quot;
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePublishClip(clip)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition"
                    >
                      <Calendar className="h-3 w-3" /> Publish
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 mt-6">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Video Transcript</h4>
              <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed max-h-[150px] overflow-y-auto">
                {result.transcript}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-12 text-center text-gray-500">
            <Film className="h-8 w-8 mb-2" />
            <p className="text-sm">Extracted video clips and voice transcriptions will populate here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
