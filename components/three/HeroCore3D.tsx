import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { pointer, isMobile, prefersReducedMotion } from './inputState';

/**
 * "AI Core": a liquid-metal distorted orb wrapped in a wireframe shell,
 * with orbiting rings and electrons. Sits behind the hero photo card so
 * the rings and glow wrap around it.
 */

const OrbitRing: React.FC<{
  radius: number;
  tilt: [number, number, number];
  speed: number;
  color: string;
}> = ({ radius, tilt, speed, color }) => {
  const pivot = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (pivot.current) pivot.current.rotation.z += delta * speed;
  });

  return (
    <group rotation={tilt}>
      <mesh>
        <torusGeometry args={[radius, 0.012, 8, 160]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} />
      </mesh>
      <group ref={pivot}>
        {/* Electron */}
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
};

const Core: React.FC = () => {
  const root = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Mesh>(null);
  const shell2 = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (root.current) {
      // Ease toward the pointer for a responsive, weighty feel
      root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, pointer.x * 0.5, delta * 2);
      root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, pointer.y * 0.35, delta * 2);
      root.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.12;
    }
    if (shell.current) {
      shell.current.rotation.y += delta * 0.25;
      shell.current.rotation.x += delta * 0.1;
    }
    if (shell2.current) {
      shell2.current.rotation.y -= delta * 0.15;
      shell2.current.rotation.z += delta * 0.08;
    }
  });

  return (
    <group ref={root}>
      {/* Orb cluster peeks out from behind the card's lower-right corner */}
      <group position={[2.85, -2.6, -0.6]} scale={0.78}>
      {/* Liquid metal orb */}
      <mesh>
        <sphereGeometry args={[1.35, 96, 96]} />
        <MeshDistortMaterial
          color="#0e7490"
          emissive="#0891b2"
          emissiveIntensity={0.35}
          metalness={0.9}
          roughness={0.15}
          distort={0.42}
          speed={2.2}
        />
      </mesh>

      {/* Inner glow halo */}
      <mesh scale={1.75}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Geodesic wireframe shells */}
      <mesh ref={shell} scale={2.05}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.35} />
      </mesh>
      <mesh ref={shell2} scale={2.5}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.22} />
      </mesh>

      </group>

      {/* Small companion orb, upper-left */}
      <mesh position={[-2.6, 2.4, -1]}>
        <sphereGeometry args={[0.38, 48, 48]} />
        <MeshDistortMaterial color="#6d28d9" emissive="#8b5cf6" emissiveIntensity={0.5} metalness={0.8} roughness={0.2} distort={0.35} speed={3} />
      </mesh>

      <OrbitRing radius={3.0} tilt={[Math.PI / 2.4, 0, 0]} speed={0.9} color="#22d3ee" />
      <OrbitRing radius={3.4} tilt={[Math.PI / 3, Math.PI / 4, 0]} speed={-0.6} color="#8b5cf6" />
      <OrbitRing radius={3.8} tilt={[Math.PI / 1.8, -Math.PI / 5, 0.3]} speed={0.45} color="#3b82f6" />
    </group>
  );
};

const HeroCore3D: React.FC = () => {
  const mobile = isMobile();
  const reduced = prefersReducedMotion();

  return (
    <Canvas
      dpr={mobile ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 0, 9.5], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={reduced ? 'demand' : 'always'}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 5, 6]} intensity={2.2} color="#e0f2fe" />
      <pointLight position={[-5, -3, 3]} intensity={40} color="#8b5cf6" />
      <pointLight position={[5, 2, -2]} intensity={40} color="#22d3ee" />
      <Core />
      <Sparkles count={mobile ? 40 : 90} scale={[9, 9, 4]} size={2.4} speed={0.4} color="#67e8f9" opacity={0.8} />
    </Canvas>
  );
};

export default HeroCore3D;
