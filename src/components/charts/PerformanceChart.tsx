"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4780 },
  { name: 'May', value: 5890 },
  { name: 'Jun', value: 4390 },
  { name: 'Jul', value: 8490 },
  { name: 'Aug', value: 7490 },
  { name: 'Sep', value: 9490 },
  { name: 'Oct', value: 10490 },
  { name: 'Nov', value: 11490 },
  { name: 'Dec', value: 12450 },
];

export default function PerformanceChart() {
  return (
    <div className="w-full h-[300px] bg-card/30 rounded-xl p-4 border border-white/5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold">Portfolio Performance</h3>
        <div className="flex gap-2">
            {['1D', '1W', '1M', '1Y', 'ALL'].map((tf) => (
                <button key={tf} className={`text-xs px-2 py-1 rounded hover:bg-white/10 ${tf === '1Y' ? 'text-primary bg-primary/10' : 'text-text-muted'}`}>
                    {tf}
                </button>
            ))}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0EF2B1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0EF2B1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
             stroke="#9CA3AF" 
             fontSize={12} 
             tickLine={false} 
             axisLine={false} 
             tickFormatter={(value) => `$${value/1000}k`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1A1F2B', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
            itemStyle={{ color: '#0EF2B1' }}
            formatter={(value) => [`$${value}`, 'Portfolio Value']}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#0EF2B1" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
