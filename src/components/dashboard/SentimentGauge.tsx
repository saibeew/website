"use client";

import { motion } from "framer-motion";

export default function SentimentGauge({ score, bias }: { score: number, bias: string }) {
  // score 0-100
  const rotation = (score / 100) * 180 - 90; // -90 to +90 deg

  return (
    <div className="flex flex-col items-center justify-center p-6 relative">
      <div className="relative w-48 h-24 overflow-hidden mb-2">
         {/* Gauge Background */}
         <div className="absolute top-0 left-0 w-full h-full bg-white/5 rounded-t-full border-t-[12px] border-r-[12px] border-l-[12px] border-white/10 box-border z-0"></div>
         
         {/* Gauge Zones */}
         <div className="absolute top-2 left-2 right-2 bottom-0 rounded-t-full overflow-hidden opacity-30">
             <div className="w-full h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
         </div>

         {/* Needle */}
         <motion.div 
            className="absolute bottom-0 left-1/2 w-1 h-24 bg-white origin-bottom rounded-full"
            initial={{ rotate: -90 }}
            animate={{ rotate: rotation }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
            style={{ marginLeft: '-2px', zIndex: 10 }}
         >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"></div>
         </motion.div>
      </div>

      <div className="text-center mt-2">
         <div className="text-xs text-text-muted uppercase tracking-widest mb-1">Market Bias</div>
         <div className={`text-2xl font-bold neon-text ${score > 60 ? 'text-green-400' : score < 40 ? 'text-red-400' : 'text-yellow-400'}`}>
            {bias}
         </div>
         <div className="text-xs text-white/50 mt-1 font-mono">{score}/100</div>
      </div>
    </div>
  );
}
