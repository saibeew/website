"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock, RefreshCw } from "lucide-react";

type StudioJob = {
  id: string;
  service: string;
  status: "queued" | "processing" | "done" | "failed";
  progress: number;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_ICON = {
  queued: Clock,
  processing: RefreshCw,
  done: CheckCircle2,
  failed: AlertTriangle,
};

const STATUS_CLASS = {
  queued: "text-yellow-300 border-yellow-500/20 bg-yellow-950/20",
  processing: "text-violet-300 border-violet-500/20 bg-violet-950/20",
  done: "text-emerald-300 border-emerald-500/20 bg-emerald-950/20",
  failed: "text-red-300 border-red-500/20 bg-red-950/20",
};

function outputSummary(job: StudioJob) {
  if (!job.output) return "No output yet";
  if (Array.isArray(job.output.clips)) return `${job.output.clips.length} clips generated`;
  if (typeof job.output.outputPath === "string") return job.output.outputPath;
  return JSON.stringify(job.output);
}

export default function JobsPanel() {
  const [jobs, setJobs] = useState<StudioJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/studio/jobs?limit=40", { cache: "no-store" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to load Studio jobs");
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Studio jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = window.setInterval(fetchJobs, 8000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-violet-400" />
            Studio Worker Jobs
          </h2>
          <p className="text-sm text-gray-400">Track queued video processing jobs, outputs, and worker errors.</p>
        </div>
        <button
          onClick={fetchJobs}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-950/20 p-3 text-sm text-red-200">{error}</div>
      )}

      {jobs.length === 0 && !loading ? (
        <div className="rounded-xl border border-dashed border-white/10 py-16 text-center text-sm text-gray-400">
          No Studio jobs yet. Queue a clipper or effects job to start the local worker flow.
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const Icon = STATUS_ICON[job.status];
            return (
              <div key={job.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${job.status === "processing" ? "animate-spin" : ""}`} />
                      <p className="text-sm font-semibold text-white">{job.service.toUpperCase()}</p>
                      <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_CLASS[job.status]}`}>
                        {job.status}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-gray-500">{job.id}</p>
                  </div>
                  <p className="text-xs text-gray-500">{new Date(job.updated_at).toLocaleString()}</p>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${job.progress}%` }} />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-white/5 bg-black/20 p-3">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">Input</p>
                    <pre className="max-h-32 overflow-auto whitespace-pre-wrap text-xs text-gray-300">
                      {JSON.stringify(job.input, null, 2)}
                    </pre>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-black/20 p-3">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      {job.status === "failed" ? "Error" : "Output"}
                    </p>
                    <p className={`break-all text-xs ${job.status === "failed" ? "text-red-200" : "text-gray-300"}`}>
                      {job.status === "failed" ? job.error || "Worker failed" : outputSummary(job)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
