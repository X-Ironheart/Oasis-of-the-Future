import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// --- 3D Components ---
function WoodenSign({ position, text }: { position: [number, number, number]; text: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.8]} />
        <meshStandardMaterial color="#8B5A2B" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[1.2, 0.35, 0.05]} />
        <meshStandardMaterial color="#deb887" roughness={0.8} />
      </mesh>
      <Html position={[0, 0.7, 0.03]} transform center distanceFactor={3.5}>
        <div className="text-[13px] font-black text-amber-900 border-2 border-amber-900/50 px-2 py-0.5 rounded-sm bg-[#eaddcf]/90 pointer-events-none whitespace-nowrap shadow-sm">
          {text}
        </div>
      </Html>
    </group>
  );
}

function House({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Concrete Foundation */}
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[2.4, 0.2, 2.0]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.9} />
      </mesh>
      
      {/* Wooden Cladding Walls (Approximated by stacked thin boxes) */}
      <group position={[0, 0.7, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.0, 1.0, 1.6]} />
          <meshStandardMaterial color="#d4a373" roughness={0.8} />
        </mesh>
        {/* Planks visual effect on front face (Z = 0.8) */}
        {[-0.4, -0.2, 0, 0.2, 0.4].map((y, i) => (
          <mesh key={`plank-front-${i}`} position={[0, y, 0.81]} receiveShadow>
            <boxGeometry args={[2.0, 0.18, 0.02]} />
            <meshStandardMaterial color="#c28e5c" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Front Door */}
      <group position={[0, 0.6, 0.82]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.8, 0.05]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
        </mesh>
        {/* Door knob */}
        <mesh position={[0.15, 0, 0.04]} castShadow>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Windows */}
      {[-0.6, 0.6].map((x, i) => (
        <group key={`win-${i}`} position={[x, 0.7, 0.82]}>
          {/* Frame */}
          <mesh castShadow>
            <boxGeometry args={[0.4, 0.4, 0.04]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>
          {/* Glass */}
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[0.3, 0.3, 0.04]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Mullions */}
          <mesh position={[0, 0, 0.02]}><boxGeometry args={[0.3, 0.02, 0.04]}/><meshStandardMaterial color="#f8fafc" /></mesh>
          <mesh position={[0, 0, 0.02]}><boxGeometry args={[0.02, 0.3, 0.04]}/><meshStandardMaterial color="#f8fafc" /></mesh>
        </group>
      ))}

      {/* Pyramid Roof - Always points up, mathematically perfect */}
      <group position={[0, 1.2, 0]}>
        <mesh position={[0, 0.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[1.6, 1.0, 4]} />
          <meshStandardMaterial color="#475569" roughness={0.6} metalness={0.2} flatShading />
        </mesh>
      </group>

      {/* Vertical Pipe on the house side to go to ground */}
      <mesh position={[1.05, 0.6, 1.1]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.5} />
      </mesh>
    </group>
  );
}

function SolarPump({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Concrete Pad */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[1.6, 0.2, 1.6]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      
      {/* Pump Motor */}
      <group position={[0, 0.4, 0]}>
        {/* Motor Cylinder */}
        <mesh rotation={[Math.PI/2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.8, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Cooling Fins */}
        {[-0.3, -0.15, 0, 0.15, 0.3].map(z => (
          <mesh key={`fin-${z}`} position={[0, 0, z]} rotation={[Math.PI/2, 0, 0]} castShadow>
             <cylinderGeometry args={[0.28, 0.28, 0.02, 16]} />
             <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
        ))}
        {/* Pump Head */}
        <mesh position={[0, 0, 0.5]} rotation={[Math.PI/2, 0, 0]} castShadow>
           <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
           <meshStandardMaterial color="#0ea5e9" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>

      {/* Solar Panel Array on a mount */}
      <group position={[-0.8, 1.0, 0]}>
        {/* Support pole */}
        <mesh position={[0.4, -0.4, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
        </mesh>
        {/* Tilted Panel */}
        <group rotation={[-Math.PI / 6, 0, Math.PI / 8]}>
          <mesh castShadow>
            <boxGeometry args={[1.8, 1.4, 0.05]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Grid lines */}
          {[-0.6, -0.2, 0.2, 0.6].map(x => (
             <mesh key={`px-${x}`} position={[x, 0, 0.03]}><boxGeometry args={[0.02, 1.35, 0.01]}/><meshBasicMaterial color="#3b82f6"/></mesh>
          ))}
          {[-0.4, 0, 0.4].map(y => (
             <mesh key={`py-${y}`} position={[0, y, 0.03]}><boxGeometry args={[1.75, 0.02, 0.01]}/><meshBasicMaterial color="#3b82f6"/></mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

function RainwaterTank({ position }: { position: [number, number, number] }) {
  const waterRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (waterRef.current) {
      (waterRef.current.material as THREE.MeshStandardMaterial).opacity = 0.75 + Math.sin(clock.elapsedTime * 2) * 0.05;
      waterRef.current.position.y = 0.8 + Math.sin(clock.elapsedTime * 0.5) * 0.02; // Gentle slosh
    }
  });

  return (
    <group position={position}>
      {/* Foundation */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[3.4, 0.2, 3.4]} />
        <meshStandardMaterial color="#64748b" roughness={0.9} />
      </mesh>
      
      {/* Transparent Glass Panels */}
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 2.4, 2.8]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.2} metalness={0.8} roughness={0.05} />
      </mesh>

      {/* Heavy Steel Frame */}
      <group position={[0, 1.4, 0]}>
        {/* Corners */}
        {[[1.4, 1.4], [-1.4, 1.4], [1.4, -1.4], [-1.4, -1.4]].map(([x, z], i) => (
          <group key={`corner-${i}`} position={[x, 0, z]}>
            <mesh castShadow>
              <boxGeometry args={[0.15, 2.45, 0.15]} />
              <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
            </mesh>
            {/* Rivets on corners */}
            {[-1, 0, 1].map(y => (
              <mesh key={`rivet-${y}`} position={[x>0?0.08:-0.08, y, z>0?0.08:-0.08]} rotation={[0, Math.PI/4, 0]}>
                <sphereGeometry args={[0.03, 4, 4]} />
                <meshStandardMaterial color="#1e293b" metalness={0.9} />
              </mesh>
            ))}
          </group>
        ))}
        {/* Top/Bottom bracing */}
        {[-1.2, 1.2].map(y => (
          <group key={`brace-${y}`} position={[0, y, 0]}>
            <mesh position={[0, 0, 1.4]} castShadow><boxGeometry args={[2.8, 0.15, 0.15]} /><meshStandardMaterial color="#334155" metalness={0.7}/></mesh>
            <mesh position={[0, 0, -1.4]} castShadow><boxGeometry args={[2.8, 0.15, 0.15]} /><meshStandardMaterial color="#334155" metalness={0.7}/></mesh>
            <mesh position={[1.4, 0, 0]} castShadow><boxGeometry args={[0.15, 0.15, 2.8]} /><meshStandardMaterial color="#334155" metalness={0.7}/></mesh>
            <mesh position={[-1.4, 0, 0]} castShadow><boxGeometry args={[0.15, 0.15, 2.8]} /><meshStandardMaterial color="#334155" metalness={0.7}/></mesh>
          </group>
        ))}
      </group>

      {/* Water inside */}
      <mesh ref={waterRef} position={[0, 0.8, 0]}>
        <boxGeometry args={[2.75, 1.4, 2.75]} />
        <meshStandardMaterial color="#0284c7" transparent opacity={0.8} depthWrite={false} />
      </mesh>

      {/* Gauge / Level Indicator */}
      <group position={[1.48, 1.4, 0]}>
        {/* Backing plate */}
        <mesh>
          <boxGeometry args={[0.02, 2.0, 0.3]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        {/* Markers */}
        {[-0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8].map((y, i) => (
          <mesh key={`mark-${i}`} position={[0.012, y, 0]}>
            <boxGeometry args={[0.01, 0.02, y % 0.4 === 0 ? 0.2 : 0.1]} />
            <meshBasicMaterial color={y % 0.4 === 0 ? "#ef4444" : "#000000"} />
          </mesh>
        ))}
        {/* Floating indicator */}
        <mesh position={[0.03, -0.2, 0]} rotation={[0, 0, Math.PI/2]}>
           <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
           <meshStandardMaterial color="#f59e0b" metalness={0.5} />
        </mesh>
        {/* Glass tube */}
        <mesh position={[0.03, 0, 0]}>
           <cylinderGeometry args={[0.04, 0.04, 2.0, 8]} />
           <meshStandardMaterial color="#bae6fd" transparent opacity={0.4} metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

function DetailedPlant({ position, seed }: { position: [number, number, number]; seed: number }) {
  const rotY = (seed * 12.34) % (Math.PI * 2);
  const scale = 0.8 + ((seed * 7.5) % 0.4);
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.12, 5, 5]} />
        <meshStandardMaterial color="#166534" roughness={0.8} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI * 2) / 5) * 0.1, 0.1, Math.sin((i * Math.PI * 2) / 5) * 0.1]} rotation={[0, (i * Math.PI * 2) / 5, 0]} castShadow>
          <sphereGeometry args={[0.08, 4, 4]} />
          <meshStandardMaterial color="#4ade80" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function FarmArea({ position }: { position: [number, number, number] }) {
  const rows = [-1.5, -0.75, 0, 0.75, 1.5];
  return (
    <group position={position}>
      {/* Base dirt layer */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[4.5, 0.1, 4.5]} />
        <meshStandardMaterial color="#5c3a21" roughness={1} />
      </mesh>
      
      {/* Tilled Soil Mounds */}
      {rows.map((z, i) => (
        <group key={`row-${i}`} position={[0, 0.1, z]}>
          <mesh rotation={[Math.PI / 2, 0, Math.PI / 2]} receiveShadow castShadow>
            <cylinderGeometry args={[0.2, 0.2, 4.2, 8]} />
            <meshStandardMaterial color="#4a2e1b" roughness={1} />
          </mesh>
          
          {/* Detailed Plants along the row */}
          {[-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8].map((x, j) => (
            <DetailedPlant key={`plant-${j}`} position={[x, 0.15, 0]} seed={i * 10 + j} />
          ))}
          
          {/* Irrigation Pipe */}
          <mesh position={[0, 0.15, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 4.4, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          {/* Drip emitters / water puddles */}
          {[-1.8, -0.6, 0.6, 1.8].map((x, j) => (
             <mesh key={`drip-${j}`} position={[x, 0.16, 0.25]} rotation={[-Math.PI/2, 0, 0]}>
               <planeGeometry args={[0.2, 0.2]} />
               <meshStandardMaterial color="#0ea5e9" transparent opacity={0.6} roughness={0.1} />
             </mesh>
          ))}
        </group>
      ))}

      {/* Main distributor pipe */}
      <mesh position={[-2.2, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 4.0, 8]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
}

function PalmTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Segmented Trunk */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const y = i * 0.25;
        const width = 0.15 - i * 0.008; // Tapere upwards
        const sway = Math.sin(y * 0.5) * 0.1; // Slight curve
        return (
          <mesh key={i} position={[sway, y + 0.125, 0]} rotation={[0, (i*Math.PI)/3, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[width * 0.9, width, 0.28, 7]} />
            <meshStandardMaterial color="#5c3a21" roughness={1} />
          </mesh>
        );
      })}
      
      {/* Coconuts & Fronds */}
      <group position={[Math.sin(7*0.25*0.5)*0.1, 7*0.25 + 0.2, 0]}>
        {[0,1,2].map(i => (
          <mesh key={`coco-${i}`} position={[Math.cos(i*2.1)*0.15, -0.05, Math.sin(i*2.1)*0.15]} castShadow>
            <sphereGeometry args={[0.06, 6, 6]} />
            <meshStandardMaterial color="#064e3b" roughness={0.9} />
          </mesh>
        ))}
        {/* Fronds */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const angle = (i * Math.PI * 2) / 7;
          return (
            <group key={`frond-${i}`} rotation={[0, angle, 0]}>
              {/* Frond segments to make it curve down */}
              {[0, 1, 2, 3].map((j) => (
                <mesh key={`seg-${j}`} position={[0, -j*0.05, 0.2 + j*0.3]} rotation={[j * 0.15, 0, 0]} castShadow>
                  {/* Leaf shape */}
                  <boxGeometry args={[0.3 - j*0.06, 0.02, 0.35]} />
                  <meshStandardMaterial color="#15803d" roughness={0.6} />
                </mesh>
              ))}
            </group>
          );
        })}
      </group>
    </group>
  );
}

// Highly detailed architectural pipes with flanges, mathematically stable
function PipeLine({ from, to, color = "#94a3b8", radius = 0.04 }: { from: [number, number, number]; to: [number, number, number]; color?: string; radius?: number }) {
  const distance = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const midX = (from[0] + to[0]) / 2;
  const midY = (from[1] + to[1]) / 2;
  const midZ = (from[2] + to[2]) / 2;
  
  const dummy = React.useMemo(() => new THREE.Object3D(), []);
  
  dummy.position.set(from[0], from[1], from[2]);
  dummy.lookAt(to[0], to[1], to[2]);

  return (
    <group position={[midX, midY, midZ]} rotation={dummy.rotation}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, distance, 12]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Joints/Flanges */}
      <mesh position={[0, 0, distance/2 - 0.05]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius * 1.5, radius * 1.5, 0.08, 12]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>
      <mesh position={[0, 0, -distance/2 + 0.05]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius * 1.5, radius * 1.5, 0.08, 12]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>
    </group>
  );
}

function WaterDroplet({ startPos, endPos, delay }: { startPos: [number,number,number]; endPos: [number,number,number]; delay: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = ((clock.elapsedTime + delay) % 1.5) / 1.5;
      ref.current.position.x = startPos[0] + (endPos[0] - startPos[0]) * t;
      ref.current.position.y = startPos[1] + (endPos[1] - startPos[1]) * t;
      ref.current.position.z = startPos[2] + (endPos[2] - startPos[2]) * t;
      (ref.current.material as THREE.MeshStandardMaterial).opacity = t < 0.1 || t > 0.9 ? 0 : 1;
    }
  });
  return (
    <mesh ref={ref} position={startPos} castShadow>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshStandardMaterial color="#38bdf8" transparent opacity={0.9} emissive="#0ea5e9" emissiveIntensity={0.8} />
    </mesh>
  );
}

function RainParticles() {
  const count = 1500;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 40,
      y: Math.random() * 20,
      z: (Math.random() - 0.5) * 30,
      speed: 0.3 + Math.random() * 0.2
    }));
  }, [count]);

  useFrame(() => {
    const instancedMesh = meshRef.current;
    if (!instancedMesh) return;
    particles.forEach((particle, i) => {
      particle.y -= particle.speed;
      particle.x -= particle.speed * 0.15; // Wind effect X
      particle.z -= particle.speed * 0.05; // Wind effect Z
      
      // Reset when hits the ground
      if (particle.y < -1) {
        particle.y = 20;
        particle.x = (Math.random() - 0.5) * 40;
        particle.z = (Math.random() - 0.5) * 30;
      }
      
      dummy.position.set(particle.x, particle.y, particle.z);
      dummy.scale.set(0.015, 0.4, 0.015);
      // Tilt matches wind speed
      dummy.rotation.z = -0.15;
      dummy.rotation.x = -0.05;
      
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    });
    instancedMesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#e0f2fe" transparent opacity={0.4} />
    </instancedMesh>
  );
}

function Clouds() {
  const cloudGroup = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (cloudGroup.current) {
      cloudGroup.current.position.x = Math.sin(clock.elapsedTime * 0.05) * 3;
    }
  });

  // Static positions for clouds to avoid jitter
  const cloudData = useMemo(() => {
    const data = [];
    for (let x of [-10, -4, 2, 8, 14]) {
      for (let j = 0; j < 3; j++) {
        data.push({
          x: x + (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 2,
          z: (Math.random() - 0.5) * 12,
          scale: 2 + Math.random() * 2
        });
      }
    }
    return data;
  }, []);

  return (
    <group ref={cloudGroup} position={[0, 16, 0]}>
      {cloudData.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]}>
          <sphereGeometry args={[c.scale, 16, 16]} />
          <meshStandardMaterial color="#64748b" transparent opacity={0.6} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function WaterScene() {
  return (
    <group position={[0, -1.2, 0]}>
      {/* Dynamic Weather System */}
      <Clouds />
      <RainParticles />

      {/* Base Terrain */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[22, 0.1, 16]} />
        <meshStandardMaterial color="#d4c3a3" roughness={1} />
      </mesh>
      {/* Residential Zone Grass */}
      <mesh position={[-4.5, 0.01, 0]} receiveShadow>
        <boxGeometry args={[8, 0.05, 10]} />
        <meshStandardMaterial color="#86efac" roughness={1} />
      </mesh>

      {/* Highly Detailed Houses */}
      <House position={[-6.5, 0, -2.5]} />
      <House position={[-2.5, 0, -2.5]} />
      <House position={[-6.5, 0, 2.5]} />
      <House position={[-2.5, 0, 2.5]} />

      {/* Heart of the System: Detailed Tank & Solar Pump in the corner */}
      <RainwaterTank position={[7.5, 0, -4.5]} />
      <SolarPump position={[2, 0, -4.5]} />

      {/* Detailed Farm & Trees */}
      <FarmArea position={[6, 0, 3]} />
      <PalmTree position={[4.2, 0, 4.5]} scale={1.2} />
      <PalmTree position={[8.2, 0, 1.5]} scale={1.0} />
      <PalmTree position={[3.5, 0, 2]} scale={0.9} />

      {/* =========================================
          INTEGRATED PIPE NETWORK (Ground Level Only)
          ========================================= */}
      {/* 1. Ground Level Grid for Houses */}
      <PipeLine from={[-5.45, 0.15, -1.4]} to={[-5.45, 0.15, 3.6]} />
      <PipeLine from={[-1.45, 0.15, -1.4]} to={[-1.45, 0.15, 3.6]} />
      <PipeLine from={[-5.45, 0.15, -1.4]} to={[-1.45, 0.15, -1.4]} />
      <PipeLine from={[-5.45, 0.15, 3.6]} to={[-1.45, 0.15, 3.6]} />

      {/* 2. Main Feed to Solar Pump (Ground level) */}
      <PipeLine from={[-1.45, 0.15, -1.4]} to={[-1.45, 0.15, -4.5]} />
      <PipeLine from={[-1.45, 0.15, -4.5]} to={[2.0, 0.15, -4.5]} />

      {/* 3. Pump to Tank (Ground level) */}
      <PipeLine from={[2.0, 0.15, -4.5]} to={[7.5, 0.15, -4.5]} />

      {/* 4. Tank Output to Farm (Ground level) */}
      <PipeLine from={[7.5, 0.15, -4.5]} to={[7.5, 0.15, 3.0]} />
      <PipeLine from={[7.5, 0.15, 3.0]} to={[3.8, 0.15, 3.0]} />
      
      {/* Visual Flow Indicators (Water droplets) */}
      <WaterDroplet startPos={[-5.45, 0.15, 3.6]} endPos={[-5.45, 0.15, -1.4]} delay={0} />
      <WaterDroplet startPos={[-1.45, 0.15, 3.6]} endPos={[-1.45, 0.15, -1.4]} delay={0.5} />
      <WaterDroplet startPos={[-5.45, 0.15, -1.4]} endPos={[-1.45, 0.15, -1.4]} delay={0.2} />
      
      <WaterDroplet startPos={[-1.45, 0.15, -1.4]} endPos={[-1.45, 0.15, -4.5]} delay={0.7} />
      <WaterDroplet startPos={[-1.45, 0.15, -4.5]} endPos={[2.0, 0.15, -4.5]} delay={0.1} />
      
      <WaterDroplet startPos={[2.0, 0.15, -4.5]} endPos={[7.5, 0.15, -4.5]} delay={0} />
      
      <WaterDroplet startPos={[7.5, 0.15, -4.5]} endPos={[7.5, 0.15, 3.0]} delay={0.4} />
      <WaterDroplet startPos={[7.5, 0.15, 3.0]} endPos={[3.8, 0.15, 3.0]} delay={0.9} />

      {/* Labels */}
      <WoodenSign position={[-4.5, 0, 5]} text="الشبكة السكنية (Rooftop Catchment)" />
      <WoodenSign position={[2.0, 0, -2.5]} text="مضخة شمسية (Solar Pump)" />
      <WoodenSign position={[7.5, 0, -2.0]} text="خزان ذكي (Smart Tank)" />
      <WoodenSign position={[6.5, 0, 5.5]} text="ري ذكي (Demand-Based Irrigation)" />
    </group>
  );
}

const stats = [
  { en: 'Liters Harvested/Year', ar: 'لتر حصاد سنوي', value: '50K', icon: '💧' },
  { en: 'Water Efficiency', ar: 'كفاءة المياه', value: '85%', icon: '📊' },
  { en: 'Collection Points', ar: 'نقاط التجميع', value: '4', icon: '🏠' },
  { en: 'Storage Tanks', ar: 'خزانات تخزين', value: '3', icon: '🫙' },
];

const features = [
  {
    icon: '🌧️',
    titleAr: 'حصاد مياه الأمطار',
    titleEn: 'Rainwater Harvesting',
    descAr: 'تجمع الأنابيب الرمادية مياه الأمطار من أسطح المنازل الأربعة وتوصلها مباشرة للخزان الرئيسي.',
    descEn: 'Gray pipes collect rainwater from four house rooftops and deliver it directly to the main tank.',
  },
  {
    icon: '🫙',
    titleAr: 'خزان المياه الشفاف',
    titleEn: 'Transparent Water Tank',
    descAr: 'حوض مكعب شفاف يمثل خزان تجميع مياه الأمطار مع مقياس مستوى المياه الذكي.',
    descEn: 'A transparent cubic tank stores rainwater with a smart water-level gauge indicator.',
  },
  {
    icon: '🚿',
    titleAr: 'توزيع المياه الذكي',
    titleEn: 'Smart Water Distribution',
    descAr: 'تتفرع أنابيب التوزيع من الخزان نحو الأراضي الزراعية وأحواض شرب الماشية.',
    descEn: 'Distribution pipes branch from the tank to farmlands and livestock watering troughs.',
  },
  {
    icon: '⚡',
    titleAr: 'ضخ بالطاقة الشمسية',
    titleEn: 'Solar-Powered Pumping',
    descAr: 'المضخات تعمل بالكهرباء المولدة من الألواح الشمسية على أسطح المنازل لضمان الاستدامة.',
    descEn: 'Pumps run on electricity generated by solar panels on house rooftops for full sustainability.',
  },
];

export default function Water() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col gap-0 pb-16"
    >
      {/* Hero + 3D */}
      <section className="relative h-[80vh] bg-gradient-to-b from-sky-900 via-sky-700 to-sky-500 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-sky-900/80 via-transparent to-sky-900/60 z-10 pointer-events-none" />

        <div className="w-full h-full">
          <Canvas shadows camera={{ position: [0, 10, 16], fov: 40 }}>
            <color attach="background" args={['#0c4a6e']} />
            <ambientLight intensity={0.5} />
            <directionalLight castShadow position={[5, 15, 5]} intensity={2} shadow-mapSize={[2048, 2048]} />
            <pointLight position={[0, 5, 0]} color="#7dd3fc" intensity={2} />
            <Environment preset="dawn" />
            <OrbitControls autoRotate autoRotateSpeed={0.3} maxPolarAngle={Math.PI / 2.2} minDistance={8} maxDistance={28} target={[0, -1, 0]} />
            <WaterScene />
            <ContactShadows position={[0, -1.25, 0]} opacity={0.5} scale={22} blur={2} far={4} color="#0c4a6e" />
          </Canvas>
        </div>

        <div className="absolute top-6 md:top-10 left-1/2 -translate-x-1/2 z-20 text-center px-4 pointer-events-none w-full max-w-4xl">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <h1 className="text-[clamp(1.25rem,4vw+0.5rem,3rem)] font-extrabold text-white drop-shadow-2xl bg-sky-900/60 px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl backdrop-blur-sm border border-white/20 inline-block leading-tight">
              {isAr ? '💧 نظام تجميع وتخزين المياه' : '💧 Water Harvesting & Storage System'}
            </h1>
            <p className="text-white/90 text-[clamp(0.75rem,2vw+0.25rem,1.125rem)] mt-3 md:mt-4 font-semibold bg-black/30 px-4 md:px-6 py-1.5 md:py-2 rounded-full backdrop-blur-md inline-block">
              {isAr ? 'حصاد الأمطار • التخزين الذكي • الري المستدام' : 'Rainwater Harvesting • Smart Storage • Sustainable Irrigation'}
            </p>
          </motion.div>
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-24 md:bottom-6 left-1/2 md:left-6 -translate-x-1/2 md:translate-x-0 z-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-3 md:p-4 pointer-events-none w-[90%] sm:w-auto flex flex-col items-center md:items-start shadow-xl">
          <p className="text-white/80 text-[clamp(0.7rem,2vw,0.8rem)] font-bold mb-2 text-center md:text-left">{isAr ? 'أسحب لاستكشاف النموذج' : 'Drag to explore the model'}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
            {[{c:'#38bdf8',l:isAr?'مياه':'Water'},{c:'#94a3b8',l:isAr?'أنابيب':'Pipes'},{c:'#15803d',l:isAr?'حقول':'Fields'}].map(x=>(
              <span key={x.l} className="flex items-center gap-1 text-white text-[clamp(0.65rem,1.5vw,0.75rem)] bg-black/20 px-2 py-0.5 rounded-full"><span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{background:x.c}}/>{x.l}</span>
            ))}
          </div>
        </div>

        {/* Scroll Down Button */}
        <motion.button
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 15, 0], scale: [1, 1.05, 1] }}
          transition={{ delay: 1, duration: 1.5, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-sky-600/80 hover:bg-sky-600 backdrop-blur-md text-white rounded-full p-4 border-2 border-white/40 transition-all shadow-2xl flex items-center justify-center cursor-pointer"
        >
          <ChevronDown size={48} strokeWidth={2.5} />
        </motion.button>
      </section>

      {/* Stats */}
      <section className="bg-sky-800 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 * i }} className="text-center text-white">
                <div className="text-4xl mb-1">{s.icon}</div>
                <div className="text-3xl font-black text-sky-300">{s.value}</div>
                <div className="text-sm text-sky-200 font-semibold">{isAr ? s.ar : s.en}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-sky-800 mb-3">
            {isAr ? '🌊 مكونات نظام المياه' : '🌊 Water System Components'}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            {isAr
              ? 'نظام متكامل لحصاد مياه الأمطار من الأسطح وتخزينها في خزانات شفافة وتوزيعها على الأراضي الزراعية والماشية.'
              : 'An integrated system that harvests rainwater from rooftops, stores it in transparent tanks, and distributes it to farmlands and livestock.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8, scale: 1.03 }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * i }}
              className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-sky-400 hover:shadow-2xl transition-all"
            >
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-sky-800 mb-2">{isAr ? f.titleAr : f.titleEn}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{isAr ? f.descAr : f.descEn}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Flow Diagram */}
      <section className="bg-gradient-to-r from-sky-50 to-blue-50 border-y border-sky-200 py-12">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-sky-800 text-center mb-8">
            {isAr ? '🔄 مسار تدفق المياه' : '🔄 Water Flow Path'}
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {[
              { icon: '🌧️', label: isAr ? 'الأمطار' : 'Rain' },
              { icon: '🏠', label: isAr ? 'أسطح المنازل' : 'Rooftops' },
              { icon: '🔩', label: isAr ? 'أنابيب رمادية' : 'Gray Pipes' },
              { icon: '🫙', label: isAr ? 'الخزان الرئيسي' : 'Main Tank' },
              { icon: '⚡', label: isAr ? 'مضخة شمسية' : 'Solar Pump' },
              { icon: '🌱', label: isAr ? 'الأراضي الزراعية' : 'Farmlands' },
              { icon: '🐄', label: isAr ? 'الماشية' : 'Livestock' },
            ].map((item, i, arr) => (
              <React.Fragment key={i}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex flex-col items-center bg-white rounded-2xl px-5 py-4 shadow-md border border-sky-100"
                >
                  <span className="text-3xl mb-1">{item.icon}</span>
                  <span className="text-sky-700 font-bold text-sm">{item.label}</span>
                </motion.div>
                {i < arr.length - 1 && (
                  <span className="text-sky-400 text-2xl font-bold">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
      {/* Educational & Future Prospects Section */}
      <section className="container mx-auto px-4 py-12 mb-8">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-100 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-sky-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">🌍</span>
              {isAr ? 'الرؤية البيئية والآفاق المستقبلية' : 'Environmental Vision & Future Prospects'}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="bg-sky-50 rounded-2xl p-6 border border-sky-100">
                <h3 className="text-xl font-bold text-sky-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🌱</span>
                  {isAr ? 'المفاهيم البيئية المطبقة' : 'Applied Environmental Concepts'}
                </h3>
                <p className="text-gray-700 leading-relaxed text-[clamp(0.9rem,2vw,1.05rem)] text-justify">
                  {isAr 
                    ? 'يُطبق النظام مبدأ "حلقة المياه المغلقة" (Closed-Loop Water)، حيث يتم التقاط وتخزين كل قطرة من مياه الأمطار بدلاً من إهدارها، مما يُقلل الضغط بشكل كبير على المياه الجوفية. كما تضمن المضخات المعتمدة كلياً على الطاقة الشمسية عدم وجود أي انبعاثات كربونية مرتبطة بعملية نقل وضخ المياه.' 
                    : 'The system implements a "Closed-Loop Water" principle, capturing and storing rainwater instead of wasting it, which significantly reduces the strain on groundwater aquifers. Additionally, fully solar-powered pumps ensure zero carbon emissions during the water distribution process.'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 text-white shadow-lg transform hover:-translate-y-1 transition-transform">
                <h3 className="text-xl font-bold text-sky-300 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  {isAr ? 'الآفاق والتطوير المستقبلي' : 'Future Prospects & Development'}
                </h3>
                <p className="text-gray-300 leading-relaxed text-[clamp(0.9rem,2vw,1.05rem)] text-justify">
                  {isAr 
                    ? 'سيتم مستقبلاً دمج مستشعرات رطوبة التربة الذكية (IoT) لتوفير ري فائق الدقة بالقطرة، كما نخطط لاستكشاف تقنيات استخلاص المياه من الغلاف الجوي (AWG) لمواجهة فترات الجفاف الطويلة، بالإضافة إلى إعادة تدوير المياه الرمادية (Greywater) للاستخدامات غير القابلة للشرب.' 
                    : 'Future iterations will integrate IoT soil moisture sensors for ultra-precise drip irrigation. We also plan to explore Atmospheric Water Generation (AWG) technologies to combat extended droughts, alongside recycling greywater for non-potable agricultural uses.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
