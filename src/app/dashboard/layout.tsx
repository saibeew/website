"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import AIAssistantWidget from "@/components/dashboard/AIAssistantWidget";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { Menu, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomCursor from "@/components/ui/CustomCursor";
import NotificationDropdown from "@/components/dashboard/NotificationDropdown";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { toggleSidebar, isSidebarCollapsed } = useStore();

  return (
    <div className="min-h-screen bg-background flex">
      <CustomCursor />
      <Sidebar />
      
      <main 
        className={cn(
            "flex-1 min-h-screen flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isSidebarCollapsed ? "md:ml-[80px]" : "md:ml-[260px]"
        )}
      >
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 bg-surface/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
             <button onClick={toggleSidebar} className="md:hidden text-text-muted hover:text-white">
                <Menu size={24} />
             </button>
             <h1 className="text-lg font-bold text-white hidden md:block">Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
             <NotificationDropdown />
             <Link href="/dashboard/profile">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-black border border-white/20 hover:scale-105 transition-transform cursor-pointer shadow-[0_0_15px_rgba(0,242,254,0.3)]">
                    JD
                </div>
             </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
           {children}
        </div>
      </main>
      
      {/* Global AI Assistant */}
      <AIAssistantWidget />
    </div>
  );
}
