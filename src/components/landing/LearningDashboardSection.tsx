"use client";

import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";
import { PlayCircle, Award, BookOpen } from "lucide-react";

export default function LearningDashboardSection() {
  return (
    <section className="py-24 px-6 relative bg-surface/30">
      <div className="max-w-7xl mx-auto">
         <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
         >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 neon-text">Master the Markets</h2>
            <p className="text-text-muted max-w-2xl mx-auto">
               Not just a platform, but an academy. Level up your trading skills with our interactive learning dashboard.
            </p>
         </motion.div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Course Card 1 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
               <GlassCard className="h-full flex flex-col p-6" glowColor="secondary">
                  <div className="relative h-40 rounded-xl bg-gradient-to-br from-secondary/20 to-purple-900/50 mb-6 flex items-center justify-center overflow-hidden group">
                     <PlayCircle size={48} className="text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-secondary font-bold mb-2">
                     <BookOpen size={12} />
                     <span>BEGINNER • 4 HOURS</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Algo Trading 101</h3>
                  <p className="text-text-muted text-sm mb-4 flex-1">Understanding market structure, order types, and basic automation logic.</p>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                     <div className="bg-secondary w-[45%] h-full" />
                  </div>
                  <div className="text-xs text-right mt-1 text-text-muted">45% Complete</div>
               </GlassCard>
            </motion.div>

            {/* Course Card 2 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
               <GlassCard className="h-full flex flex-col p-6" glowColor="primary">
                  <div className="relative h-40 rounded-xl bg-gradient-to-br from-primary/20 to-teal-900/50 mb-6 flex items-center justify-center overflow-hidden group">
                     <PlayCircle size={48} className="text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-primary font-bold mb-2">
                     <BookOpen size={12} />
                     <span>INTERMEDIATE • 6 HOURS</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Technical Analysis Mastery</h3>
                  <p className="text-text-muted text-sm mb-4 flex-1">Deep dive into indicators, chart patterns, and volume analysis for AI models.</p>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                     <div className="bg-primary w-[10%] h-full" />
                  </div>
                  <div className="text-xs text-right mt-1 text-text-muted">10% Complete</div>
               </GlassCard>
            </motion.div>

            {/* Course Card 3 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
               <GlassCard className="h-full flex flex-col p-6" glowColor="accent">
                  <div className="relative h-40 rounded-xl bg-gradient-to-br from-accent/20 to-green-900/50 mb-6 flex items-center justify-center overflow-hidden group">
                     <PlayCircle size={48} className="text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-accent font-bold mb-2">
                     <Award size={12} />
                     <span>ADVANCED • 8 HOURS</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Building Neural Networks</h3>
                  <p className="text-text-muted text-sm mb-4 flex-1">Create custom Python nodes and train reinforcement learning agents.</p>
                  <div className="flex items-center justify-center h-8 bg-white/5 rounded text-xs gap-2 text-text-muted">
                     <span>Locked</span>
                  </div>
               </GlassCard>
            </motion.div>
         </div>
      </div>
    </section>
  );
}
