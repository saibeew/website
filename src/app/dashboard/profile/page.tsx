"use client";

import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";
import { User, Shield, Bell, Palette, LogOut, Camera } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import AccountSecurityPanel from "@/components/auth/AccountSecurityPanel";

export default function ProfilePage() {
    const { user, balance, activeStrategies, logout, updateProfile, addNotification } = useStore();
    const [activeTab, setActiveTab] = useState("general");
    
    // Form State
    const [profileData, setProfileData] = useState({
        firstName: user?.name?.split(' ')[0] || "",
        lastName: user?.name?.split(' ')[1] || "",
        email: user?.email || "",
        bio: "Experienced swing trader specializing in Forex and Commodities. Aiming for consistent 5% monthly growth."
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
        const success = await updateProfile({ name: fullName, email: profileData.email });
        
        if (success) {
            addNotification({
                title: "Profile Updated",
                message: "Your account settings have been successfully synchronized.",
                type: "success"
            });
        }
    };

    const tabs = [
        { id: "general", label: "General Information", icon: User },
        { id: "notifications", label: "Notification Preferences", icon: Bell },
        { id: "security", label: "Security & Login", icon: Shield },
        { id: "appearance", label: "App Appearance", icon: Palette },
    ];

    return (
        <div className="max-w-5xl mx-auto py-8">
            <h1 className="text-3xl font-black text-white mb-2">Account Settings</h1>
            <p className="text-[#94a3b8] mb-8">Manage your profile, security, and preferences.</p>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Sidebar - Navigation & Quick Stats */}
                <div className="col-span-12 md:col-span-4 space-y-6">
                    {/* User Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.05] backdrop-blur-[15px] border border-white/10 rounded-[24px] p-6 text-center relative overflow-hidden group"
                    >
                         <div className="absolute top-[-50%] right-[-50%] w-[200px] h-[200px] bg-[#667eea]/20 rounded-full blur-[80px] pointer-events-none transition-opacity group-hover:opacity-100" />
                        
                        <div className="relative inline-block mb-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] p-[2px]">
                                <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center text-2xl font-bold text-white relative overflow-hidden">
                                    {user?.name?.[0] || "U"}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera size={20} className="text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-[#0f172a]" />
                        </div>

                        <h2 className="text-xl font-bold text-white mb-1">{user?.name || "John Doe"}</h2>
                        <p className="text-sm text-[#94a3b8] mb-6">{user?.email || "trader@example.com"}</p>

                        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                            <div>
                                <div className="text-white font-bold text-lg">${balance.toLocaleString()}</div>
                                <div className="text-[10px] uppercase tracking-wider text-[#64748b] font-semibold">Balance</div>
                            </div>
                            <div>
                                <div className="text-[#818cf8] font-bold text-lg">{activeStrategies}</div>
                                <div className="text-[10px] uppercase tracking-wider text-[#64748b] font-semibold">Active Bots</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Navigation Tabs */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-[24px] p-4 space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                                    activeTab === tab.id 
                                        ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg" 
                                        : "text-[#94a3b8] hover:text-white hover:bg-white/5"
                                )}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={logout}
                        className="w-full py-3 flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all text-sm font-medium border border-transparent hover:border-red-500/20"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>

                {/* Right Content Area - Forms */}
                <div className="col-span-12 md:col-span-8">
                    <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/[0.05] backdrop-blur-[15px] border border-white/10 rounded-[24px] p-8 shadow-2xl"
                    >
                        {activeTab === "general" && (
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-white">Profile Information</h3>
                                    <button type="button" className="text-sm text-[#818cf8] hover:text-[#a5b4fc] font-medium">Edit Mode</button>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[13px] font-medium text-[#cbd5e1] ml-1">First Name</label>
                                        <input 
                                            type="text" 
                                            value={profileData.firstName}
                                            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                                            className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-[#818cf8] focus:bg-white/[0.1] transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[13px] font-medium text-[#cbd5e1] ml-1">Last Name</label>
                                        <input 
                                            type="text" 
                                            value={profileData.lastName}
                                            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                                            className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-[#818cf8] focus:bg-white/[0.1] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[13px] font-medium text-[#cbd5e1] ml-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                        className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-[#818cf8] focus:bg-white/[0.1] transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[13px] font-medium text-[#cbd5e1] ml-1">Bio / Trading Goals</label>
                                    <textarea 
                                        rows={4}
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                        className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder:text-slate-600 outline-none focus:border-[#818cf8] focus:bg-white/[0.1] transition-all resize-none"
                                    />
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button type="submit" className="px-8 py-3 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white font-semibold hover:shadow-[0_10px_20px_-10px_rgba(118,75,162,0.5)] hover:scale-[1.02] transition-all">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === "notifications" && (
                            <div className="space-y-8">
                                <h3 className="text-xl font-bold text-white mb-6">Notification Settings</h3>
                                
                                {[
                                    { title: "Market Alerts", desc: "Get notified when high volatility is detected." },
                                    { title: "Trade Executions", desc: "Receive updates when a strategy opens or closes a trade." },
                                    { title: "Daily Summary", desc: "A daily digest of your portfolio performance." },
                                    { title: "System Updates", desc: "Important updates regarding the beew.ai engine." }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                        <div>
                                            <h4 className="text-white font-medium mb-1">{item.title}</h4>
                                            <p className="text-sm text-[#94a3b8]">{item.desc}</p>
                                        </div>
                                        <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                            <input type="checkbox" name="toggle" id={`toggle-${i}`} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-[#818cf8]"/>
                                            <label htmlFor={`toggle-${i}`} className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-700 cursor-pointer checked:bg-[#818cf8]"></label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "security" && <AccountSecurityPanel />}

                        {activeTab === "appearance" && (
                            <div className="flex flex-col items-center justify-center py-20 text-[#64748b]">
                                <Shield size={64} className="mb-4 opacity-20" />
                                <h4 className="text-lg font-bold text-white mb-2">Security Hub</h4>
                                <p className="text-center max-w-sm">
                                    Appearance preferences will be available in a future update.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// Add simple CSS for toggle switch to globals or inline (optional, relying on basic styling for now)
