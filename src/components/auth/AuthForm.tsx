"use client";

import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";
import NeonButton from "../ui/NeonButton";
import styles from "./AuthForm.module.css";
import { Lock, Mail, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { slideUp } from "@/lib/animations";

interface AuthFormProps {
  type: "login" | "register";
}

export default function AuthForm({ type }: AuthFormProps) {
  const isLogin = type === "login";

  return (
    <motion.div 
      className={styles.container}
      variants={slideUp}
      initial="hidden"
      animate="visible"
    >
      <GlassCard className={styles.authCard} glowColor={isLogin ? "primary" : "secondary"}>
        <div className={styles.header}>
          <h2 className={`${styles.title} neon-text`}>
            {isLogin ? "Welcome Back" : "Join the Future"}
          </h2>
          <p className={styles.subtitle}>
            {isLogin 
              ? "Access your beew.ai terminal" 
              : "Create your holographic trading identity"}
          </p>
        </div>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          {!isLogin && (
            <div className={styles.inputGroup}>
              <User className={styles.icon} size={20} />
              <input 
                type="text" 
                placeholder="Username" 
                className={styles.input} 
              />
            </div>
          )}
          
          <div className={styles.inputGroup}>
            <Mail className={styles.icon} size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              className={styles.input} 
            />
          </div>

          <div className={styles.inputGroup}>
            <Lock className={styles.icon} size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              className={styles.input} 
            />
          </div>

          <NeonButton 
            className={styles.submitBtn} 
            variant={isLogin ? "primary" : "secondary"} 
            size="lg"
            icon={<ArrowRight />}
          >
            {isLogin ? "Initiate Sequence" : "Deploy Account"}
          </NeonButton>
        </form>

        <div className={styles.footer}>
          <p>
            {isLogin ? "New user?" : "Already have access?"}{" "}
            <Link 
              href={isLogin ? "/register" : "/login"}
              className={`${styles.link} ${isLogin ? styles.linkPrimary : styles.linkSecondary}`}
            >
              {isLogin ? "Initialize Protocol" : "Login"}
            </Link>
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );
}
