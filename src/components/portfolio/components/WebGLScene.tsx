import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, Box, Torus, Icosahedron, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function FloatingGeometry({ position, color, speed = 1, scale = 1, geometry = "sphere" }: {
  position: [number, number, number];
  color: string;
  speed?: number;
  scale?: number;
  geometry?: "sphere" | "box" | "torus" | "icosahedron";
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const rSpeed = useRef(Math.random() * 0.5 + 0.5);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * rSpeed.current * speed;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * rSpeed.current * speed;
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.5;
  });

  const GeometryComponent = {
    sphere: Sphere,
    box: Box,
    torus: Torus,
    icosahedron: Icosahedron,
  }[geometry];

  const matProps = geometry === "torus"
    ? { color, emissive: color, emissiveIntensity: 0.15, roughness: 0.2, metalness: 0.8 }
    : { color, speed: 2, factor: 0.4, emissive: color, emissiveIntensity: 0.1 };

  return (
    <Float speed={speed * 2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={meshRef} position={position} scale={scale} castShadow receiveShadow>
        {geometry === "sphere" && <sphereGeometry args={[1, 64, 64]} />}
        {geometry === "box" && <boxGeometry args={[1.2, 1.2, 1.2]} />}
        {geometry === "torus" && <torusGeometry args={[1, 0.35, 32, 64]} />}
        {geometry === "icosahedron" && <icosahedronGeometry args={[1, 1]} />}
        {geometry === "torus" ? (
          <meshStandardMaterial {...matProps} />
        ) : (
          <MeshDistortMaterial {...matProps} />
        )}
      </mesh>
    </Float>
  );
}

function ParticleField({ count = 500 }) {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
      const c = new THREE.Color().setHSL(0.12 + Math.random() * 0.05, 0.7, 0.5 + Math.random() * 0.3);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, [count]);

  const ref = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[points.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

function GlowingOrb() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.5;
    ref.current.position.y = Math.cos(state.clock.elapsedTime * 0.4) * 0.3;
  });

  return (
    <mesh ref={ref} position={[0, 0, -2]}>
      <sphereGeometry args={[0.15, 32, 32]} />
      <meshBasicMaterial color="#c9a84c" transparent opacity={0.9} />
    </mesh>
  );
}

export function WebGLScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#c9a84c" />
        <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={0.8} color="#c9a84c" />

        <ParticleField count={300} />

        <FloatingGeometry position={[-3, 1, -3]} color="#c9a84c" geometry="sphere" scale={0.6} speed={0.8} />
        <FloatingGeometry position={[3.5, -1, -2]} color="#e8c97a" geometry="box" scale={0.5} speed={1.2} />
        <FloatingGeometry position={[-2, -2, -1]} color="#a07830" geometry="icosahedron" scale={0.4} speed={0.6} />
        <FloatingGeometry position={[2, 2, -4]} color="#c9a84c" geometry="torus" scale={0.35} speed={1} />
        <FloatingGeometry position={[-0.5, 0.5, -2]} color="#d4a530" geometry="sphere" scale={0.25} speed={1.5} />
        <FloatingGeometry position={[1.5, -0.5, -1.5]} color="#b8952e" geometry="box" scale={0.3} speed={0.9} />

        <GlowingOrb />
      </Canvas>
    </div>
  );
}
