"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReportService, MarketReport } from "@/services/reportsService";
import { Loader2, Plus, X, RefreshCw } from "lucide-react";

export default function DailyBiasView() {
  const [reports, setReports] = useState<MarketReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
      title: "",
      summary: "",
      bias: "Neutral" as MarketReport["bias"],
      symbol: "EURUSD"
  });

  const fetchReports = async () => {
    setIsRefreshing(true);
    try {
      const data = await ReportService.getLatestReports();
      setReports(data);
    } catch (e) {
      console.error("Failed to load reports", e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true); // Show loading briefly
      try {
          await ReportService.createReport({
              ...formData,
              tags: []
          });
          setShowModal(false);
          setFormData({ title: "", summary: "", bias: "Neutral", symbol: "EURUSD" }); // Reset
          fetchReports(); // Refresh list
      } catch (err) {
          console.error(err);
          alert("Failed to create report. Make sure you are logged in (or policy allows anon inserts).");
      } finally {
          setLoading(false);
      }
  };

  if (loading && !showModal && reports.length === 0) {
    return (
        <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar relative">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-white mb-2">Daily Bias Reports</h2>
           <p className="text-text-muted">Actionable pre-market analysis and directional bias.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={fetchReports}
                disabled={isRefreshing}
                className="bg-surface border border-white/5 hover:bg-white/5 p-2 rounded-lg text-text-muted hover:text-white transition-colors"
                title="Refresh Reports"
            >
                <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            </button>
            <button 
                onClick={() => setShowModal(true)}
                className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
                <Plus size={16} /> New Report
            </button>
        </div>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
          {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#0B0F1A] border border-white/10 rounded-xl w-full max-w-md p-6 relative shadow-2xl"
                  >
                      <button 
                        onClick={() => setShowModal(false)}
                        className="absolute top-4 right-4 text-white/50 hover:text-white"
                      >
                          <X size={20} />
                      </button>
                      
                      <h3 className="text-xl font-bold text-white mb-6">Create Market Report</h3>
                      
                      <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                              <label className="block text-xs text-text-muted mb-1">Title</label>
                              <input 
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                placeholder="e.g. Gold Breaks Out"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                              />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs text-text-muted mb-1">Symbol</label>
                                  <input 
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                    placeholder="XAUUSD"
                                    value={formData.symbol}
                                    onChange={e => setFormData({...formData, symbol: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs text-text-muted mb-1">Bias</label>
                                  <select 
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary [&>option]:text-black"
                                    value={formData.bias}
                                    // @ts-expect-error - Type instantiation is excessively deep and possibly infinite
                                    onChange={e => setFormData({...formData, bias: e.target.value})}
                                  >
                                      <option value="Bullish">Bullish</option>
                                      <option value="Slightly Bullish">Slightly Bullish</option>
                                      <option value="Neutral">Neutral</option>
                                      <option value="Slightly Bearish">Slightly Bearish</option>
                                      <option value="Bearish">Bearish</option>
                                  </select>
                              </div>
                          </div>

                          <div>
                              <label className="block text-xs text-text-muted mb-1">Summary</label>
                              <textarea 
                                required
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary resize-none"
                                placeholder="Write the bias summary..."
                                value={formData.summary}
                                onChange={e => setFormData({...formData, summary: e.target.value})}
                              />
                          </div>
                          
                          <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg mt-2 transition-colors flex items-center justify-center gap-2"
                          >
                              {loading ? <Loader2 className="animate-spin" /> : "Publish Report"}
                          </button>
                      </form>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

      {reports.length === 0 ? (
          <div className="text-center py-20 text-white/40">
              No reports available yet. Click &quot;New Report&quot; to invoke the CMS.
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-surface/50 border border-white/5 hover:border-primary/50 rounded-xl p-5 cursor-pointer transition-all hover:bg-surface"
              >
                <div className="flex justify-between items-start mb-4">
                   <span className="text-xs font-mono text-text-muted">{new Date(report.created_at).toLocaleDateString()}</span>
                   <span className={`px-2 py-1 rounded text-xs font-bold border ${
                      report.bias.includes("Bullish") ? "bg-green-500/10 text-green-400 border-green-500/20" :
                      report.bias.includes("Bearish") ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                   }`}>
                      {report.bias}
                   </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {report.title}
                </h3>
                <p className="text-sm text-text-muted mb-4 line-clamp-3">
                    {report.summary}
                </p>
                <div className="flex items-center gap-2 mt-auto">
                    <span className="text-xs bg-white/5 px-2 py-1 rounded text-white/60">{report.symbol}</span>
                </div>
              </motion.div>
            ))}
          </div>
      )}
    </div>
  );
}
