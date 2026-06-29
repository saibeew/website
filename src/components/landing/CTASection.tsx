"use client";

import { motion } from "framer-motion";
import NeonButton from "../ui/NeonButton";
import Magnetic from "../ui/Magnetic";
import Link from "next/link";

export default function CTASection() {
  return (
    <section id="register" className="py-32 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] -z-10" />
      
      <motion.div 
         className="max-w-4xl mx-auto text-center"
         initial={{ opacity: 0, scale: 0.9 }}
         whileInView={{ opacity: 1, scale: 1 }}
         viewport={{ once: true }}
      >
         <h2 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tighter text-white">
            Ready to <span className="text-primary neon-text">Transcend</span>?
         </h2>
         <p className="text-xl text-text-muted mb-12 max-w-2xl mx-auto">
            Join 10,000+ traders who have already switched to the BEWE AI ecosystem. Stop guessing, start engineering wealth.
         </p>
         
         <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/register">
               <Magnetic>
                  <NeonButton size="lg" variant="primary" className="min-w-[200px] text-lg">
                     Get Early Access
                  </NeonButton>
               </Magnetic>
            </Link>
            <Link href="/dashboard">
               <Magnetic>
                  <NeonButton size="lg" variant="secondary" className="min-w-[200px] text-lg">
                     View Demo
                  </NeonButton>
               </Magnetic>
            </Link>
         </div>
      </motion.div>
    </section>
  );
}
