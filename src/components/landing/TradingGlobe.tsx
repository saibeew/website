"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function TradingGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 180;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // --- Globe ---
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Earth Sphere (Low-poly/Wireframe layer for fintech look)
    const geometry = new THREE.SphereGeometry(60, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: 0x111b2e, // Deep Navy instead of Pitch Black
      transparent: true,
      opacity: 0.4,    // More transparent/Holographic
      shininess: 25,
    });
    const globe = new THREE.Mesh(geometry, material);
    globeGroup.add(globe);

    // Grid/Segments (Wireframe)
    const wireFrame = new THREE.Mesh(
      new THREE.SphereGeometry(61, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x0EF2B1, wireframe: true, transparent: true, opacity: 0.05 })
    );
    globeGroup.add(wireFrame);

    // --- Orbital Rings (Gyroscope) ---
    const ringsGroup = new THREE.Group();
    globeGroup.add(ringsGroup);

    const createRing = (radius: number, color: number, opacity: number, speed: number, rotation: {x: number, y: number, z: number}) => {
        const ringGeo = new THREE.RingGeometry(radius, radius + 0.4, 64);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: color, 
            transparent: true, 
            opacity: opacity, 
            side: THREE.DoubleSide 
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        
        // Initial Tilt
        ring.rotation.set(rotation.x, rotation.y, rotation.z);
        
        // Wrapper for animation
        const wrapper = new THREE.Group();
        wrapper.add(ring);
        ringsGroup.add(wrapper);
        
        return { mesh: wrapper, speed: speed, axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize() };
    };

    // Create 3 Orbital Rings
    const orbits = [
        createRing(75, 0x0EF2B1, 0.2, 0.002, { x: 1.57, y: 0, z: 0 }), // Horizontal-ish
        createRing(90, 0x5B8CFF, 0.15, -0.003, { x: 0.5, y: 0.5, z: 0 }), // Tilted
        createRing(105, 0x0EF2B1, 0.1, 0.001, { x: 0, y: 0.2, z: 1.57 }) // Vertical-ish
    ];

    // --- Shockwave (Splash Effect) ---
    const shockwaveGeo = new THREE.RingGeometry(62, 66, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({ 
        color: 0x00f2fe, 
        transparent: true, 
        opacity: 0,
        side: THREE.DoubleSide
    });
    const shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwave.rotation.x = Math.PI / 2; // Flat relative to globe
    globeGroup.add(shockwave);

    // --- Particle Explosion System ---
    const explosionCount = 60; // Reduced from 200 per user request
    const explosionGeo = new THREE.BufferGeometry();
    const explosionPositions = new Float32Array(explosionCount * 3);
    const explosionVelocities: { x: number, y: number, z: number }[] = [];
    
    for(let i=0; i<explosionCount; i++) {
        explosionPositions[i*3] = 0;
        explosionPositions[i*3+1] = 0;
        explosionPositions[i*3+2] = 0;
        explosionVelocities.push({
            x: (Math.random() - 0.5) * 2, // Random direction
            y: (Math.random() - 0.5) * 2,
            z: (Math.random() - 0.5) * 2
        });
    }
    explosionGeo.setAttribute('position', new THREE.BufferAttribute(explosionPositions, 3));
    const explosionMat = new THREE.PointsMaterial({
        color: 0x00f2fe,
        size: 0.8,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    const explosionParticles = new THREE.Points(explosionGeo, explosionMat);
    globeGroup.add(explosionParticles);


    // --- Arcs & Nodes (Market Flow) ---
    const nodesGroup = new THREE.Group();
    globeGroup.add(nodesGroup);

    const comets: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; speed: number; t: number }[] = [];

    const createArc = (startLat: number, startLon: number, endLat: number, endLon: number) => {
        const start = latLonToVector3(startLat, startLon, 60);
        const end = latLonToVector3(endLat, endLon, 60);
        
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.7);
        const moveDist = start.distanceTo(end) * 0.5;
        mid.normalize().multiplyScalar(60 + moveDist);

        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(50);
        const curveGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const curveMaterial = new THREE.LineBasicMaterial({
            color: 0x0EF2B1,
            transparent: true,
            opacity: 0.3
        });
        
        const line = new THREE.Line(curveGeometry, curveMaterial);
        
        // Add Node at endpoints
        const nodeGeo = new THREE.SphereGeometry(0.8, 8, 8);
        const nodeMat = new THREE.MeshBasicMaterial({ color: 0x5B8CFF });
        const startNode = new THREE.Mesh(nodeGeo, nodeMat);
        startNode.position.copy(start);
        const endNode = new THREE.Mesh(nodeGeo, nodeMat);
        endNode.position.copy(end);
        
        // Add Flowing "Comet" signal
        const cometGeo = new THREE.SphereGeometry(1.2, 8, 8);
        const cometMat = new THREE.MeshBasicMaterial({ color: 0x0EF2B1 });
        const comet = new THREE.Mesh(cometGeo, cometMat);
        comets.push({
            mesh: comet,
            curve: curve,
            speed: 0.005 + Math.random() * 0.01,
            t: Math.random()
        });

        nodesGroup.add(line, startNode, endNode, comet);
    };

    function latLonToVector3(lat: number, lon: number, radius: number) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);
        return new THREE.Vector3(x, y, z);
    }

    // Generate random market arcs
    for(let i=0; i<20; i++) {
        createArc(
            Math.random() * 160 - 80, 
            Math.random() * 340 - 170,
            Math.random() * 160 - 80, 
            Math.random() * 340 - 170
        );
    }

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.4);
    scene.add(ambientLight);

    const rimLight = new THREE.PointLight(0x0EF2B1, 1.5, 300);
    rimLight.position.set(100, 100, 100);
    scene.add(rimLight);

    const blueLight = new THREE.PointLight(0x5B8CFF, 1.2, 300);
    blueLight.position.set(-100, -50, 50);
    scene.add(blueLight);

    // --- Animation & Interactivity ---
    let frame = 0;
    let clickPulse = 0;
    let scrollScaleFactor = 1;
    let baseScale = 0.85; // Initial base scale

    const animate = () => {
      frame++;
      
      // Auto rotation
      globeGroup.rotation.y += 0.002;
      
      // Tilt based on mouse
      globeGroup.rotation.x += (mouse.current.y * 0.2 - globeGroup.rotation.x) * 0.05;
      globeGroup.rotation.z += (mouse.current.x * 0.1 - globeGroup.rotation.z) * 0.05;

      // Pulse and Glow effects
      if(clickPulse > 0) clickPulse -= 0.02; // Slowed down from 0.05
      rimLight.intensity = (1.4 + Math.sin(frame * 0.05) * 0.4) + (clickPulse * 5);
      
      // Update Comets
      comets.forEach(c => {
          c.t += c.speed;
          if(c.t > 1) c.t = 0;
          const pos = c.curve.getPoint(c.t);
          c.mesh.position.copy(pos);
          
          // Slight pulse to comets
          const pulse = 1 + Math.sin(frame * 0.1) * 0.2;
          c.mesh.scale.set(pulse, pulse, pulse);
      });

      // Update Orbits
      orbits.forEach(orbit => {
          orbit.mesh.rotateOnAxis(orbit.axis, orbit.speed);
      });

      // Shockwave Animation and Explosion
      if (clickPulse > 0) {
          // Ring Shockwave
          shockwave.scale.setScalar(1 + (1 - clickPulse) * 1.5); 
          shockwave.material.opacity = clickPulse * 0.8;
          shockwave.rotation.z += 0.05;

          // Particle Explosion
          // Reset particles if just clicked (pulse near 1.0)
          if (clickPulse > 0.98) {
              const posAttribute = explosionParticles.geometry.attributes.position;
              for(let i=0; i<explosionCount; i++) {
                  // Start at random surface points or center? 
                  // Let's start from center to explode outwards
                  posAttribute.setXYZ(i, (Math.random()-0.5)*10, (Math.random()-0.5)*10, (Math.random()-0.5)*10);
                  
                  // Set high velocity for "Screen Shatter" effect
                  explosionVelocities[i].x = (Math.random() - 0.5) * 8; 
                  explosionVelocities[i].y = (Math.random() - 0.5) * 8;
                  explosionVelocities[i].z = (Math.random() - 0.2) * 20; // Bias towards camera (+Z)
              }
              posAttribute.needsUpdate = true;
              explosionParticles.material.opacity = 1;
          }

          // Move Particles
          const posAttribute = explosionParticles.geometry.attributes.position;
          for(let i=0; i<explosionCount; i++) {
              let x = posAttribute.getX(i);
              let y = posAttribute.getY(i);
              let z = posAttribute.getZ(i);
              
              x += explosionVelocities[i].x;
              y += explosionVelocities[i].y;
              z += explosionVelocities[i].z;
              
              posAttribute.setXYZ(i, x, y, z);
          }
          posAttribute.needsUpdate = true;
          
          // Fade out explosion
          explosionParticles.material.opacity = clickPulse;

      } else {
          shockwave.scale.setScalar(0.1);
          shockwave.material.opacity = 0;
          explosionParticles.material.opacity = 0;
      }

      // Scroll based scaling
      const scrollY = window.scrollY;
      scrollScaleFactor = 1 - (scrollY * 0.001);
      const finalScale = baseScale * scrollScaleFactor;
      globeGroup.scale.set(finalScale, finalScale, finalScale);
      globeGroup.position.y = -scrollY * 0.1;
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();
    setLoading(false);

    const handleMouseMove = (e: MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if(!rect) return;
        mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleClick = () => {
        clickPulse = 1.0;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleClick);

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      
      // Responsive base scaling
      baseScale = w < 768 ? 0.55 : (w < 1024 ? 0.75 : (w < 1440 ? 0.95 : 1.15));
      
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    handleResize(); // Initial call
    window.addEventListener("resize", handleResize);

    const currentContainer = containerRef.current;

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("resize", handleResize);
      if (currentContainer) {
        currentContainer.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
