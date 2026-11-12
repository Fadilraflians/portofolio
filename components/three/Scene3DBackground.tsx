import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { pointer, scroll, isMobile, prefersReducedMotion } from './inputState';

/**
 * Fullscreen fixed WebGL scene behind the whole page.
 * - Deep starfield of cyan/blue/purple particles
 * - Floating wireframe crystals distributed in depth
 * - Camera flies forward as the user scrolls, and parallaxes with the mouse
 */

const PALETTE = ['#22d3ee', '#3b82f6', '#8b5cf6', '#38bdf8', '#a78bfa'];

const StarField: React.FC<{ count: number }> = ({ count }) => {
  const ref = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = -Math.random() * 70 + 12;
      c.set(PALETTE[i % PALETTE.length]);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.z += delta * 0.01;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      {/* drei PointMaterial renders soft round points instead of squares */}
      <PointMaterial
        size={0.09}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

type ShapeKind = 'ico' | 'octa' | 'torus' | 'knot' | 'dodeca';

interface ShapeSpec {
  kind: ShapeKind;
  position: [number, number, number];
  scale: number;
  color: string;
  speed: number;
}

const SHAPES: ShapeSpec[] = [
  { kind: 'ico', position: [-11.5, 6, -7], scale: 1.4, color: '#22d3ee', speed: 1.1 },
  { kind: 'torus', position: [10.5, -3.5, -9], scale: 1.3, color: '#8b5cf6', speed: 0.9 },
  { kind: 'octa', position: [10, 4, -15], scale: 1.2, color: '#3b82f6', speed: 1.3 },
  { kind: 'knot', position: [-10.5, -3.5, -19], scale: 1.0, color: '#38bdf8', speed: 0.8 },
  { kind: 'dodeca', position: [10.5, 1, -25], scale: 1.5, color: '#a78bfa', speed: 1.0 },
  { kind: 'ico', position: [-10.5, 3, -31], scale: 1.7, color: '#3b82f6', speed: 1.2 },
  { kind: 'torus', position: [-10, -2, -39], scale: 1.4, color: '#22d3ee', speed: 0.9 },
  { kind: 'octa', position: [10.5, -1.5, -45], scale: 1.4, color: '#8b5cf6', speed: 1.1 },
  { kind: 'knot', position: [9.5, 3, -53], scale: 1.1, color: '#22d3ee', speed: 0.7 },
];

const Geometry: React.FC<{ kind: ShapeKind }> = ({ kind }) => {
  switch (kind) {
    case 'ico':
      return <icosahedronGeometry args={[1, 1]} />;
    case 'octa':
      return <octahedronGeometry args={[1, 0]} />;
    case 'torus':
      return <torusGeometry args={[0.9, 0.32, 14, 40]} />;
    case 'knot':
      return <torusKnotGeometry args={[0.8, 0.22, 90, 12]} />;
    case 'dodeca':
      return <dodecahedronGeometry args={[1, 0]} />;
  }
};

const Crystal: React.FC<ShapeSpec> = ({ kind, position, scale, color, speed }) => {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.x += delta * 0.15 * speed;
    group.current.rotation.y += delta * 0.22 * speed;
  });

  return (
    <Float speed={speed * 1.4} rotationIntensity={0.6} floatIntensity={1.4} position={position}>
      <group ref={group} scale={scale}>
        {/* Glowing wireframe shell */}
        <mesh>
          <Geometry kind={kind} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.38} />
        </mesh>
        {/* Dark glossy core for depth */}
        <mesh scale={0.82}>
          <Geometry kind={kind} />
          <meshStandardMaterial
            color="#0b1220"
            emissive={color}
            emissiveIntensity={0.18}
            metalness={0.85}
            roughness={0.25}
            transparent
            opacity={0.55}
            flatShading
          />
        </mesh>
      </group>
    </Float>
  );
};

const CameraRig: React.FC = () => {
  const target = useRef(new THREE.Vector3());

  useFrame(({ camera }, delta) => {
    const t = Math.min(1, delta * 2.5);
    // Scroll drives depth, pointer drives parallax
    target.current.set(pointer.x * 1.2, -pointer.y * 0.8 - scroll.progress * 2, 8 - scroll.progress * 52);
    camera.position.lerp(target.current, t);
    camera.lookAt(camera.position.x * 0.4, camera.position.y * 0.4, camera.position.z - 10);
  });

  return null;
};

const Scene3DBackground: React.FC = () => {
  const mobile = isMobile();
  const reduced = prefersReducedMotion();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <Canvas
        dpr={mobile ? [1, 1.25] : [1, 1.6]}
        camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 120 }}
        gl={{ antialias: !mobile, alpha: true, powerPreference: 'high-performance' }}
        frameloop={reduced ? 'demand' : 'always'}
      >
        <fog attach="fog" args={['#07090e', 10, 34]} />
        <ambientLight intensity={0.35} />
        <pointLight position={[10, 10, 5]} intensity={60} color="#22d3ee" />
        <pointLight position={[-10, -8, -20]} intensity={60} color="#8b5cf6" />
        <StarField count={mobile ? 900 : 2200} />
        {(mobile ? SHAPES.filter((_, i) => i % 2 === 0) : SHAPES).map((s, i) => (
          <Crystal key={i} {...s} />
        ))}
        <CameraRig />
      </Canvas>
      {/* Vignette keeps text readable above the scene */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(7,9,14,0.75)_100%)]" />
    </div>
  );
};

export default Scene3DBackground;
