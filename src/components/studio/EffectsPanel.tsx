"use client";

import { useEffect, useState } from "react";
import { Sliders, Loader2, Play, Video, ArrowRight, Check } from "lucide-react";
import JobStatusCard from "./JobStatusCard";

type ActiveJob = {
  status: "idle" | "queued" | "processing" | "done" | "failed";
  progress: number;
  message: string;
  jobId?: string;
};

type MediaFile = {
  name: string;
  path: string;
  type: string;
};

export default function EffectsPanel() {
  const [selectedEffect, setSelectedEffect] = useState("speed");
  const [inputPath, setInputPath] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  
  // Effect parameters
  const [speedMultiplier, setSpeedMultiplier] = useState(1.25);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(10);
  const [reframeMode, setReframeMode] = useState("blur-fill");

  const [loading, setLoading] = useState(false);
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [processingMode, setProcessingMode] = useState<{
    checked: boolean;
    localProcessingEnabled: boolean;
    ffmpegAvailable: boolean;
  }>({ checked: false, localProcessingEnabled: false, ffmpegAvailable: false });
  const [result, setResult] = useState<{ success: boolean; outputPath?: string; error?: string } | null>(null);

  useEffect(() => {
    let alive = true;

    fetch("/api/studio/effects")
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

  const handleApply = async () => {
    if (!inputPath) {
      alert("Please specify the target video input path");
      return;
    }

    setLoading(true);
    setResult(null);
    setActiveJob({ status: "processing", progress: 10, message: "Reading video frames..." });

    const outputPath = inputPath.replace(/\.[^.]+$/, `_effect_${selectedEffect}.mp4`);

    try {
      const body: Record<string, any> = {
        effect: selectedEffect,
        inputPath,
        outputPath,
      };

      if (selectedEffect === "speed") {
        body.multiplier = speedMultiplier;
      } else if (selectedEffect === "trim") {
        body.startSec = trimStart;
        body.endSec = trimEnd;
      } else if (selectedEffect === "reframe") {
        body.mode = reframeMode;
      }

      // Simulate rendering progress bar updates
      const interval = setInterval(() => {
        setActiveJob((prev) => {
          if (!prev) return null;
          if (prev.progress >= 90) return prev;
          return {
            ...prev,
            progress: prev.progress + 12,
            message: prev.progress > 60 ? "Stitching video audio tracks..." : "Applying filter parameters...",
          };
        });
      }, 900);

      const res = await fetch("/api/studio/effects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      clearInterval(interval);
      const data = await res.json();

      if (data.success && data.queued) {
        setActiveJob({
          status: "queued",
          progress: data.job?.progress ?? 0,
          jobId: data.job?.id,
          message: data.message || "Effects job queued for worker rendering.",
        });
      } else if (data.success) {
        setResult(data);
        setActiveJob({ status: "done", progress: 100, message: "Filter effect fully burned!" });
      } else {
        setActiveJob({ status: "failed", progress: 0, message: data.error || "Effect execution failed" });
      }
    } catch (err: any) {
      setActiveJob({ status: "failed", progress: 0, message: err.message || "Request failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Parameter Box */}
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="h-5 w-5 text-violet-400" />
            Caption & Effects Studio
          </h2>
          <p className="text-sm text-gray-400">
            Apply speeds, sub-clips, frame orientations, and subtitle styles.
          </p>
          {processingMode.checked && !processingMode.localProcessingEnabled && (
            <p className="mt-2 rounded-lg border border-yellow-500/20 bg-yellow-950/20 px-3 py-2 text-xs text-yellow-200">
              Hosted mode queues effects jobs for the Studio worker. Local rendering runs only with FFmpeg and
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
            <label className="text-xs font-semibold text-gray-400 uppercase block mb-2">Uploaded Video</label>
            <select
              value={inputPath}
              onChange={(e) => setInputPath(e.target.value)}
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
            <label className="text-xs font-semibold text-gray-400 uppercase block mb-2">Input Video Path</label>
            <input
              type="text"
              value={inputPath}
              onChange={(e) => setInputPath(e.target.value)}
              placeholder="e.g. public/studio/uploads/clip.mp4"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 placeholder-gray-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase block mb-2">Select Effect Filter</label>
            <div className="grid grid-cols-3 gap-2">
              {["speed", "trim", "reframe"].map((eff) => (
                <button
                  key={eff}
                  onClick={() => setSelectedEffect(eff)}
                  className={`py-1.5 rounded-lg border text-xs font-semibold uppercase transition ${
                    selectedEffect === eff
                      ? "bg-violet-600/20 border-violet-500 text-white"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {eff}
                </button>
              ))}
            </div>
          </div>

          {/* Config fields depending on filter */}
          {selectedEffect === "speed" && (
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase block mb-2">
                Speed Multiplier ({speedMultiplier}x)
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.25"
                value={speedMultiplier}
                onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>0.5x (Slow)</span>
                <span>1.0x (Normal)</span>
                <span>2.0x (Fast)</span>
              </div>
            </div>
          )}

          {selectedEffect === "trim" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase block mb-1">Start Time (sec)</label>
                <input
                  type="number"
                  value={trimStart}
                  onChange={(e) => setTrimStart(parseInt(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase block mb-1">End Time (sec)</label>
                <input
                  type="number"
                  value={trimEnd}
                  onChange={(e) => setTrimEnd(parseInt(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {selectedEffect === "reframe" && (
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase block mb-2">Reframe Format Mode</label>
              <select
                value={reframeMode}
                onChange={(e) => setReframeMode(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              >
                <option value="blur-fill">9:16 Vertical (Blur Fill)</option>
                <option value="center-crop">9:16 Vertical (Center Crop)</option>
                <option value="letterbox">9:16 Vertical (Black Bars)</option>
              </select>
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-sm font-bold text-white transition"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Queue Effect Job
          </button>
        </div>

        {activeJob && (
          <JobStatusCard
            title={selectedEffect.toUpperCase()}
            service="Effects Processor"
            status={activeJob.status}
            progress={activeJob.progress}
            message={activeJob.message}
            jobId={activeJob.jobId}
          />
        )}
      </div>

      {/* Preview Output screen */}
      <div className="lg:col-span-2 space-y-6">
        {result ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-violet-300 flex items-center gap-1 border-b border-white/5 pb-2">
              <Video className="h-4 w-4" />
              Burned Output Details
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Process completed. Rendered output is saved.</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-gray-400 select-all">
                {result.outputPath}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex gap-4">
              <button
                onClick={() => alert(`Enqueued ${result.outputPath} for scheduler review.`)}
                className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition flex items-center justify-center gap-1"
              >
                Publish output
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-12 text-center text-gray-500">
            <Video className="h-8 w-8 mb-2" />
            <p className="text-sm">Processed and compiled filter clips will render here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
