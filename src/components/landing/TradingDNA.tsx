"use client";

import React, { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  color: string;
}

export default function TradingDNA() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0, active: false });
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const width = canvas.width = canvas.parentElement?.clientWidth || 600;
    const height = canvas.height = canvas.parentElement?.clientHeight || 600;

    const nodes: Node[] = [];
    const strands = 2;
    const pointsPerStrand = 40;
    const helixRadius = 80;
    const helixHeight = 500;
    const rotationSpeed = 0.01;
    let angle = 0;

    // Initialize DNA nodes
    for (let s = 0; s < strands; s++) {
      const strandOffset = s * Math.PI;
      const strandColor = s === 0 ? "#0EF2B1" : "#5B8CFF";
      
      for (let i = 0; i < pointsPerStrand; i++) {
        const t = i / pointsPerStrand;
        const y = (t - 0.5) * helixHeight;
        const phase = t * Math.PI * 4 + strandOffset;
        const x = Math.cos(phase) * helixRadius;
        const z = Math.sin(phase) * helixRadius;

        nodes.push({
          x, y, z,
          baseX: x, baseY: y, baseZ: z,
          color: strandColor
        });
      }
    }

    const project = (node: Node) => {
      // Rotate around Y axis
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      
      const rx = node.x * cosA - node.z * sinA;
      const rz = node.x * sinA + node.z * cosA;
      
      // PERSPECTIVE projection
      const perspective = 600 / (600 + rz);
      const px = rx * perspective + width / 2;
      const py = node.y * perspective + height / 2;
      
      return { x: px, y: py, scale: perspective, z: rz };
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      angle += rotationSpeed;

      // Update node physics (Repulsion)
      nodes.forEach(node => {
        const p = project(node);
        
        if (mouse.current.active) {
            const dx = mouse.current.x - p.x;
            const dy = mouse.current.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const radius = 100;

            if (dist < radius) {
                const force = (radius - dist) / radius;
                const moveX = (dx / dist) * force * 20;
                const moveY = (dy / dist) * force * 20;
                
                // Temporary displacement
                node.x -= moveX * 0.1;
                node.y -= moveY * 0.1;
            }
        }

        // Return to base position (Smoothing)
        node.x += (node.baseX - node.x) * 0.05;
        node.y += (node.baseY - node.y) * 0.05;
        node.z += (node.baseZ - node.z) * 0.05;
      });

      // Draw Connection Lines (Base Pairs)
      for (let i = 0; i < pointsPerStrand; i++) {
          const n1 = nodes[i];
          const n2 = nodes[i + pointsPerStrand];
          const p1 = project(n1);
          const p2 = project(n2);

          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * p1.scale})`;
          ctx.lineWidth = 1 * p1.scale;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
      }

      // Draw Nodes
      nodes.forEach(node => {
        const p = project(node);
        const opacity = (p.z + 100) / 200; // Depth-based opacity
        
        ctx.beginPath();
        ctx.fillStyle = node.color;
        ctx.globalAlpha = Math.max(0.1, opacity);
        ctx.arc(p.x, p.y, 3 * p.scale, 0, Math.PI * 2);
        ctx.fill();
        
        if (opacity > 0.6) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = node.color;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouse.current.x = e.clientX - rect.left;
        mouse.current.y = e.clientY - rect.top;
        mouse.current.active = true;
    };

    const handleMouseLeave = () => {
        mouse.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="w-full h-full relative pointer-events-none">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full opacity-70"
        style={{ filter: "blur(0.5px)" }}
      />
    </div>
  );
}
