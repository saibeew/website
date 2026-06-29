"use client";
import React from 'react';

export default function TradingLoader() {
  return (
    <div className="p-5 flex flex-col gap-6 w-full">
      {/* Ticker Bar */}
      <div className="flex gap-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-[120px] h-[25px] bg-[linear-gradient(110deg,#1b1f24_20%,#2a2f36_40%,#1b1f24_60%)] bg-[length:200%_100%] animate-shimmer rounded-lg" />
        ))}
      </div>

      {/* Chart & Orderbook */}
      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex-1 h-[280px] rounded-xl bg-[linear-gradient(110deg,#1b1f24_20%,#2a2f36_40%,#1b1f24_60%)] bg-[length:200%_100%] animate-shimmer" />
        
        <div className="w-full md:w-[200px] flex flex-col gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
             <div key={i} className="h-5 rounded-md bg-[linear-gradient(110deg,#1b1f24_20%,#2a2f36_40%,#1b1f24_60%)] bg-[length:200%_100%] animate-shimmer" />
          ))}
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="flex gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 flex-1 rounded-xl bg-[linear-gradient(110deg,#1b1f24_20%,#2a2f36_40%,#1b1f24_60%)] bg-[length:200%_100%] animate-shimmer" />
        ))}
      </div>
    </div>
  );
}
