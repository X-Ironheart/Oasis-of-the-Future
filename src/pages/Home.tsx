import { useMemo, useRef, useState, useLayoutEffect, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { teamMembers, supervisor } from '../data/team';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { CanvasLoader } from '../components/CanvasLoader';

// ==========================================
// 1. Procedural Textures (Memory Optimized)
// ==========================================
type ProceduralTextures = { grass: THREE.CanvasTexture; wood: THREE.CanvasTexture; darkWood: THREE.CanvasTexture; path: THREE.CanvasTexture; soil: THREE.CanvasTexture };

function createProceduralTextures(): ProceduralTextures {
  const createTex = (w: number, h: number, render: (ctx: CanvasRenderingContext2D) => void) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d')!;
    render(ctx);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  };

  const grass = createTex(512, 512, (ctx) => {
    ctx.fillStyle = '#2d5a27'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 50000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#1e3f1a' : '#3d7536';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, Math.random() * 5);
    }
  });
  grass.repeat.set(8, 8);

  const wood = createTex(512, 512, (ctx) => {
    ctx.fillStyle = '#cda47b'; ctx.fillRect(0, 0, 512, 512);
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = '#5c3a21'; ctx.beginPath();
      ctx.moveTo(0, Math.random() * 512);
      ctx.bezierCurveTo(256, Math.random() * 512, 256, Math.random() * 512, 512, Math.random() * 512);
      ctx.lineWidth = Math.random() * 4; ctx.stroke();
    }
  });

  const darkWood = createTex(256, 256, (ctx) => {
    ctx.fillStyle = '#6b4423'; ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#4a2f18';
    for(let i=0; i<100; i++) ctx.fillRect(0, Math.random()*256, 256, Math.random()*3);
  });

  const pathTex = createTex(512, 512, (ctx) => {
    ctx.fillStyle = '#8b7355'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 40000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#6e5a42' : '#a88f6f';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
    }
  });
  pathTex.repeat.set(4, 4);

  const soil = createTex(256, 256, (ctx) => {
    ctx.fillStyle = '#3e2723'; ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 20000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#271714' : '#54362f';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
  });

  return { grass, wood, darkWood, path: pathTex, soil };
}

// Singleton: textures are created once at module load time, never during render
let _proceduralTextures: ProceduralTextures | null = null;
function useProceduralTextures(): ProceduralTextures {
  if (_proceduralTextures == null) {
    _proceduralTextures = createProceduralTextures();
  }
  return _proceduralTextures;
}

// ==========================================
// 2. High-Fidelity 3D Components
// ==========================================

function WoodenSign({ position, text, textures }: { position: [number, number, number]; text: string; textures: ProceduralTextures }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1]} />
        <meshStandardMaterial map={textures.darkWood} roughness={1} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[1.2, 0.4, 0.05]} />
        <meshStandardMaterial map={textures.wood} roughness={0.9} />
      </mesh>
      <Html position={[0, 0.85, 0.03]} transform center distanceFactor={4}>
        <div className="text-[14px] font-black text-amber-950 px-3 py-1 rounded shadow-sm border border-amber-900/30" 
             style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)', backdropFilter: 'blur(4px)' }}>
          {text}
        </div>
      </Html>
    </group>
  );
}

// Procedural Desert Dunes (Triangular Corner Shape)
function RealisticDunes({ position }: { position: [number, number, number] }) {
  const geomRef = useRef<THREE.PlaneGeometry>(null);
  
  useLayoutEffect(() => {
    if (geomRef.current) {
      const posAttribute = geomRef.current.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < posAttribute.count; i++) {
        v.fromBufferAttribute(posAttribute, i);
        
        // Triangle clip: keep only the top-right half (x + y > 0)
        // Pull vertices with x + y < 0 to the diagonal to form a sharp triangle.
        if (v.x + v.y < 0) {
          const t = -(v.x + v.y) / 2;
          v.x += t;
          v.y += t;
        }

        // Create a solid skirt by dropping all boundary vertices
        const isSkirt = v.x > 7.8 || v.y > 7.8 || (v.x + v.y) < 0.2;
        
        if (isSkirt) {
          v.z = -0.4; // Drop down to make a solid block
        } else {
          // Combine sine waves to create wind-swept dune ridges inside the triangle
          const ridge1 = Math.abs(Math.sin(v.x * 0.5 + v.y * 0.5)) * 1.5;
          const ridge2 = Math.cos(v.x * 1.2) * 0.5;
          const base = Math.sin(v.x * 0.2) * Math.cos(v.y * 0.2) * 2;
          v.z = Math.max(0, (ridge1 + ridge2 + base) * 0.4);
        }
        
        posAttribute.setXYZ(i, v.x, v.y, v.z);
      }
      posAttribute.needsUpdate = true;
      geomRef.current.computeVertexNormals();
    }
  }, []);

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
      <planeGeometry ref={geomRef} args={[16, 16, 128, 128]} />
      <meshStandardMaterial color="#e8cd87" roughness={1} metalness={0.05} />
    </mesh>
  );
}

function DetailedTurbine({ position }: { position: [number, number, number] }) {
  const bladesRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (bladesRef.current) bladesRef.current.rotation.z -= 0.05;
  });
  return (
    <group position={position} scale={[1.2, 1.2, 1.2]}>
      {/* Base & Tower */}
      <mesh position={[0, 0.1, 0]} castShadow><cylinderGeometry args={[0.2, 0.25, 0.2]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
      <mesh position={[0, 2.5, 0]} castShadow><cylinderGeometry args={[0.04, 0.15, 5, 16]} /><meshStandardMaterial color="#f8fafc" roughness={0.3} /></mesh>
      {/* Nacelle (Generator housing) */}
      <mesh position={[0, 5, -0.15]} castShadow><boxGeometry args={[0.25, 0.25, 0.7]} /><meshStandardMaterial color="#f8fafc" roughness={0.2} /></mesh>
      {/* Rotor & Blades */}
      <group position={[0, 5, 0.25]} ref={bladesRef}>
        <mesh castShadow><sphereGeometry args={[0.12, 16, 16]} /><meshStandardMaterial color="#f8fafc" /></mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
            <mesh position={[0, 1.3, 0]} rotation={[0, 0.3, 0]} castShadow>
              {/* Twisted aerodynamic blade */}
              <boxGeometry args={[0.06, 2.6, 0.02]} />
              <meshStandardMaterial color="#ffffff" roughness={0.1} />
            </mesh>
          </mesh>
        ))}
      </group>
    </group>
  );
}

function ResidentialHouse({ position, rotation = [0, 0, 0], textures }: { position: [number, number, number]; rotation?: [number, number, number]; textures: ProceduralTextures }) {
  // Eaves: Roof is slightly wider and longer than the walls
  const triangleShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.8, 0); // Extended eaves
    shape.lineTo(0.8, 0);
    shape.lineTo(0, 0.7);  // Higher peak
    shape.lineTo(-0.8, 0);
    return shape;
  }, []);

  return (
    <group position={position} rotation={rotation} scale={[1.3, 1.3, 1.3]}>
      {/* Base */}
      <mesh position={[0, 0.05, 0]} receiveShadow><boxGeometry args={[2.5, 0.1, 2.1]} /><meshStandardMaterial map={textures.wood} roughness={0.9} /></mesh>

      {/* Walls */}
      <group position={[0, 0.65, 0]}>
        <mesh castShadow receiveShadow><boxGeometry args={[1.8, 1.1, 1.4]} /><meshStandardMaterial map={textures.wood} roughness={1} /></mesh>
        {/* Windows */}
        <mesh position={[0.4, 0.1, 0.71]} castShadow><boxGeometry args={[0.4, 0.4, 0.05]} /><meshStandardMaterial color="#1e293b" /></mesh>
        <mesh position={[-0.4, 0.1, -0.71]} castShadow><boxGeometry args={[0.4, 0.4, 0.05]} /><meshStandardMaterial color="#1e293b" /></mesh>
      </group>

      {/* Gable Ends (on the X-axis sides since roof pitches along Z) */}
      <mesh position={[0.9, 1.2, 0]} rotation={[0, Math.PI/2, 0]} castShadow><shapeGeometry args={[triangleShape]} /><meshStandardMaterial map={textures.wood} roughness={1} /></mesh>
      <mesh position={[-0.9, 1.2, 0]} rotation={[0, -Math.PI/2, 0]} castShadow><shapeGeometry args={[triangleShape]} /><meshStandardMaterial map={textures.wood} roughness={1} /></mesh>

      {/* Roof Panels (Wood side) */}
      <mesh position={[0, 1.6, -0.5]} rotation={[Math.PI / 4.4, 0, 0]} castShadow><boxGeometry args={[2.2, 1.4, 0.06]} /><meshStandardMaterial map={textures.wood} roughness={1} /></mesh>

      {/* Roof Panels (Solar side) with highly detailed 3D Grid */}
      <group position={[0, 1.6, 0.5]} rotation={[-Math.PI / 4.4, 0, 0]}>
        <mesh castShadow><boxGeometry args={[2.2, 1.4, 0.06]} /><meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.2} /></mesh>
        <group position={[0, 0, 0.035]}>
          {[-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9].map(x => (
            <mesh key={`v-${x}`} position={[x, 0, 0]} castShadow><boxGeometry args={[0.015, 1.35, 0.01]} /><meshStandardMaterial color="#e2e8f0" metalness={0.9} /></mesh>
          ))}
          {[-0.6, -0.3, 0, 0.3, 0.6].map(y => (
            <mesh key={`h-${y}`} position={[0, y, 0]} castShadow><boxGeometry args={[2.15, 0.015, 0.01]} /><meshStandardMaterial color="#e2e8f0" metalness={0.9} /></mesh>
          ))}
        </group>
      </group>

      {/* Gutter System */}
      <mesh position={[0, 1.15, 0.95]} rotation={[0, 0, Math.PI/2]} castShadow><cylinderGeometry args={[0.03, 0.03, 2.3]} /><meshStandardMaterial color="#64748b" roughness={0.5} /></mesh>
      <mesh position={[1.15, 0.6, 0.95]} castShadow><cylinderGeometry args={[0.03, 0.03, 1.1]} /><meshStandardMaterial color="#64748b" roughness={0.5} /></mesh>

      {/* Rain Barrel */}
      <group position={[1.15, 0.25, 0.95]}>
        <mesh castShadow><cylinderGeometry args={[0.2, 0.2, 0.5, 16]} /><meshStandardMaterial color="#334155" roughness={0.8} /></mesh>
        {[0.15, 0, -0.15].map(y => (
          <mesh key={y} position={[0, y, 0]} castShadow><cylinderGeometry args={[0.21, 0.21, 0.02, 16]} /><meshStandardMaterial color="#0f172a" /></mesh>
        ))}
      </group>
    </group>
  );
}

function LivestockBarn({ position, rotation = [0, 0, 0], textures }: { position: [number, number, number]; rotation?: [number, number, number]; textures: ProceduralTextures }) {
  return (
    <group position={position} rotation={rotation} scale={[0.8, 0.8, 0.8]}>
      <mesh position={[0, 0.05, 0]} receiveShadow><boxGeometry args={[5, 0.1, 4]} /><meshStandardMaterial map={textures.wood} roughness={1} /></mesh>
      
      {/* Solid Back & Side Walls */}
      <mesh position={[0, 0.8, -1.8]} castShadow><boxGeometry args={[4.8, 1.4, 0.1]} /><meshStandardMaterial map={textures.wood} roughness={1} /></mesh>
      <mesh position={[-2.35, 0.8, -0.4]} castShadow><boxGeometry args={[0.1, 1.4, 2.9]} /><meshStandardMaterial map={textures.wood} roughness={1} /></mesh>
      <mesh position={[2.35, 0.8, -0.4]} castShadow><boxGeometry args={[0.1, 1.4, 2.9]} /><meshStandardMaterial map={textures.wood} roughness={1} /></mesh>

      {/* Large Shed Roof */}
      <mesh position={[0, 1.6, -0.2]} rotation={[0.15, 0, 0]} castShadow><boxGeometry args={[5.2, 0.08, 3.6]} /><meshStandardMaterial map={textures.wood} roughness={1} /></mesh>

      {/* Large Fenced Enclosure */}
      <group position={[0, 0.4, 1.8]}>
        {[-2.3, -1.5, -0.5, 0.5, 1.5, 2.3].map(x => (
          <mesh key={x} position={[x, 0, 0]} castShadow><boxGeometry args={[0.08, 0.6, 0.08]} /><meshStandardMaterial map={textures.darkWood} /></mesh>
        ))}
        <mesh position={[0, 0.15, 0]} castShadow><boxGeometry args={[4.8, 0.05, 0.05]} /><meshStandardMaterial map={textures.darkWood} /></mesh>
        <mesh position={[0, -0.15, 0]} castShadow><boxGeometry args={[4.8, 0.05, 0.05]} /><meshStandardMaterial map={textures.darkWood} /></mesh>
      </group>
      
      {/* Central Water/Feed Trough */}
      <group position={[0, 0.2, 0.5]}>
        <mesh castShadow receiveShadow><boxGeometry args={[2, 0.2, 0.6]} /><meshStandardMaterial map={textures.wood} /></mesh>
        <mesh position={[0, 0.11, 0]}><boxGeometry args={[1.8, 0.02, 0.4]} /><meshPhysicalMaterial color="#38bdf8" transmission={0.8} opacity={0.8} transparent /></mesh>
      </group>

      {/* Animals (Cows and Sheep approximations) */}
      <HighlyDetailedCow position={[-1.2, 0, 0.8]} rotation={[0, Math.PI/3, 0]} color="#fef3c7" spotColor="#92400e" />
      <HighlyDetailedCow position={[1.2, 0, -0.2]} rotation={[0, -Math.PI/4, 0]} color="#ffffff" spotColor="#1e293b" />
      <HighlyDetailedCow position={[-0.5, 0, -1.0]} rotation={[0, Math.PI/6, 0]} color="#d4a373" spotColor="#451a03" />
      {/* Smaller sheep */}
      <HighlyDetailedCow position={[1.5, -0.1, 1.2]} rotation={[0, -Math.PI/2, 0]} color="#f1f5f9" spotColor="#f1f5f9" scale={[0.6, 0.5, 0.6]} />
    </group>
  );
}

function HighlyDetailedCow({ position, rotation = [0,0,0], color, spotColor, scale=[0.8,0.8,0.8] }: { position: [number, number, number]; rotation?: [number, number, number]; color: string; spotColor: string; scale?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0.4, 0]} castShadow><boxGeometry args={[0.8, 0.4, 0.35]} /><meshStandardMaterial color={color} roughness={1} /></mesh>
      <mesh position={[0.1, 0.4, 0.18]} castShadow><boxGeometry args={[0.3, 0.2, 0.01]} /><meshStandardMaterial color={spotColor} /></mesh>
      <mesh position={[-0.2, 0.45, -0.18]} castShadow><boxGeometry args={[0.2, 0.2, 0.01]} /><meshStandardMaterial color={spotColor} /></mesh>
      <group position={[0.45, 0.6, 0]}>
        <mesh castShadow><boxGeometry args={[0.3, 0.3, 0.25]} /><meshStandardMaterial color={color} roughness={1} /></mesh>
        <mesh position={[0.15, -0.05, 0]} castShadow><boxGeometry args={[0.1, 0.15, 0.2]} /><meshStandardMaterial color="#fca5a5" /></mesh>
        <mesh position={[-0.05, 0.1, 0.15]} rotation={[0, 0, Math.PI/4]} castShadow><boxGeometry args={[0.15, 0.05, 0.05]} /><meshStandardMaterial color={color} /></mesh>
        <mesh position={[-0.05, 0.1, -0.15]} rotation={[0, 0, -Math.PI/4]} castShadow><boxGeometry args={[0.15, 0.05, 0.05]} /><meshStandardMaterial color={color} /></mesh>
        <mesh position={[0, 0.2, 0.1]} castShadow><cylinderGeometry args={[0.01, 0.03, 0.1]} /><meshStandardMaterial color="#e2e8f0" /></mesh>
        <mesh position={[0, 0.2, -0.1]} castShadow><cylinderGeometry args={[0.01, 0.03, 0.1]} /><meshStandardMaterial color="#e2e8f0" /></mesh>
      </group>
      <mesh position={[0, 0.18, 0]} castShadow><boxGeometry args={[0.2, 0.1, 0.15]} /><meshStandardMaterial color="#fca5a5" /></mesh>
      <mesh position={[-0.45, 0.4, 0]} rotation={[0, 0, Math.PI/8]} castShadow><cylinderGeometry args={[0.01, 0.02, 0.3]} /><meshStandardMaterial color={color} /></mesh>
      {[-0.3, 0.3].map(x => [-0.12, 0.12].map(z => (
        <group key={`${x}-${z}`} position={[x, 0.15, z]}>
          <mesh castShadow><cylinderGeometry args={[0.04, 0.03, 0.3]} /><meshStandardMaterial color={color} /></mesh>
          <mesh position={[0, -0.12, 0]} castShadow><boxGeometry args={[0.05, 0.06, 0.05]} /><meshStandardMaterial color="#1e293b" /></mesh>
        </group>
      )))}
    </group>
  );
}

function AgriculturalZone({ position, textures, type = 'crops' }: { position: [number, number, number]; textures: ProceduralTextures; type?: string }) {
  // Modular rendering for a single farm plot
  const cropGeom = useMemo(() => {
    if (type === 'wheat') return new THREE.BoxGeometry(0.08, 0.4, 0.08);
    return new THREE.DodecahedronGeometry(0.12);
  }, [type]);
  
  const cropMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: type === 'wheat' ? '#eab308' : '#22c55e', 
    roughness: 0.9 
  }), [type]);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const cropRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (cropRef.current && type !== 'palms') {
      const d = dummy;
      let i = 0;
      const xStep = type === 'wheat' ? 0.2 : 0.4;
      const zStep = type === 'wheat' ? 0.2 : 0.4;
      
      for(let x = -1.5; x <= 1.5; x += xStep) {
        for(let z = -2.1; z <= 2.1; z += zStep) {
          if (i >= 400) break;
          
          d.position.set(x + (Math.random()-0.5)*0.1, 0.1, z + (Math.random()-0.5)*0.1);
          
          if (type === 'wheat') {
            d.scale.setScalar(0.8 + Math.random() * 0.5);
            d.rotation.set(0, Math.random() * Math.PI, 0);
          } else {
            d.scale.setScalar(0.8 + Math.random() * 0.4);
            d.rotation.set(Math.random(), Math.random(), Math.random());
          }
          
          d.updateMatrix();
          cropRef.current.setMatrixAt(i++, d.matrix);
        }
      }
      cropRef.current.count = i;
      cropRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [type, dummy]);

  return (
    <group position={position}>
      {/* Modular Soil Bed */}
      <mesh position={[0, 0.05, 0]} receiveShadow><boxGeometry args={[3.6, 0.1, 5.2]} /><meshStandardMaterial map={textures.darkWood} roughness={1} /></mesh>
      <mesh position={[0, 0.08, 0]} receiveShadow><boxGeometry args={[3.4, 0.1, 5]} /><meshStandardMaterial map={textures.soil} roughness={1} /></mesh>
      
      {/* Instanced Crops */}
      {type !== 'palms' && <instancedMesh ref={cropRef} args={[cropGeom, cropMat, 400]} castShadow receiveShadow />}

      {/* Palms (only for palm type) - Increased density */}
      {type === 'palms' && (
        <group position={[0, 0.1, 0]}>
          {[-1, 0, 1].map(x => [-1.5, 0, 1.5].map(z => (
            <group key={`${x}-${z}`} position={[x + (Math.random()-0.5)*0.2, 0, z + (Math.random()-0.5)*0.2]}>
              {/* Optimized Trunk */}
              <mesh position={[0, 0.4, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.08, 0.8, 6]} />
                <meshStandardMaterial color="#5c4033" roughness={1} />
              </mesh>
              {/* Optimized Fronds */}
              <group position={[0, 0.8, 0]}>
                {[0,1,2,3,4].map(i => (
                  <mesh key={i} rotation={[0, (i * Math.PI * 2) / 5, 0]} castShadow>
                    <mesh rotation={[0.8, 0, 0]} position={[0, 0.05, 0.3]}>
                      <sphereGeometry args={[0.1, 8, 4]} scale={[1, 0.2, 5]} />
                      <meshStandardMaterial color="#15803d" roughness={0.8} />
                    </mesh>
                  </mesh>
                ))}
              </group>
            </group>
          )))}
        </group>
      )}
    </group>
  );
}

function ComplexWaterTank({ position, textures, isRaining }: { position: [number, number, number]; textures: ProceduralTextures; isRaining: boolean }) {
  const waterRef = useRef<THREE.Mesh>(null);
  const rippleRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (waterRef.current) {
      waterRef.current.position.y = 0.5 + Math.sin(t * 2) * 0.015;
      waterRef.current.rotation.x = Math.sin(t * 1.5) * 0.01;
      waterRef.current.rotation.z = Math.cos(t * 1.8) * 0.01;
    }
    if (isRaining && rippleRef.current) {
      rippleRef.current.scale.setScalar(1 + (t % 1) * 0.2);
      (rippleRef.current.material as THREE.Material).opacity = 1 - (t % 1);
    }
  });

  return (
    <group position={position} scale={[1.2, 1.2, 1.2]}>
      {/* Acrylic Tank */}
      <group position={[0, 0.6, 0]}>
        <mesh position={[0, -0.6, 0]} receiveShadow><boxGeometry args={[3.2, 0.05, 3.2]} /><meshStandardMaterial color="#cbd5e1" roughness={0.1} metalness={0.8} /></mesh>
        <mesh position={[0, 0, -1.6]} castShadow><boxGeometry args={[3.2, 1.2, 0.05]} /><meshPhysicalMaterial color="#e0f2fe" transmission={0.9} opacity={1} transparent roughness={0.1} /></mesh>
        <mesh position={[0, 0, 1.6]} castShadow><boxGeometry args={[3.2, 1.2, 0.05]} /><meshPhysicalMaterial color="#e0f2fe" transmission={0.9} opacity={1} transparent roughness={0.1} /></mesh>
        <mesh position={[-1.6, 0, 0]} castShadow><boxGeometry args={[0.05, 1.2, 3.2]} /><meshPhysicalMaterial color="#e0f2fe" transmission={0.9} opacity={1} transparent roughness={0.1} /></mesh>
        <mesh position={[1.6, 0, 0]} castShadow><boxGeometry args={[0.05, 1.2, 3.2]} /><meshPhysicalMaterial color="#e0f2fe" transmission={0.9} opacity={1} transparent roughness={0.1} /></mesh>
      </group>

      {/* Dynamic Water */}
      <mesh ref={waterRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[3.1, 0.9, 3.1]} />
        <meshPhysicalMaterial color="#0284c7" transmission={0.8} opacity={0.9} transparent roughness={0.1} metalness={0.1} />
      </mesh>

      {/* Rain Ripples */}
      {isRaining && (
        <mesh ref={rippleRef} position={[0, 0.96, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color="#ffffff" transparent />
        </mesh>
      )}
      
      <WoodenSign position={[-2, 0, 2]} text="الخزان الرئيسي" textures={textures} />
    </group>
  );
}

// Real dirt road connecting the village seamlessly
function RealisticDirtRoad({ points, width = 0.4 }: { points: THREE.Vector3[], width?: number }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  return (
    <mesh position={[0, -0.02, 0]} receiveShadow scale={[1, 0.01, 1]}>
      <tubeGeometry args={[curve, 100, width, 16, false]} />
      <meshStandardMaterial color="#c0a07a" roughness={1} />
    </mesh>
  );
}

// Rain System using InstancedMesh for 60 FPS performance
function RainSystem({ isRaining }: { isRaining: boolean }) {
  const dropGeom = useMemo(() => new THREE.BoxGeometry(0.03, 0.8, 0.03), []);
  const dropMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#7dd3fc', transparent: true, opacity: 0.5 }), []);
  const dropsRef = useRef<THREE.InstancedMesh>(null);
  const count = 500;
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  // Use refs for mutable rain data — avoids React compiler "cannot modify useMemo value" error
  const speedsRef = useRef<Float32Array>(new Float32Array(0));
  const positionsRef = useRef<Float32Array>(new Float32Array(0));

  useEffect(() => {
    speedsRef.current = new Float32Array(count).map(() => 0.2 + Math.random() * 0.3);
    positionsRef.current = new Float32Array(count * 3).map((_, i) => {
      if(i%3 === 0) return (Math.random() - 0.5) * 32; // x
      if(i%3 === 1) return Math.random() * 20;          // y
      return (Math.random() - 0.5) * 20;                // z
    });
  }, []);

  useFrame(() => {
    if (!isRaining || !dropsRef.current) return;
    const positions = positionsRef.current;
    const speeds = speedsRef.current;
    for (let i = 0; i < count; i++) {
      positions[i*3 + 1] -= speeds[i];
      if (positions[i*3 + 1] < 0) positions[i*3 + 1] = 20;
      dummy.position.set(positions[i*3], positions[i*3+1], positions[i*3+2]);
      dummy.updateMatrix();
      dropsRef.current.setMatrixAt(i, dummy.matrix);
    }
    dropsRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!isRaining) return null;
  return <instancedMesh ref={dropsRef} args={[dropGeom, dropMat, count]} />;
}

// Pipe component defined at module level to avoid "cannot create components during render"
type PipeProps = {
  pos: [number, number, number];
  rot: [number, number, number];
  scaleY: number;
  geom: THREE.CylinderGeometry;
  material: THREE.MeshStandardMaterial;
};
function Pipe({ pos, rot, scaleY, geom, material }: PipeProps) {
  return <mesh position={pos} rotation={rot} scale={[1, scaleY, 1]} castShadow geometry={geom} material={material} />;
}

// Clean and thin pipe network connecting resources
function MacroPipeNetwork() {
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.3, metalness: 0.8 }), []);
  const geom = useMemo(() => new THREE.CylinderGeometry(0.025, 0.025, 1, 16), []);

  return (
    <group position={[0, -0.01, 0]}>
      {/* Tank (-12, 6) to Farm (0, 6) */}
      <Pipe pos={[-6, 0, 6.2]} rot={[0, 0, Math.PI/2]} scaleY={12} geom={geom} material={material} />
      
      {/* Tank up to Homes */}
      <Pipe pos={[-12, 0, 3]} rot={[Math.PI/2, 0, 0]} scaleY={6} geom={geom} material={material} />
      <Pipe pos={[-7, 0, 0]} rot={[0, 0, Math.PI/2]} scaleY={10} geom={geom} material={material} />
      
      {/* Connect to Home 3 and 4 */}
      <Pipe pos={[-10, 0, 0.5]} rot={[Math.PI/2, 0, 0]} scaleY={1} geom={geom} material={material} />
      <Pipe pos={[-2, 0, 1]} rot={[Math.PI/2, 0, 0]} scaleY={2} geom={geom} material={material} />
    </group>
  );
}

function HighFidelityScene({ isRaining }: { isRaining: boolean }) {
  const textures = useProceduralTextures();

  return (
    <group position={[0, -1, 0]}>
      {/* Expanded Base Board (32x20) */}
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <boxGeometry args={[32.2, 0.4, 20.2]} />
        <meshStandardMaterial map={textures.wood} roughness={1} />
      </mesh>

      {/* Main Grass Terrain */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[32, 0.05, 20]} />
        <meshStandardMaterial map={textures.grass} roughness={1} />
      </mesh>


      {/* 1. Realistic Procedural Desert Zone (Top Right Triangle) */}
      <group position={[8, 0, -2]}>
        <RealisticDunes position={[0, 0, 0]} />
        <DetailedTurbine position={[2, 0.1, -4]} />
        <DetailedTurbine position={[5, 0.1, -1]} />
        <DetailedTurbine position={[6, 0.1, -5]} />
        <WoodenSign position={[1, 0, -1]} text="الصحراء وطاقة الرياح" textures={textures} />
      </group>

      {/* Seamless Dirt Road Network */}
      <group>
        {/* Main curved spine from top center downwards to Cows/Farm */}
        <RealisticDirtRoad points={[new THREE.Vector3(-4, 0, -10), new THREE.Vector3(-4, 0, -4), new THREE.Vector3(2, 0, 0), new THREE.Vector3(8, 0, 4), new THREE.Vector3(10, 0, 8)]} width={0.6} />
        
        {/* Branch left to Homes and Water */}
        <RealisticDirtRoad points={[new THREE.Vector3(-4, 0, -4), new THREE.Vector3(-8, 0, -2), new THREE.Vector3(-10, 0, 4), new THREE.Vector3(-10, 0, 6)]} width={0.5} />
        
        {/* Connections to Homes */}
        <RealisticDirtRoad points={[new THREE.Vector3(-7, 0, -3), new THREE.Vector3(-9, 0, -5)]} />
        <RealisticDirtRoad points={[new THREE.Vector3(-4, 0, -4), new THREE.Vector3(-2, 0, -4)]} />
        <RealisticDirtRoad points={[new THREE.Vector3(-9, 0, 0), new THREE.Vector3(-10, 0, 1)]} />
        <RealisticDirtRoad points={[new THREE.Vector3(0, 0, -2), new THREE.Vector3(-1, 0, 1)]} />
        
        {/* Connection to Farm */}
        <RealisticDirtRoad points={[new THREE.Vector3(4, 0, 2), new THREE.Vector3(4, 0, 6), new THREE.Vector3(0, 0, 6)]} />

        {/* Connection to relocated Barns */}
        <RealisticDirtRoad points={[new THREE.Vector3(5, 0, 2), new THREE.Vector3(8.5, 0, 1)]} />
      </group>

      {/* 3. Residential Zone (Homes) */}
      <ResidentialHouse position={[-10, 0, -6]} rotation={[0, Math.PI/6, 0]} textures={textures} />
      <ResidentialHouse position={[-2, 0, -5]} rotation={[0, -Math.PI/8, 0]} textures={textures} />
      <ResidentialHouse position={[-10, 0, 1]} rotation={[0, Math.PI/4, 0]} textures={textures} />
      <ResidentialHouse position={[-2, 0, 2]} rotation={[0, -Math.PI/6, 0]} textures={textures} />

      {/* Interconnected Pipe Network */}
      <MacroPipeNetwork />

      {/* 4. Centralized Water Tank (Bottom Left) */}
      <ComplexWaterTank position={[-12, 0, 6]} textures={textures} isRaining={isRaining} />

      {/* 5. Separated Agricultural Zones (Bottom Middle) */}
      <AgriculturalZone position={[-4, 0, 6.5]} textures={textures} type="crops" />
      <AgriculturalZone position={[0, 0, 6.5]} textures={textures} type="palms" />
      <AgriculturalZone position={[4, 0, 6.5]} textures={textures} type="wheat" />
      
      <WoodenSign position={[-4, 0, 9.5]} text="خضروات" textures={textures} />
      <WoodenSign position={[0, 0, 9.5]} text="منطقة النخيل" textures={textures} />
      <WoodenSign position={[4, 0, 9.5]} text="حبوب" textures={textures} />

      {/* 6. Relocated Livestock Barns (Beside Desert Diagonal) */}
      <LivestockBarn position={[8.5, 0, 1]} rotation={[0, -Math.PI/4, 0]} textures={textures} />
      <LivestockBarn position={[12, 0, 4.5]} rotation={[0, -Math.PI/4, 0]} textures={textures} />
      <WoodenSign position={[6.5, 0, 1]} text="مجمع الإنتاج الحيواني" textures={textures} />

      {/* Dynamic Rain */}
      <RainSystem isRaining={isRaining} />
    </group>
  );
}

// ==========================================
// 3. Main Page Layout & UI
// ==========================================

export default function Home() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [isRaining, setIsRaining] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-16 pb-16">
      
      {/* 3D Maquette Hero Section */}
      <section className="h-[90vh] bg-gradient-to-b from-sky-100 to-white relative flex items-center justify-center overflow-hidden border-b shadow-sm">
        
        {/* Header UI */}
        <div className="absolute top-6 md:top-8 left-1/2 -translate-x-1/2 z-10 text-center px-4 pointer-events-none w-full max-w-4xl">
          <h1 className="text-[clamp(1.5rem,4vw+0.5rem,3rem)] font-extrabold text-sage drop-shadow-lg bg-white/80 px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl backdrop-blur-md inline-block border border-white/50 leading-tight">
            {t('hero.title')}
          </h1>
          <br/>
          <p className="text-[clamp(0.85rem,2vw+0.2rem,1.25rem)] mt-3 md:mt-4 text-amber-900 font-bold bg-[#e8cd87]/90 inline-block px-4 md:px-6 py-1.5 md:py-2 rounded-full backdrop-blur-md shadow-md border border-white/50 leading-tight">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Interactive Controls UI (Mobile-first Thumb Zone) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 md:bottom-8 z-20">
          <button 
            onClick={() => setIsRaining(!isRaining)}
            className={`px-6 py-3 rounded-full font-bold shadow-2xl transition-all transform hover:scale-105 border-2 text-[clamp(0.85rem,2vw,1rem)] whitespace-nowrap ${isRaining ? 'bg-sky-600 text-white border-sky-400' : 'bg-white text-sky-600 border-sky-100'}`}
          >
            {isRaining ? (isAr ? '🌧️ إيقاف الأمطار' : '🌧️ Stop Rain') : (isAr ? '☁️ محاكاة الأمطار' : '☁️ Simulate Rain')}
          </button>
        </div>
        
        {/* React Three Fiber Canvas */}
        <div className={`w-full h-full cursor-grab active:cursor-grabbing transition-colors duration-1000 ${isRaining ? 'bg-slate-300' : 'bg-[#f0f9ff]'}`}>
          <Canvas shadows dpr={[1, 2]} camera={{ position: [-5, 18, 30], fov: 40 }}>
            <Suspense fallback={<CanvasLoader />}>
            {/* Atmospheric Depth */}
            <fog attach="fog" args={[isRaining ? '#94a3b8' : '#e0f2fe', 30, 80]} />
            <color attach="background" args={[isRaining ? '#94a3b8' : '#e0f2fe']} />
            
            {/* Cinematic Lighting Setup */}
            <ambientLight intensity={isRaining ? 0.2 : 0.35} color={isRaining ? '#94a3b8' : '#fff1f2'} />
            
            {/* Key Light: Low Angle Golden Hour Sun */}
            <directionalLight 
              castShadow 
              position={[25, 15, 15]} 
              intensity={isRaining ? 0.3 : 3.5} 
              color={isRaining ? '#cbd5e1' : '#fef08a'}
              shadow-mapSize={[4096, 4096]}
              shadow-camera-left={-25}
              shadow-camera-right={25}
              shadow-camera-top={25}
              shadow-camera-bottom={-25}
              shadow-bias={-0.0005}
            />
            
            {/* Fill Light: Soft Cool Sky Reflection */}
            <directionalLight position={[-15, 15, -15]} intensity={isRaining ? 0.2 : 1.0} color="#bae6fd" />
            
            {/* Rim Light: Dramatic Backlight */}
            <directionalLight position={[-5, 5, -25]} intensity={isRaining ? 0 : 1.5} color="#e0e7ff" />

            <hemisphereLight args={['#e0f2fe', '#064e3b', isRaining ? 0.2 : 0.5]} />
            
            <Environment preset={isRaining ? "night" : "sunset"} />
            
            {/* Ground Ambient Occlusion (Contact Shadows) - Only ONE instance to prevent WebGL crash */}
            {!isRaining && <ContactShadows position={[0, -0.01, 0]} resolution={512} scale={50} blur={2} opacity={0.6} far={10} color="#064e3b" />}
            
            <OrbitControls 
              autoRotate={!isRaining} 
              autoRotateSpeed={0.2} 
              maxPolarAngle={Math.PI / 2.1} 
              minDistance={15} 
              maxDistance={50}
              target={[0, -1, 0]}
              enableDamping
              dampingFactor={0.05}
            />
            
            <HighFidelityScene isRaining={isRaining} />
            </Suspense>
          </Canvas>
        </div>

        {/* Map Legend UI */}
        <div className="absolute bottom-8 left-8 hidden lg:block bg-white/90 p-5 rounded-2xl shadow-xl backdrop-blur-md text-sm pointer-events-none border border-sky-100 z-10">
          <h4 className="font-bold text-sage mb-3 text-lg border-b pb-1">{isAr ? 'مفتاح الخريطة' : 'Map Legend'}</h4>
          <ul className="space-y-3 font-bold text-gray-700">
            <li className="flex items-center gap-3"><span className="w-4 h-4 bg-[#1e40af] rounded-md shadow-sm"></span> {isAr ? 'المنطقة السكنية (طاقة شمسية)' : 'Residential (Solar)'}</li>
            <li className="flex items-center gap-3"><span className="w-4 h-4 bg-[#fcd34d] rounded-md shadow-sm"></span> {isAr ? 'منطقة الصحراء (طاقة الرياح)' : 'Desert (Wind Energy)'}</li>
            <li className="flex items-center gap-3"><span className="w-4 h-4 bg-[#38bdf8] rounded-md shadow-sm"></span> {isAr ? 'خزان تجميع المياه' : 'Water Harvesting Tank'}</li>
            <li className="flex items-center gap-3"><span className="w-4 h-4 bg-[#15803d] rounded-md shadow-sm"></span> {isAr ? 'الزراعة المستدامة (نخيل وخضروات)' : 'Sustainable Agriculture'}</li>
            <li className="flex items-center gap-3"><span className="w-4 h-4 bg-[#b48c66] rounded-md shadow-sm"></span> {isAr ? 'الإنتاج الحيواني (حظائر)' : 'Animal Production'}</li>
          </ul>
        </div>

        {/* Scroll Down Button */}
        <motion.button
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          initial={{ opacity: 0, x: "-50%" }}
          animate={{ opacity: 1, y: [0, 15, 0], scale: [1, 1.05, 1], x: "-50%" }}
          transition={{ delay: 1, duration: 1.5, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 z-30 bg-sage/80 hover:bg-sage backdrop-blur-md text-white rounded-full p-4 border-2 border-white/40 transition-all shadow-2xl flex items-center justify-center cursor-pointer"
        >
          <ChevronDown size={48} strokeWidth={2.5} />
        </motion.button>
      </section>

      {/* ♻️ Circular Ecosystem Section */}
      <section className="container mx-auto px-4 text-center py-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-sage mb-2">
          {isAr ? 'النظام البيئي الدائري' : 'The Circular Ecosystem'}
        </h2>
        <p className="text-base text-gray-500 font-semibold mb-6">
          {isAr ? 'صفر هدر، استخدام كامل' : 'Zero Waste, Total Utilization'}
        </p>

        <div className="relative w-full max-w-md mx-auto aspect-square">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="120" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="6 5" opacity="0.6" />
            <path d="M 270 88 Q 325 125 325 195" fill="none" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#aB2)" />
            <text x="315" y="140" fontSize="9" fill="#3b82f6" fontWeight="700" textAnchor="middle" transform="rotate(22,315,140)">{isAr ? 'تشغّل...' : 'Power the...'}</text>
            <path d="M 320 220 Q 305 295 250 325" fill="none" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#aB2)" />
            <text x="320" y="275" fontSize="9" fill="#3b82f6" fontWeight="700" textAnchor="middle" transform="rotate(50,320,275)">{isAr ? 'تروي...' : 'Irrigate...'}</text>
            <path d="M 215 340 Q 175 350 140 325" fill="none" stroke="#4d7c0f" strokeWidth="2" markerEnd="url(#aG2)" />
            <text x="178" y="360" fontSize="9" fill="#4d7c0f" fontWeight="700" textAnchor="middle">{isAr ? 'تنتج...' : 'Produce...'}</text>
            <path d="M 85 295 Q 60 240 78 180" fill="none" stroke="#4d7c0f" strokeWidth="2" markerEnd="url(#aG2)" />
            <text x="48" y="240" fontSize="9" fill="#4d7c0f" fontWeight="700" textAnchor="middle" transform="rotate(-55,48,240)">{isAr ? 'يُهضم...' : 'Digest...'}</text>
            <path d="M 95 140 Q 115 95 160 78" fill="none" stroke="#b45309" strokeWidth="2" markerEnd="url(#aBr2)" />
            <text x="110" y="95" fontSize="9" fill="#b45309" fontWeight="700" textAnchor="middle">{isAr ? 'حرارة+سماد' : 'Heat+Fert.'}</text>
            <path d="M 190 68 Q 210 95 240 78" fill="none" stroke="#b45309" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#aBr2)" />
            <text x="215" y="100" fontSize="8" fill="#b45309" fontWeight="600" textAnchor="middle">{isAr ? 'يغذي ↺' : 'Nourish ↺'}</text>
            <defs>
              <marker id="aB2" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#3b82f6"/></marker>
              <marker id="aG2" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#4d7c0f"/></marker>
              <marker id="aBr2" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#b45309"/></marker>
            </defs>
          </svg>

          <motion.div whileHover={{ scale: 1.15 }} className="absolute flex flex-col items-center cursor-pointer z-10" style={{ top: '2%', left: '50%', transform: 'translateX(-50%)' }}>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 border-[3px] border-amber-400 shadow-lg flex items-center justify-center text-2xl">☀️</div>
            <span className="mt-0.5 text-[10px] font-extrabold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">{isAr ? '1. طاقة متجددة' : '1. Renewables'}</span>
          </motion.div>

          <motion.div whileHover={{ scale: 1.15 }} className="absolute flex flex-col items-center cursor-pointer z-10" style={{ top: '37%', right: '0%' }}>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border-[3px] border-blue-400 shadow-lg flex items-center justify-center text-2xl">💧</div>
            <span className="mt-0.5 text-[10px] font-extrabold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">{isAr ? '2. مضخات مياه' : '2. Water Pumps'}</span>
          </motion.div>

          <motion.div whileHover={{ scale: 1.15 }} className="absolute flex flex-col items-center cursor-pointer z-10" style={{ bottom: '5%', right: '14%' }}>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-50 to-green-100 border-[3px] border-green-500 shadow-lg flex items-center justify-center text-lg gap-0.5">🌱🐄</div>
            <span className="mt-0.5 text-[10px] font-extrabold text-green-800 bg-green-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">{isAr ? '3. محاصيل وماشية' : '3. Crops & Livestock'}</span>
          </motion.div>

          <motion.div whileHover={{ scale: 1.15 }} className="absolute flex flex-col items-center cursor-pointer z-10" style={{ bottom: '5%', left: '14%' }}>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-lime-50 to-lime-100 border-[3px] border-lime-600 shadow-lg flex items-center justify-center text-2xl">💩</div>
            <span className="mt-0.5 text-[10px] font-extrabold text-lime-800 bg-lime-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">{isAr ? '4. فضلات عضوية' : '4. Organic Waste'}</span>
          </motion.div>

          <motion.div whileHover={{ scale: 1.15 }} className="absolute flex flex-col items-center cursor-pointer z-10" style={{ top: '37%', left: '0%' }}>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-50 to-orange-100 border-[3px] border-orange-400 shadow-lg flex items-center justify-center text-2xl">🔥</div>
            <span className="mt-0.5 text-[10px] font-extrabold text-orange-800 bg-orange-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">{isAr ? '5. بيوجاز' : '5. Biogas'}</span>
          </motion.div>

          <motion.div whileHover={{ scale: 1.15 }} className="absolute flex flex-col items-center cursor-pointer z-10" style={{ top: '2%', left: '12%' }}>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 border-[3px] border-emerald-500 shadow-lg flex items-center justify-center text-2xl">🌿</div>
            <span className="mt-0.5 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">{isAr ? '6. سماد طبيعي' : '6. Fertilizer'}</span>
          </motion.div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <span className="text-4xl">♻️</span>
            <p className="text-xs font-bold text-gray-400 mt-0.5">{isAr ? 'دورة مغلقة' : 'Closed Loop'}</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="max-w-2xl mx-auto mt-6 bg-gradient-to-r from-sage/10 via-white to-sage/10 border-2 border-sage/30 rounded-2xl px-5 py-4 shadow-md">
          <p className="text-base md:text-lg font-bold text-sage leading-relaxed">
            {isAr ? '💡 الخلاصة: كل مخرج في هذا النموذج يُعد مدخلاً حيوياً لمنطقة أخرى.' : '💡 Core Takeaway: Every single output in this model serves as a vital input for another zone.'}
          </p>
        </motion.div>
      </section>

      {/* 👥 Team Section */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-sage mb-2">{t('team.title')}</h2>
          <p className="text-xl font-semibold text-gray-700 bg-sand/20 inline-block px-6 py-2 rounded-full">
            {isAr ? supervisor.titleAr : supervisor.titleEn}: <span className="text-sage">{isAr ? supervisor.nameAr : supervisor.nameEn}</span>
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {teamMembers.map((member) => (
            <motion.div 
              whileHover={{ y: -10, scale: 1.05 }}
              key={member.id} 
              className="bg-white rounded-2xl p-4 shadow-lg border-b-4 border-sage flex flex-col items-center justify-center text-center relative group cursor-pointer hover:z-50"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-sage to-skyBlue rounded-full flex items-center justify-center text-white text-lg font-extrabold mb-3 shadow-inner">
                {member.id.slice(-2)}
              </div>
              <h3 className="text-md font-bold text-gray-800 leading-tight mb-1">
                {isAr ? member.nameAr : member.nameEn}
              </h3>
              <p className="text-xs text-skyBlue font-bold mb-2">
                {isAr ? member.roleAr : member.roleEn}
              </p>
              <p className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-md tracking-wider">
                ID: {member.id}
              </p>

              {/* Tooltip for long descriptions */}
              {((member as { descAr?: string; descEn?: string }).descAr || (member as { descAr?: string; descEn?: string }).descEn) && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-60 bg-slate-800 text-white text-xs p-3 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none shadow-2xl leading-relaxed z-[100]">
                  {isAr ? (member as { descAr?: string; descEn?: string }).descAr : (member as { descAr?: string; descEn?: string }).descEn}
                  {/* Tooltip Arrow */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
