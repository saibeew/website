"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { Calendar, Check, Image as ImageIcon, Loader2, Palette, RefreshCw, Upload, Video } from "lucide-react";

type MediaFile = {
  name: string;
  path: string;
  url: string;
  type: "image" | "video" | "audio" | "other" | string;
  size: number;
  updatedAt?: string;
};

type BrandTemplate = {
  id: string;
  label: string;
  assetPath: string;
  tone: string;
};

type GeneratedSlide = {
  index: number;
  path: string;
  url: string;
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

export default function MediaCarouselPanel() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [brandTemplates, setBrandTemplates] = useState<BrandTemplate[]>([]);
  const [templateId, setTemplateId] = useState("market");
  const [slideCount, setSlideCount] = useState(3);
  const [cta, setCta] = useState("Follow Beew for market intelligence.");
  const [generatedSlides, setGeneratedSlides] = useState<GeneratedSlide[]>([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Market edge in three frames");
  const [caption, setCaption] = useState("A concise Beew Studio carousel draft for social publishing.");
  const [message, setMessage] = useState("");

  const selectedFiles = useMemo(
    () => selectedPaths.map((selectedPath) => files.find((file) => file.path === selectedPath)).filter(Boolean) as MediaFile[],
    [files, selectedPaths]
  );

  const carouselSlides = useMemo(() => {
    if (generatedSlides.length > 0) return generatedSlides.map((slide) => slide.url);
    const slides = selectedFiles.filter(isImage);
    if (slides.length > 0) return slides.map((file) => file.url);
    const selectedTemplate = brandTemplates.find((template) => template.id === templateId) || brandTemplates[0];
    if (selectedTemplate) return [`/brand-assets/${selectedTemplate.assetPath}`];
    return [];
  }, [brandTemplates, generatedSlides, selectedFiles, templateId]);

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
    fetch("/api/studio/brand/carousel", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBrandTemplates(data.templates || []);
      })
      .catch(() => undefined);
  }, []);

  const generateBrandCarousel = async () => {
    setGenerating(true);
    setMessage("");
    try {
      const res = await fetch("/api/studio/brand/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          title,
          subtitle: caption,
          cta,
          slideCount,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Brand carousel generation failed");
      setGeneratedSlides(data.slides || []);
      setSelectedPaths([]);
      setMessage(`Generated ${data.slides.length} Beew-branded slide(s).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Brand carousel generation failed");
    } finally {
      setGenerating(false);
    }
  };

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
      let slides = carouselSlides;
      if (generatedSlides.length === 0 && selectedFiles.filter(isImage).length === 0) {
        const res = await fetch("/api/studio/brand/carousel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId, title, subtitle: caption, cta, slideCount }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Brand carousel generation failed");
        setGeneratedSlides(data.slides || []);
        slides = (data.slides || []).map((slide: GeneratedSlide) => slide.url);
      }

      const res = await fetch("/api/studio/publisher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          caption: `${caption}\n\n${cta}\n\nCarousel assets:\n${slides.join("\n")}`,
          mediaUrl: slides[0],
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
            <Palette className="h-5 w-5 text-violet-400" />
            Beew Brand Builder
          </h2>
          <p className="mt-1 text-sm text-gray-400">Generate carousels using the official Beew social templates and assets.</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <label className="text-xs font-semibold uppercase text-gray-400">Brand Template</label>
          <select
            value={templateId}
            onChange={(event) => setTemplateId(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
          >
            {brandTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            {brandTemplates.find((template) => template.id === templateId)?.tone || "Beew social template preset."}
          </p>
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
          <input
            value={cta}
            onChange={(event) => setCta(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
            placeholder="CTA"
          />
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-400">Slide Count</label>
            <input
              type="number"
              min={1}
              max={7}
              value={slideCount}
              onChange={(event) => setSlideCount(Math.max(1, Math.min(7, Number(event.target.value) || 3)))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
            />
          </div>
          <button
            onClick={generateBrandCarousel}
            disabled={generating}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet-500/40 bg-violet-950/30 px-4 py-2.5 text-sm font-bold text-violet-100 transition hover:bg-violet-900/40 disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Palette className="h-4 w-4" />}
            Generate Beew Slides
          </button>
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
            <p className="text-xs text-gray-500">Select images to override generated slides, or use uploaded video paths in Clipper/Effects.</p>
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
          <h3 className="mb-3 text-sm font-semibold text-violet-300">
            Carousel Preview {generatedSlides.length > 0 ? "(Beew template output)" : ""}
          </h3>
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
