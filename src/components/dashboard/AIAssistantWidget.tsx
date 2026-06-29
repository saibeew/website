"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./AIAssistantWidget.module.css";
import GlassCard from "../ui/GlassCard";
import { Sparkles, X, Send } from "lucide-react";

import { useStore } from "@/store/useStore";

export default function AIAssistantWidget() {
  const { activeSymbol } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: "ai", text: "Systems online. Monitoring market volatility. How can I assist you?" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsLoading(true);

    // Context Injection
    const contextMsg = `[Context: User is currently viewing the ${activeSymbol} chart. If asked for analysis, focus on ${activeSymbol}.] \n\n ${userMsg}`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: contextMsg })
      });

      const data = await res.json();
      
      if (data.error) {
         setMessages(prev => [...prev, { role: "ai", text: `Error: ${data.error}` }]);
      } else {
         setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", text: "Connection failed. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={styles.chatWindow}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <GlassCard className={styles.card} glowColor="accent">
              <div className={styles.header}>
                <div className={styles.titleGroup}>
                  <Sparkles size={16} className={styles.icon} />
                  <span>AI Copilot</span>
                </div>
                <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                  <X size={16} />
                </button>
              </div>
              
              <div className={styles.messages}>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`${styles.message} ${msg.role === "ai" ? styles.ai : styles.user}`}>
                    {msg.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className={styles.inputArea}>
                <input 
                  type="text" 
                  placeholder="Ask about market trends..." 
                  className={styles.input}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button className={styles.sendBtn} onClick={handleSendMessage}><Send size={16} /></button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        className={styles.orb}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        animate={{ 
          boxShadow: [
            "0 0 20px rgba(0, 246, 255, 0.5)", 
            "0 0 40px rgba(0, 246, 255, 0.8)", 
            "0 0 20px rgba(0, 246, 255, 0.5)"
          ] 
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Sparkles size={24} />
      </motion.button>
    </div>
  );
}
