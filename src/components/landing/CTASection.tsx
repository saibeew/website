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
            Test it before <span className="text-primary neon-text">you commit</span>.
         </h2>
         <p className="text-xl text-text-muted mb-12 max-w-2xl mx-auto">
            Limited founding seats. Serious traders only. Test it yourself before you commit.
         </p>
         
         <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="#apply">
               <Magnetic>
                  <NeonButton size="lg" variant="primary" className="min-w-[200px] text-lg">
                     Apply for Founding Access
                  </NeonButton>
               </Magnetic>
            </Link>
            <Link href="https://t.me/">
               <Magnetic>
                  <NeonButton size="lg" variant="secondary" className="min-w-[200px] text-lg">
                     Join the Telegram War Room
                  </NeonButton>
               </Magnetic>
            </Link>
         </div>
      </motion.div>
    </section>
  );
}
