"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import styles from "./NetworkBackground.module.css";

const Nodes = () => {
    const count = 100;
    const meshRef = useRef<THREE.Points>(null);
    const linesRef = useRef<THREE.LineSegments>(null);

    // Initial random positions
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = [];
        
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 25; // X
            positions[i * 3 + 1] = (Math.random() - 0.5) * 15; // Y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 5;  // Z
            velocities.push({
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            });
        }
        return { positions, velocities };
    }, []);

    // Line indices buffer (dynamic)
    const lineGeometry = useMemo(() => new THREE.BufferGeometry(), []);
    
    useFrame((state) => {
        if (!meshRef.current || !linesRef.current) return;
        
        const { positions, velocities } = particles;
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

            if (dist < 4) {
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
