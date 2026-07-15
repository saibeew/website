"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import styles from "./NetworkBackground.module.css";

function seededValue(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

const Nodes = () => {
    const count = 100;
    const meshRef = useRef<THREE.Points>(null);
    const linesRef = useRef<THREE.LineSegments>(null);

    // Initial random positions
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities: Array<{ x: number; y: number; z: number }> = [];
        
        for (let i = 0; i < count; i++) {
            const seed = i + 1;
            const rand = (offset: number) => seededValue(seed * 97.13 + offset);
            positions[i * 3] = (rand(1) - 0.5) * 25; // X
            positions[i * 3 + 1] = (rand(2) - 0.5) * 15; // Y
            positions[i * 3 + 2] = (rand(3) - 0.5) * 5;  // Z
            velocities.push({
                x: (rand(4) - 0.5) * 0.02,
                y: (rand(5) - 0.5) * 0.02,
                z: (rand(6) - 0.5) * 0.02
            });
        }
        return { positions, velocities };
    }, []);

    // Line indices buffer (dynamic)
    const lineGeometry = useMemo(() => new THREE.BufferGeometry(), []);
    
    useFrame((state) => {
        if (!meshRef.current || !linesRef.current) return;
        
        const { velocities } = particles;
        const positionsAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const linePositions: number[] = [];
        
        const mouse = new THREE.Vector3(
            (state.pointer.x * 25) / 2, // Rough conversion to world space
            (state.pointer.y * 15) / 2,
            0
        );

        for (let i = 0; i < count; i++) {
            // physics: Movement
            let px = positionsAttr.getX(i);
            let py = positionsAttr.getY(i);
            let pz = positionsAttr.getZ(i);

            px += velocities[i].x;
            py += velocities[i].y;
            pz += velocities[i].z;

            // physics: Mouse Magnetism
            const dx = px - mouse.x;
            const dy = py - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 4 && dist > 0) {
                 // Gentle push/pull
                 px -= dx * 0.02;
                 py -= dy * 0.02;
            }

            // Boundary wrap
            if (px > 15) px = -15; if (px < -15) px = 15;
            if (py > 10) py = -10; if (py < -10) py = 10;

            positionsAttr.setXYZ(i, px, py, pz);

            // Lines: Check neighbors
            for (let j = i + 1; j < count; j++) {
                const p2x = positionsAttr.getX(j);
                const p2y = positionsAttr.getY(j);
                const p2z = positionsAttr.getZ(j);
                const dist2 = Math.sqrt((px-p2x)**2 + (py-p2y)**2 + (pz-p2z)**2);

                if (dist2 < 3.5) {
                    linePositions.push(px, py, pz, p2x, p2y, p2z);
                }
            }
        }
        
        positionsAttr.needsUpdate = true;
        
        // Update lines
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        linesRef.current.geometry = lineGeometry;
    });

    return (
        <>
            <points ref={meshRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particles.positions.length / 3}
                        array={particles.positions}
                        itemSize={3}
                        args={[particles.positions, 3]}
                    />
                </bufferGeometry>
                <PointMaterial
                    transparent
                    color="#00E5FF"
                    size={0.15}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </points>
            <lineSegments ref={linesRef}>
                 <lineBasicMaterial color="#2563EB" transparent opacity={0.15} />
            </lineSegments>
        </>
    );
};

export default function NetworkBackground() {
    return (
        <div className={styles.container}>
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                <color attach="background" args={["#000510"]} />
                <ambientLight intensity={0.5} />
                <Nodes />
            </Canvas>
        </div>
    );
}
