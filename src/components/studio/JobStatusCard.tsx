"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Loader2, XCircle, AlertCircle } from "lucide-react";

interface JobStatusCardProps {
  jobId?: string;
  title: string;
  service: string;
  status: "idle" | "queued" | "processing" | "done" | "failed";
  progress?: number;
  message?: string;
}

const STATUS_CONFIG = {
  idle: { icon: AlertCircle, color: "text-gray-400", bg: "bg-gray-800/40", label: "Idle" },
  queued: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-900/20", label: "Queued" },
  processing: { icon: Loader2, color: "text-violet-400", bg: "bg-violet-900/20", label: "Processing" },
  done: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-900/20", label: "Complete" },
  failed: { icon: XCircle, color: "text-red-400", bg: "bg-red-900/20", label: "Failed" },
};

export default function JobStatusCard({ jobId, title, service, status, progress = 0, message }: JobStatusCardProps) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border border-white/10 p-4 ${cfg.bg} backdrop-blur-sm`}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`mt-0.5 h-5 w-5 flex-shrink-0 ${cfg.color} ${status === "processing" ? "animate-spin" : ""}`}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{service} - {cfg.label}</p>
          {jobId && <p className="text-[11px] text-gray-500 mt-1 font-mono">Job {jobId.slice(0, 8)}</p>}
          {message && <p className="text-xs text-gray-300 mt-1">{message}</p>}

          {(status === "processing" || status === "queued") && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-violet-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
