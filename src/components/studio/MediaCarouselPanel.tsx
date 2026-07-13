"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { Calendar, Check, Image as ImageIcon, Loader2, RefreshCw, Upload, Video } from "lucide-react";

type MediaFile = {
  name: string;
  path: string;
  url: string;
  type: "image" | "video" | "audio" | "other" | string;
  size: number;
  updatedAt?: string;
};

function isImage(file: MediaFile) {
  return file.type === "image" || file.type.startsWith("image/");
}

function isVideo(file: MediaFile) {
  return file.type === "video" || file.type.startsWith("video/");
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildCarouselSvg(title: string, subtitle: string, index: number, total: number) {
  const safeTitle = title.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] || char);
  const safeSubtitle = subtitle.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] || char);
  const svg = `
<svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1350" fill="#060812"/>
  <rect x="64" y="64" width="952" height="1222" rx="28" fill="#0D1220" stroke="#2A3348" stroke-width="2"/>
  <text x="92" y="136" fill="#A78BFA" font-family="Inter, Arial" font-size="30" font-weight="800" letter-spacing="5">BEEW STUDIO</text>
  <text x="92" y="230" fill="#FFFFFF" font-family="Inter, Arial" font-size="78" font-weight="900">${safeTitle}</text>
  <foreignObject x="92" y="290" width="896" height="520">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Inter, Arial; color: #D1D5DB; font-size: 42px; line-height: 1.35; font-weight: 500;">
      ${safeSubtitle}
    </div>
  </foreignObject>
  <rect x="92" y="930" width="896" height="150" rx="22" fill="#111827" stroke="#374151"/>
  <text x="130" y="1008" fill="#E5E7EB" font-family="Inter, Arial" font-size="34" font-weight="700">Quant content draft</text>
  <text x="130" y="1055" fill="#9CA3AF" font-family="Inter, Arial" font-size="24">Review before publishing. Trading involves risk.</text>
  <text x="92" y="1210" fill="#6B7280" font-family="Inter, Arial" font-size="28">${index + 1}/${total}</text>
  <circle cx="952" cy="1198" r="28" fill="#7C3AED"/>
</svg>`.trim();
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export default function MediaCarouselPanel() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Market edge in three frames");
  const [caption, setCaption] = useState("A concise Beew Studio carousel draft for social publishing.");
  const [message, setMessage] = useState("");

  const selectedFiles = useMemo(
    () => selectedPaths.map((selectedPath) => files.find((file) => file.path === selectedPath)).filter(Boolean) as MediaFile[],
    [files, selectedPaths]
  );

  const carouselSlides = useMemo(() => {
    const slides = selectedFiles.filter(isImage);
    if (slides.length > 0) return slides.map((file) => file.url);
    return [0, 1, 2].map((idx) => buildCarouselSvg(title, caption, idx, 3));
  }, [caption, selectedFiles, title]);

  const fetchFiles = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/studio/media", { cache: "no-store" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to load media");
      setFiles(data.files || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (inputFiles: FileList | null) => {
    if (!inputFiles?.length) return;
    setUploading(true);
    setMessage("");
    try {
      const form = new FormData();
      Array.from(inputFiles).forEach((file) => form.append("files", file));
      const res = await fetch("/api/studio/media", { method: "POST", body: form });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Upload failed");
      await fetchFiles();
      setSelectedPaths((prev) => [...data.files.map((file: MediaFile) => file.path), ...prev]);
      setMessage(`Uploaded ${data.files.length} file(s).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const toggleSelected = (file: MediaFile) => {
    setSelectedPaths((prev) => (prev.includes(file.path) ? prev.filter((item) => item !== file.path) : [...prev, file.path]));
  };

  const scheduleCarousel = async () => {
    setMessage("");
    try {
      const res = await fetch("/api/studio/publisher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          caption: `${caption}\n\nCarousel assets:\n${carouselSlides.join("\n")}`,
          mediaUrl: carouselSlides[0],
          platform: "telegram",
          scheduledAt: new Date(Date.now() + 5 * 60000).toISOString(),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to create draft");
      setMessage("Carousel draft added to Publisher.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create carousel draft");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-1">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <Upload className="h-5 w-5 text-violet-400" />
            Media Upload
          </h2>
          <p className="mt-1 text-sm text-gray-400">Upload screen recordings, videos, and image assets for Studio jobs.</p>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-violet-500/30 bg-violet-950/10 px-4 py-10 text-center transition hover:bg-violet-950/20">
          {uploading ? <Loader2 className="mb-3 h-8 w-8 animate-spin text-violet-300" /> : <Upload className="mb-3 h-8 w-8 text-violet-300" />}
          <span className="text-sm font-semibold text-white">Choose files</span>
          <span className="mt-1 text-xs text-gray-500">MP4, MOV, PNG, JPG, WEBP</span>
          <input
            type="file"
            multiple
            accept="video/*,image/*"
            className="hidden"
            onChange={(event) => handleUpload(event.target.files)}
          />
        </label>

        <div className="space-y-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
            placeholder="Carousel title"
          />
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            rows={4}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
            placeholder="Caption / slide context"
          />
          <button
            onClick={scheduleCarousel}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500"
          >
            <Calendar className="h-4 w-4" />
            Save Carousel Draft
          </button>
        </div>

        {message && <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300">{message}</p>}
      </div>

      <div className="space-y-6 xl:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Media Library</h3>
            <p className="text-xs text-gray-500">Select images for carousel drafts. Use uploaded video paths in Clipper/Effects.</p>
          </div>
          <button
            onClick={fetchFiles}
            disabled={loading}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-400 transition hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {files.map((file) => (
            <button
              key={file.path}
              onClick={() => toggleSelected(file)}
              className={`overflow-hidden rounded-xl border text-left transition ${
                selectedPaths.includes(file.path) ? "border-violet-500 bg-violet-950/20" : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="aspect-video bg-black/30">
                {isImage(file) ? (
                  <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                ) : isVideo(file) ? (
                  <video src={file.url} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-600" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{file.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    {isVideo(file) ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                    {file.type} - {formatSize(file.size)}
                  </p>
                  <p className="mt-1 truncate font-mono text-[10px] text-gray-600">{file.path}</p>
                </div>
                {selectedPaths.includes(file.path) && <Check className="h-5 w-5 shrink-0 text-violet-300" />}
              </div>
            </button>
          ))}
        </div>

        {files.length === 0 && !loading && (
          <div className="rounded-xl border border-dashed border-white/10 py-16 text-center text-sm text-gray-400">
            Upload media to begin.
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-violet-300">Carousel Preview</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {carouselSlides.map((slide, index) => (
              <div key={`${slide}-${index}`} className="aspect-[4/5] overflow-hidden rounded-lg border border-white/10 bg-gray-950">
                <img src={slide} alt={`Carousel slide ${index + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
