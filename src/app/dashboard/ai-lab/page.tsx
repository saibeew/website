"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import { Send, Cpu, Terminal, Activity } from "lucide-react";
import styles from "./page.module.css";
import { slideUp, cyberGlitch } from "@/lib/animations";

interface Message {
  role: "user" | "ai";
  text: string;
  timestamp: string;
}

export default function AILabPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Welcome to the AI Research Lab. I am initialized and ready. Try commands like '/status', '/predict BTC', or 'analyze market'.", timestamp: new Date().toLocaleTimeString() }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", text: input, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Use real AI
    const getAiResponse = async (query: string) => {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({ message: query })
        });
        const data = await res.json();
        setMessages(prev => [...prev, { 
          role: "ai", 
          text: data.reply || "Connection to neural node lost.", 
          timestamp: new Date().toLocaleTimeString() 
        }]);
      } catch {
        setMessages(prev => [...prev, { 
          role: "ai", 
          text: "System Error: Failed to reach AI node.", 
          timestamp: new Date().toLocaleTimeString() 
        }]);
      }
    };

    getAiResponse(userMsg.text);
  };

  return (
    <motion.div 
      className={styles.container}
      variants={cyberGlitch}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.grid}>
        {/* Chat Interface */}
        <motion.div variants={slideUp} className={styles.chatSection}>
          <GlassCard className={styles.chatCard}>
            <div className={styles.header}>
              <Cpu size={20} className={styles.icon} />
              <h2 className={styles.title}>Neural Interface v2.0</h2>
            </div>

            <div className={styles.messagesWindow}>
              {messages.map((msg, i) => (
                <div key={i} className={`${styles.messageRow} ${msg.role === "ai" ? styles.aiRow : styles.userRow}`}>
                  <div className={styles.messageBubble}>
                    <div className={styles.msgText}>{msg.text}</div>
                    <div className={styles.msgTime}>{msg.timestamp}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
              <div className={styles.inputWrapper}>
                <Terminal size={18} className={styles.inputIcon} />
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Enter command or query..."
                />
              </div>
              <NeonButton onClick={handleSend} className={styles.sendBtn}>
                <Send size={18} />
              </NeonButton>
            </div>
          </GlassCard>
        </motion.div>

        {/* System Status / Viz */}
        <motion.div variants={slideUp} className={styles.statusSection}>
           <GlassCard className={styles.statusCard}>
             <h3 className={styles.statusTitle}>System Metrics</h3>
             <div className={styles.metric}>
               <span>Neural Load</span>
               <div className={styles.progressBar}><div style={{ width: "45%" }} className={styles.progressFill} /></div>
             </div>
             <div className={styles.metric}>
               <span>Memory Usage</span>
               <div className={styles.progressBar}><div style={{ width: "60%" }} className={styles.progressFill} /></div>
             </div>
             
             <div className={styles.visualizer}>
               <Activity size={48} className={styles.pulseIcon} />
               <p>Deep Learning Model Active</p>
             </div>
           </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
