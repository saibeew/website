"use client";

import { useState, useEffect } from "react";
import { Calendar, CheckCircle2, Clock, XCircle, RefreshCw, Eye } from "lucide-react";

interface Post {
  id: string;
  title: string;
  caption: string;
  media_url?: string;
  platform: string;
  status: "draft" | "approved" | "published" | "rejected" | "archived";
  scheduled_at?: string;
  published_at?: string;
  reviewer_id?: string;
  review_note?: string;
}

function isVisualMediaUrl(url?: string) {
  if (!url) return false;
  const decoded = decodeURIComponent(url);
  return url.startsWith("data:image/") || /\.(svg|jpg|jpeg|png|webp)(?:$|[?&])/i.test(decoded);
}

/**
 * Converts raw local beew-studio paths to browser-accessible /api/studio/media URLs.
 * Passes through URLs that are already relative API paths.
 */
function toMediaUrl(localPath?: string): string | undefined {
  if (!localPath) return undefined;
  if (localPath.startsWith("/api/")) return localPath; // already a proper URL
  const normalized = localPath.replace(/\\/g, "/");
  const marker = "beew-studio/";
  const idx = normalized.indexOf(marker);
  if (idx === -1) return localPath;
  const relativePath = normalized.substring(idx + marker.length);
  return `/api/studio/media?file=${encodeURIComponent(relativePath)}`;
}

export default function PublisherPanel() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePreview, setActivePreview] = useState<Post | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/studio/publisher");
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleReview = async (postId: string, status: "approved" | "rejected", note = "") => {
    try {
      const res = await fetch("/api/studio/publisher", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, status, reviewNote: note }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPosts();
        if (activePreview?.id === postId) {
          setActivePreview((prev) => prev ? { ...prev, status } : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerDispatch = async () => {
    try {
      const res = await fetch("/api/studio/publisher", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger_publish" }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Dispatched due posts. Published ${data.publishedCount} items.`);
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const statusIcons = {
    draft: <Clock className="h-4 w-4 text-yellow-400" />,
    approved: <CheckCircle2 className="h-4 w-4 text-sky-400" />,
    published: <CheckCircle2 className="h-4 w-4 text-emerald-400 animate-pulse" />,
    rejected: <XCircle className="h-4 w-4 text-red-400" />,
    archived: <Clock className="h-4 w-4 text-gray-500" />,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Calendar list */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-violet-400" />
              Content Schedule & Pipeline
            </h2>
            <p className="text-sm text-gray-400">
              Track publication timing, active streams, and review approvals.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleTriggerDispatch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition"
            >
              Trigger Dispatch
            </button>
            <button
              onClick={fetchPosts}
              disabled={loading}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="h-8 w-8 text-violet-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
            <Calendar className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No scheduled posts. Generate some content to start.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => setActivePreview(post)}
                className={`flex justify-between items-center p-4 rounded-xl border transition cursor-pointer ${
                  activePreview?.id === post.id
                    ? "bg-violet-950/20 border-violet-500/40"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {statusIcons[post.status]}
                  <div className="truncate">
                    <p className="text-sm font-semibold text-white truncate">{post.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {post.platform.toUpperCase()} -{" "}
                      {post.scheduled_at
                        ? new Date(post.scheduled_at).toLocaleDateString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Unscheduled"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">
                    {post.status}
                  </span>
                  <Eye className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspect / Detail Panel */}
      <div className="lg:col-span-1">
        {activePreview ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-6 sticky top-6">
            <div className="border-b border-white/5 pb-3">
              <span className="text-xs text-gray-400 uppercase">Interactive Preview</span>
              <h3 className="text-lg font-bold text-white mt-1">{activePreview.title}</h3>
            </div>

            {activePreview.media_url && (() => {
              const resolvedUrl = toMediaUrl(activePreview.media_url);
              return (
                <div className="aspect-[9/16] max-h-[300px] rounded-lg overflow-hidden border border-white/10 bg-gray-950">
                  {isVisualMediaUrl(activePreview.media_url) ? (
                    <iframe
                      src={resolvedUrl}
                      className="w-full h-full border-none pointer-events-none"
                      scrolling="no"
                    />
                  ) : (
                    <video src={resolvedUrl} controls className="w-full h-full object-cover" />
                  )}
                </div>
              );
            })()}

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Description / Caption</p>
              <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed bg-white/5 rounded-lg p-3 border border-white/5">
                {activePreview.caption}
              </p>
            </div>

            {activePreview.status === "draft" && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleReview(activePreview.id, "rejected")}
                  className="flex-1 py-2 rounded-lg bg-red-950/20 border border-red-500/30 text-xs font-bold text-red-400 hover:bg-red-900/20 transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleReview(activePreview.id, "approved")}
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition"
                >
                  Approve Schedule
                </button>
              </div>
            )}

            {activePreview.status === "approved" && (
              <div className="rounded-lg bg-sky-950/20 border border-sky-500/20 p-3 text-xs text-sky-300">
                Approved and scheduled for automatic queue release.
              </div>
            )}

            {activePreview.status === "published" && (
              <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/20 p-3 text-xs text-emerald-300">
                Published to Telegram successfully! Message link is locked in history.
              </div>
            )}
          </div>
        ) : (
          <div className="h-full border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-6 text-center text-gray-500">
            <Eye className="h-8 w-8 mb-2" />
            <p className="text-sm">Select an active post to inspect metadata metrics and approve publishes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
