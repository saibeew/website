"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Globe, Activity } from "lucide-react";

const badges = [
    { icon: ShieldCheck, text: "AES-256 Encryption", color: "text-green-400" },
    { icon: Globe, text: "Global Broker API", color: "text-blue-400" },
    { icon: Activity, text: "99.99% Uptime", color: "text-amber-400" }
];

export default function TrustBadges() {
    return (
        <div className="flex gap-4 mt-8 justify-center flex-wrap">
            {badges.map((badge, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.05, borderColor: "rgba(0, 229, 255, 0.5)" }}
                    className="
                        flex items-center gap-2 px-3 py-1.5 
                        rounded-full border border-white/5 bg-black/30 backdrop-blur-sm
                        text-xs font-medium text-slate-300
                        shadow-[0_0_15px_rgba(0,0,0,0.5)]
                        cursor-default select-none
                    "
                >
                    <badge.icon size={14} className={badge.color} />
                    <span>{badge.text}</span>
                </motion.div>
            ))}
        </div>
    );
}
