"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import { Scissors, Sliders, TrendingUp, Cpu, Calendar, Video, Loader2, Activity, Images } from "lucide-react";

// Sub-panels
import ClipperPanel from "@/components/studio/ClipperPanel";
import EffectsPanel from "@/components/studio/EffectsPanel";
import TrendsPanel from "@/components/studio/TrendsPanel";
import QuantPanel from "@/components/studio/QuantPanel";
import PublisherPanel from "@/components/studio/PublisherPanel";
import JobsPanel from "@/components/studio/JobsPanel";
import MediaCarouselPanel from "@/components/studio/MediaCarouselPanel";

type ActiveTab = "clipper" | "effects" | "trends" | "quant" | "publisher" | "jobs" | "media";

export default function StudioPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("trends");
  const [prefilledTrendTitle, setPrefilledTrendTitle] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  // Check session on mount — redirect to /login if not authenticated
  useEffect(() => {
    fetch("/api/auth/session")
      .then(async (res) => {
        if (!res.ok) {
          router.replace("/login");
        } else {
          const data = await res.json().catch(() => ({ user: null }));
          if (!data.user) {
            router.replace("/login");
            return;
          }
          setAuthChecked(true);
        }
      })
      .catch(() => setAuthChecked(true)); // allow offline/degraded mode
  }, [router]);

  const handleUseTrend = (trend: any) => {
    setPrefilledTrendTitle(trend.title);
    setActiveTab("quant");
  };

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "trends", label: "Trend Radar", icon: TrendingUp },
    { id: "quant", label: "Quant Signal", icon: Cpu },
    { id: "media", label: "Media & Carousel", icon: Images },
    { id: "clipper", label: "Reel Clipper", icon: Scissors },
    { id: "effects", label: "Effects Studio", icon: Sliders },
    { id: "publisher", label: "Publisher", icon: Calendar },
    { id: "jobs", label: "Jobs", icon: Activity },
  ];

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-y-auto pr-2">
      {/* Title Header */}
      <div className="shrink-0 flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Video className="h-8 w-8 text-violet-500" />
            Beew Studio
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Internal social content platform. Generate, edit, schedule, and publish quant-trading media.
          </p>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="shrink-0 flex gap-2 border-b border-white/5 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-violet-600/20 border-violet-500 text-white shadow-lg shadow-violet-500/10"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Screen Area */}
      <div className="flex-1 min-h-0 pb-10">
        <GlassCard className="p-6 h-full overflow-y-auto" glowColor="primary">
          {activeTab === "trends" && <TrendsPanel onUseTrend={handleUseTrend} />}
          {activeTab === "quant" && <QuantPanel prefilledTrendTitle={prefilledTrendTitle} />}
          {activeTab === "media" && <MediaCarouselPanel />}
          {activeTab === "clipper" && <ClipperPanel />}
          {activeTab === "effects" && <EffectsPanel />}
          {activeTab === "publisher" && <PublisherPanel />}
          {activeTab === "jobs" && <JobsPanel />}
        </GlassCard>
      </div>
    </div>
  );
}
