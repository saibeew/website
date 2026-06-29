"use client";

import { useEffect } from "react";
import { useStore, ExchangeConnection } from "@/store/useStore";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { Link2, Trash2, CheckCircle, AlertCircle } from "lucide-react";

export default function ConnectionsPage() {
  const { exchangeConnections, fetchConnections, deleteConnection, addNotification } = useStore();

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to disconnect ${name}?`)) {
        const success = await deleteConnection(id);
        if (success) {
            addNotification({
                title: "Exchange Disconnected",
                message: `${name} API keys have been removed.`,
                type: "warning"
            });
        }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold text-white mb-1">Exchange Connections</h2>
            <p className="text-text-muted text-sm">Manage API keys and latency.</p>
         </div>
         <NeonButton variant="primary" onClick={() => addNotification({ title: "Module Coming Soon", message: "API documentation for custom integrations is under review.", type: "info" })}>Connect New</NeonButton>
      </div>

      <div className="grid grid-cols-1 gap-6">
         <div className="space-y-4">
            {exchangeConnections.map((conn: ExchangeConnection, i: number) => (
               <GlassCard key={i} className="flex items-center justify-between p-6" hoverEffect={false}>
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${conn.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {conn.status === 'Active' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                     </div>
                     <div>
                        <h3 className="font-bold text-white">{conn.exchange}</h3>
                        <div className="text-xs text-text-muted flex items-center gap-2">
                           {conn.keys} 
                           {conn.status === 'Active' && <span className="text-green-500">• {conn.latency}</span>}
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex gap-3">
                     <button className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-colors">
                        <Link2 size={18} />
                     </button>
                      <button 
                        onClick={() => handleDelete(conn.id, conn.exchange)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-text-muted hover:text-red-500 transition-colors"
                      >
                         <Trash2 size={18} />
                      </button>
                  </div>
               </GlassCard>
            ))}
         </div>
      </div>
    </div>
  );
}
