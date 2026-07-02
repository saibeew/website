"use client";

/* eslint-disable react-hooks/unsupported-syntax */

import React, { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const stars: Star[] = [];
    const starCount = 450;
    const layers = 4;

    class Star {
      x: number;
      y: number;
      originX: number;
      originY: number;
      size: number;
      vx: number;
      vy: number;
      opacity: number;
      baseOpacity: number;
      layer: number;
      color: string;
      twinkleSpeed: number;
      twinkleFactor: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.originX = this.x;
        this.originY = this.y;
        this.layer = Math.floor(Math.random() * layers);
        this.size = (this.layer + 1) * 0.7;
        this.vx = (Math.random() - 0.5) * 0.1;
        this.vy = (Math.random() - 0.5) * 0.1;
        this.baseOpacity = (this.layer + 1) * 0.18 + 0.15;
        this.opacity = this.baseOpacity;
        
        const colors = ["#FFFFFF", "#D1D5DB", "#FFFFFF", "#9CA3AF", "#FFFFFF"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.twinkleSpeed = 0.01 + Math.random() * 0.03;
        this.twinkleFactor = Math.random() * Math.PI * 2;
      }

      update(mouseX: number, mouseY: number) {
        const dxO = this.originX - this.x;
        const dyO = this.originY - this.y;
        this.vx += dxO * 0.005; 
        this.vy += dyO * 0.005;

        const dxC = mouseX - this.x;
        const dyC = mouseY - this.y;
        const distC = Math.sqrt(dxC * dxC + dyC * dyC);
        const radius = 180;

        if (distC < radius) {
          const force = (radius - distC) / radius;
          this.vx -= (dxC / distC) * force * 3.5; 
          this.vy -= (dyC / distC) * force * 3.5;
        }

        this.vx *= 0.93; 
        this.vy *= 0.93;
        this.x += this.vx;
        this.y += this.vy;

        // Twinkle logic
        this.twinkleFactor += this.twinkleSpeed;
        const twinkle = Math.sin(this.twinkleFactor) * 0.3;
        const displacement = Math.sqrt(dxO * dxO + dyO * dyO);
        const contrastFactor = Math.min(1, displacement / 60);
        this.opacity = (this.baseOpacity + twinkle) + (0.8 - this.baseOpacity) * contrastFactor;

        this.originX += Math.sin(Date.now() * 0.0008 + this.originY) * 0.04;
        this.originY += Math.cos(Date.now() * 0.0008 + this.originX) * 0.04;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0.1, this.opacity);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    class Meteor {
        x!: number;
        y!: number;
        size!: number;
        vx!: number;
        vy!: number;
        alpha!: number;
        length!: number;

        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = -100;
            // Calmer, slower diagonal movement
            this.vx = (Math.random() * 2) + 1; 
            this.vy = (Math.random() * 2) + 2;
            this.size = 1 + Math.random() * 2;
            this.alpha = 0.3 + Math.random() * 0.7;
            this.length = 120 + Math.random() * 100;
            
            if (Math.random() > 0.5) {
                this.x = width + 100;
                this.vx *= -1.2;
            }
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < -300 || this.x > width + 300 || this.y > height + 300) {
                this.reset();
            }
        }

        draw() {
            if (!ctx) return;
            ctx.save();
            
            const grad = ctx.createLinearGradient(
                this.x, this.y, 
                this.x - this.vx * (this.length / 5), 
                this.y - this.vy * (this.length / 5)
            );
            
            grad.addColorStop(0, `rgba(14, 242, 177, ${this.alpha})`);
            grad.addColorStop(0.5, `rgba(91, 140, 255, ${this.alpha * 0.5})`);
            grad.addColorStop(1, "rgba(255, 255, 255, 0)");

            ctx.beginPath();
            ctx.lineWidth = this.size;
            ctx.lineCap = "round";
            ctx.strokeStyle = grad;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.vx * (this.length / 5), this.y - this.vy * (this.length / 5));
            ctx.stroke();
            
            // Bright lead point
            ctx.fillStyle = "#FFFFFF";
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
            ctx.globalAlpha = 1;
        }
    }

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleClick = (e: MouseEvent) => {
        stars.forEach(s => {
            const dx = e.clientX - s.x;
            const dy = e.clientY - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 400) {
                const force = (400 - dist) / 400;
                s.vx -= (dx / dist) * force * 15; 
                s.vy -= (dy / dist) * force * 15;
            }
        });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleClick);

    const meteors: Meteor[] = [];
    const meteorCount = 3;
    for (let i = 0; i < starCount; i++) stars.push(new Star());
    for (let i = 0; i < meteorCount; i++) meteors.push(new Meteor());

    const animate = () => {
      // Clear with slightly lighter deep space grey
      ctx.fillStyle = "rgba(13, 15, 20, 1)";
      ctx.fillRect(0, 0, width, height);

      // Draw enhanced nebula glow
      const gradient = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, width * 0.9);
      gradient.addColorStop(0, "rgba(14, 242, 177, 0.08)");
      gradient.addColorStop(0.4, "rgba(91, 140, 255, 0.06)");
      gradient.addColorStop(1, "rgba(13, 15, 20, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      stars.forEach(s => {
        s.update(mouse.x, mouse.y);
        s.draw();
      });

      meteors.forEach(m => {
        m.update();
        m.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 bg-background" />;
}
