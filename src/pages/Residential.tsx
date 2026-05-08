import React, { useRef, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { CanvasLoader } from '../components/CanvasLoader';
import * as THREE from 'three';

// --- 3D Components ---

function WoodenSign({ position, text }: { position: [number, number, number]; text: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.04, 0.8, 0.04]} />
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

// Low-poly tree for aesthetics
function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.1, 0.6, 0.1]} />
        <meshStandardMaterial color="#5c4033" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.4, 5, 4]} />
        <meshStandardMaterial color="#2d5a27" roughness={0.8} flatShading />
      </mesh>
    </group>
  );
}

function Fence({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Rails */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[1.8, 0.04, 0.02]} />
        <meshStandardMaterial color="#bba58d" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.8, 0.04, 0.02]} />
        <meshStandardMaterial color="#bba58d" roughness={0.9} />
      </mesh>
      {/* Posts */}
      {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0.2, 0]} castShadow>
          <boxGeometry args={[0.06, 0.4, 0.06]} />
          <meshStandardMaterial color="#a08c75" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function House({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const solarRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (solarRef.current) {
      // Subtle pulse to indicate active solar energy generation
      (solarRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2 + Math.sin(clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Wooden Base */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[2.6, 0.1, 2.4]} />
        <meshStandardMaterial color="#e5c07b" roughness={0.9} />
      </mesh>
      {/* Walls */}
      <mesh position={[0, 0.7, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[2, 1.2, 1.8]} />
        <meshStandardMaterial color="#d4a373" roughness={1} />
      </mesh>
      
      {/* Realistic Slanted Roof (Shed Roof) matching solar angle */}
      <mesh position={[0, 1.45, 0.05]} rotation={[-Math.PI / 7, 0, 0]} castShadow>
        <boxGeometry args={[2.2, 0.1, 2.3]} />
        <meshStandardMaterial color="#8a6d4b" roughness={0.9} />
      </mesh>
      {/* Side walls filling the triangle under the roof */}
      <mesh position={[-0.95, 1.35, 0.4]} rotation={[-Math.PI / 7, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 0.4, 1.6]} />
        <meshStandardMaterial color="#d4a373" roughness={1} />
      </mesh>
      <mesh position={[0.95, 1.35, 0.4]} rotation={[-Math.PI / 7, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 0.4, 1.6]} />
        <meshStandardMaterial color="#d4a373" roughness={1} />
      </mesh>

      {/* Optimized Solar Panel sitting perfectly on the roof */}
      <group position={[0, 1.55, 0.25]} rotation={[-Math.PI / 7, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.8, 1.2, 0.05]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh ref={solarRef} position={[0, 0, 0.03]}>
          <planeGeometry args={[1.7, 1.1]} />
          <meshStandardMaterial color="#3b82f6" emissive="#2563eb" emissiveIntensity={0.2} />
        </mesh>
        {/* Simple Grid Lines (No Wireframe Pass) */}
        <group position={[0, 0, 0.035]}>
           {[-0.5, 0, 0.5].map((x) => (
             <mesh key={`v-${x}`} position={[x, 0, 0]}>
               <boxGeometry args={[0.02, 1.1, 0.01]} />
               <meshBasicMaterial color="#93c5fd" />
             </mesh>
           ))}
           {[-0.3, 0.3].map((y) => (
             <mesh key={`h-${y}`} position={[0, y, 0]}>
               <boxGeometry args={[1.7, 0.02, 0.01]} />
               <meshBasicMaterial color="#93c5fd" />
             </mesh>
           ))}
        </group>
      </group>

      {/* Door */}
      <mesh position={[0, 0.45, 0.81]} castShadow>
        <boxGeometry args={[0.45, 0.75, 0.02]} />
        <meshStandardMaterial color="#5c4033" roughness={0.9} />
      </mesh>
      {/* Windows */}
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={i} position={[x, 0.75, 0.81]} castShadow>
          <boxGeometry args={[0.35, 0.35, 0.02]} />
          <meshStandardMaterial color="#bae6fd" metalness={0.5} roughness={0.1} />
        </mesh>
      ))}

      {/* Rain Barrel (Box geometry for performance) */}
      <mesh position={[1.1, 0.35, 0.8]} castShadow>
        <boxGeometry args={[0.4, 0.6, 0.4]} />
        <meshStandardMaterial color="#64748b" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Biogas reactor small (Low Poly) */}
      <group position={[-1.3, 0, -0.5]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.3, 0.6, 6]} />
          <meshStandardMaterial color="#374151" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.6, 0]} castShadow>
          <sphereGeometry args={[0.25, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#4b5563" metalness={0.3} flatShading />
        </mesh>
      </group>
    </group>
  );
}


// Optimized Electric Line
function ElectricLine({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const distance = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const midX = (from[0] + to[0]) / 2;
  const midY = (from[1] + to[1]) / 2;
  const midZ = (from[2] + to[2]) / 2;
  
  const meshRef = useRef<THREE.Mesh>(null);
  
  React.useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(midX, midY, midZ);
      meshRef.current.lookAt(to[0], to[1], to[2]);
    }
  }, [from, to, midX, midY, midZ]);

  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[0.04, 0.04, distance]} />
      <meshStandardMaterial color="#fbbf24" metalness={0.5} roughness={0.4} />
    </mesh>
  );
}

function ResidentialScene() {
  return (
    <group position={[0, -1.2, 0]}>
      {/* Base Ground */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[20, 0.1, 16]} />
        <meshStandardMaterial color="#d4c3a3" roughness={1} />
      </mesh>
      
      {/* Grass Areas */}
      <mesh position={[-4, 0.01, -3]} receiveShadow>
        <boxGeometry args={[9, 0.05, 7]} />
        <meshStandardMaterial color="#3a6b2c" roughness={0.9} />
      </mesh>
      <mesh position={[4, 0.01, -3]} receiveShadow>
        <boxGeometry args={[7, 0.05, 7]} />
        <meshStandardMaterial color="#3a6b2c" roughness={0.9} />
      </mesh>
      <mesh position={[-4, 0.01, 3.5]} receiveShadow>
        <boxGeometry args={[9, 0.05, 4.5]} />
        <meshStandardMaterial color="#3a6b2c" roughness={0.9} />
      </mesh>
      <mesh position={[4, 0.01, 3.5]} receiveShadow>
        <boxGeometry args={[7, 0.05, 4.5]} />
        <meshStandardMaterial color="#3a6b2c" roughness={0.9} />
      </mesh>

      {/* Pathways */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[1.5, 0.05, 14]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[16, 0.05, 1.5]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
      </mesh>

      {/* Houses */}
      <House position={[-4, 0, -3]} />
      <House position={[4, 0, -3]} rotation={[0, Math.PI, 0]} />
      <House position={[-4, 0, 3]} />
      <House position={[4, 0, 3]} rotation={[0, Math.PI, 0]} />

      {/* Fences for Houses */}
      <Fence position={[-4, 0, -1.5]} />
      <Fence position={[4, 0, -1.5]} />
      <Fence position={[-4, 0, 1.5]} />
      <Fence position={[4, 0, 1.5]} />

      {/* Trees */}
      <Tree position={[-7, 0, -5]} scale={1.2} />
      <Tree position={[-2, 0, -6]} scale={0.9} />
      <Tree position={[7, 0, -5]} scale={1.1} />
      <Tree position={[2, 0, -5.5]} scale={1} />
      <Tree position={[-6.5, 0, 4.5]} scale={1.3} />
      <Tree position={[6.5, 0, 4.5]} scale={1} />

      {/* Water Tank */}
      <group position={[8, 0, 0]}>
        {/* Concrete Base */}
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <boxGeometry args={[2.4, 0.2, 2.4]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.8} />
        </mesh>
        {/* Transparent Tank */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[2, 1.4, 2]} />
          <meshStandardMaterial color="#bae6fd" transparent opacity={0.25} metalness={0.8} roughness={0.1} />
        </mesh>
        {/* Water Inside */}
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[1.95, 0.9, 1.95]} />
          <meshStandardMaterial color="#0284c7" transparent opacity={0.8} />
        </mesh>
        <WoodenSign position={[-1.2, 0, 1.2]} text="خزان مياه الأمطار" />
      </group>



      {/* Electric lines from solar panels */}
      <ElectricLine from={[-4, 1.65, -2.65]} to={[0, 1.8, 0]} />
      <ElectricLine from={[4, 1.65, -3.35]} to={[0, 1.8, 0]} />
      <ElectricLine from={[-4, 1.65, 3.35]} to={[0, 1.8, 0]} />
      <ElectricLine from={[4, 1.65, 2.65]} to={[0, 1.8, 0]} />

      {/* Central junction box (Hub) */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.8, 6]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Labels */}
      <WoodenSign position={[-4, 0, 5]} text="منطقة سكنية + طاقة شمسية" />
    </group>
  );
}

const stats = [
  { en: 'Solar Panels', ar: 'لوح طاقة شمسية', value: '4', icon: '☀️' },
  { en: 'kWh/Day Produced', ar: 'كيلوواط/يوم', value: '40', icon: '⚡' },
  { en: 'Homes Connected', ar: 'منزل متصل', value: '4', icon: '🏠' },
  { en: 'H₂ Energy Yield', ar: 'طاقة هيدروجين', value: '25%', icon: '🔬' },
];

const features = [
  {
    icon: '🏡',
    titleAr: 'المنازل ذات الأسقف المائلة',
    titleEn: 'Sloped-Roof Houses',
    descAr: 'أربعة منازل خشبية مصممة بأسقف مائلة تُثبت عليها الألواح الشمسية لزيادة كفاءة التقاط الطاقة.',
    descEn: 'Four wooden houses with sloped roofs supporting solar panels optimized for maximum energy capture.',
  },
  {
    icon: '☀️',
    titleAr: 'الألواح الشمسية الزرقاء',
    titleEn: 'Blue Solar Panels',
    descAr: 'ألواح شمسية متطورة مثبتة على كل سطح بزاوية مثالية لإنتاج الطاقة الكهربائية الكافية للقرية.',
    descEn: 'Advanced solar panels mounted at optimal angles on every rooftop to generate sufficient electricity.',
  },
  {
    icon: '💧',
    titleAr: 'أنابيب تجميع الأمطار',
    titleEn: 'Rain Collection Pipes',
    descAr: 'شبكة أنابيب رمادية تمتد على الجدران لتجميع مياه الأمطار وإرسالها لخزانات التخزين.',
    descEn: 'Gray pipe network along walls to collect rainwater and send it to storage tanks.',
  },
  {
    icon: '🔬',
    titleAr: 'مفاعلات البيوجاز',
    titleEn: 'Biogas Reactors',
    descAr: 'مفاعلات صغيرة بجانب كل منزل تحول الفضلات العضوية إلى غاز هيدروجين نظيف وسماد.',
    descEn: 'Small reactors beside each house converting organic waste into clean hydrogen gas and compost.',
  },
];

export default function Residential() {
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
      <section className="relative h-[80vh] bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-transparent to-blue-900/40 z-10 pointer-events-none" />

        <div className="w-full h-full">
          <Canvas 
            shadows 
            camera={{ position: [0, 12, 18], fov: 40 }}
            dpr={[1, 1.5]} 
            gl={{ powerPreference: 'high-performance', antialias: false }}
          >
            <Suspense fallback={<CanvasLoader />}>
            <color attach="background" args={['#0f172a']} />
            <fog attach="fog" args={['#0f172a', 15, 40]} />
            
            <ambientLight intensity={0.6} />
            <hemisphereLight intensity={0.4} color="#bae6fd" groundColor="#3a6b2c" />
            <directionalLight 
              castShadow 
              position={[8, 15, 8]} 
              intensity={2.2} 
              shadow-mapSize={[512, 512]} 
              shadow-camera-near={1}
              shadow-camera-far={40}
              shadow-camera-left={-12}
              shadow-camera-right={12}
              shadow-camera-top={12}
              shadow-camera-bottom={-12}
            />
            <pointLight position={[0, 4, 0]} color="#fbbf24" intensity={1.5} distance={15} />
            
            <OrbitControls 
              autoRotate 
              autoRotateSpeed={0.3} 
              maxPolarAngle={Math.PI / 2.3} 
              minDistance={8} 
              maxDistance={30} 
              target={[0, -1, 0]} 
            />
            <ResidentialScene />
            <ContactShadows position={[0, -1.25, 0]} opacity={0.5} scale={18} blur={1.5} far={4} color="#020617" />
            </Suspense>
          </Canvas>
        </div>

        <div className="absolute top-6 md:top-10 left-1/2 -translate-x-1/2 z-20 text-center px-4 pointer-events-none w-full max-w-4xl">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <h1 className="text-[clamp(1.25rem,4vw+0.5rem,3rem)] font-extrabold text-white drop-shadow-2xl bg-blue-900/60 px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl backdrop-blur-sm border border-white/20 inline-block leading-tight">
              {isAr ? '🏡 المنطقة السكنية والطاقة الشمسية' : '🏡 Residential & Solar Energy Zone'}
            </h1>
            <p className="text-white/90 text-[clamp(0.75rem,2vw+0.25rem,1.125rem)] mt-3 md:mt-4 font-semibold bg-black/40 px-4 md:px-6 py-1.5 md:py-2 rounded-full backdrop-blur-md inline-block">
              {isAr ? 'طاقة شمسية • بيوجاز • حصاد مياه • هيدروجين نظيف' : 'Solar Energy • Biogas • Water Harvesting • Clean Hydrogen'}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-24 md:bottom-6 left-1/2 md:left-6 -translate-x-1/2 md:translate-x-0 z-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-3 md:p-4 pointer-events-none w-[90%] sm:w-auto flex flex-col items-center md:items-start shadow-xl">
          <p className="text-white/90 text-[clamp(0.7rem,2vw,0.8rem)] font-bold mb-2 text-center md:text-left">{isAr ? 'أسحب لاستكشاف النموذج' : 'Drag to explore the model'}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
            {[{c:'#1e3a8a',l:isAr?'ألواح شمسية':'Solar'},{c:'#fbbf24',l:isAr?'كهرباء':'Electric'}].map(x=>(
              <span key={x.l} className="flex items-center gap-1 text-white text-[clamp(0.65rem,1.5vw,0.75rem)] bg-black/20 px-2 py-0.5 rounded-full"><span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border border-white/30" style={{background:x.c}}/>{x.l}</span>
            ))}
          </div>
        </div>

        {/* Scroll Down Button */}
        <motion.button
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 15, 0], scale: [1, 1.05, 1] }}
          transition={{ delay: 1, duration: 1.5, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-blue-600/80 hover:bg-blue-600 backdrop-blur-md text-white rounded-full p-4 border-2 border-white/40 transition-all shadow-2xl flex items-center justify-center cursor-pointer"
        >
          <ChevronDown size={48} strokeWidth={2.5} />
        </motion.button>
      </section>

      {/* Stats */}
      <section className="bg-blue-800 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 * i }} className="text-center text-white">
                <div className="text-4xl mb-1">{s.icon}</div>
                <div className="text-3xl font-black text-blue-300">{s.value}</div>
                <div className="text-sm text-blue-200 font-semibold">{isAr ? s.ar : s.en}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-blue-800 mb-3">
            {isAr ? '⚡ مكونات المنطقة السكنية' : '⚡ Residential Zone Components'}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            {isAr
              ? 'تجسد هذه المنطقة المساكن والخلايا الشمسية المستخدمة في إنتاج الطاقة للمدينة، والتي تشغّل المضخات والمفاعلات لتحويل الفضلات إلى طاقة هيدروجين نظيفة.'
              : 'This zone features homes and solar cells producing energy for the village, powering pumps and reactors that convert waste into clean hydrogen energy.'}
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
              className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-blue-400 hover:shadow-2xl transition-all"
            >
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-blue-800 mb-2">{isAr ? f.titleAr : f.titleEn}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{isAr ? f.descAr : f.descEn}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Energy Flow */}
      <section className="bg-gradient-to-r from-blue-50 to-sky-50 border-y border-blue-200 py-12">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-blue-800 text-center mb-8">
            {isAr ? '⚡ تدفق الطاقة الشمسية' : '⚡ Solar Energy Flow'}
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {[
              { icon: '☀️', label: isAr ? 'أشعة الشمس' : 'Sunlight' },
              { icon: '🔆', label: isAr ? 'الألواح الشمسية' : 'Solar Panels' },
              { icon: '⚡', label: isAr ? 'كهرباء نظيفة' : 'Clean Electricity' },
              { icon: '💧', label: isAr ? 'مضخات المياه' : 'Water Pumps' },
              { icon: '🔬', label: isAr ? 'مفاعلات البيوجاز' : 'Biogas Reactors' },
              { icon: '🌿', label: isAr ? 'سماد + هيدروجين' : 'Compost + H₂' },
            ].map((item, i, arr) => (
              <React.Fragment key={i}>
                <motion.div whileHover={{ scale: 1.1 }} className="flex flex-col items-center bg-white rounded-2xl px-5 py-4 shadow-md border border-blue-100">
                  <span className="text-3xl mb-1">{item.icon}</span>
                  <span className="text-blue-700 font-bold text-sm">{item.label}</span>
                </motion.div>
                {i < arr.length - 1 && <span className="text-blue-400 text-2xl font-bold">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
      {/* Educational & Future Prospects Section */}
      <section className="container mx-auto px-4 py-12 mb-8">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-blue-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">🌍</span>
              {isAr ? 'الرؤية البيئية والآفاق المستقبلية' : 'Environmental Vision & Future Prospects'}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🌱</span>
                  {isAr ? 'المفاهيم البيئية المطبقة' : 'Applied Environmental Concepts'}
                </h3>
                <p className="text-gray-700 leading-relaxed text-[clamp(0.9rem,2vw,1.05rem)] text-justify">
                  {isAr 
                    ? 'تعتمد هذه المنازل على مفهوم "صافي الطاقة الصفرية" (Net-Zero Energy)، حيث تُنتج طاقة نظيفة تعادل ما تستهلكه. تعزز الألواح الشمسية المدمجة في الأسطح (BIPV) والعزل الحراري المتقدم من كفاءة الاستهلاك وتقلل البصمة الكربونية للأسرة إلى أدنى حد ممكن.' 
                    : 'These houses are designed around the "Net-Zero Energy" concept, producing as much clean energy as they consume. Building-Integrated Photovoltaics (BIPV) and advanced thermal insulation maximize efficiency and minimize the household\'s carbon footprint.'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 text-white shadow-lg transform hover:-translate-y-1 transition-transform">
                <h3 className="text-xl font-bold text-blue-300 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  {isAr ? 'الآفاق والتطوير المستقبلي' : 'Future Prospects & Development'}
                </h3>
                <p className="text-gray-300 leading-relaxed text-[clamp(0.9rem,2vw,1.05rem)] text-justify">
                  {isAr 
                    ? 'نهدف مستقبلاً إلى تحويل هذه المنازل إلى "شبكات ذكية دقيقة" (Microgrids) مترابطة، قادرة على تبادل الطاقة الفائضة مع الجيران آلياً عبر تقنيات البلوك تشين، وإدارة استهلاك الأجهزة المنزلية ذاتياً باستخدام أنظمة الذكاء الاصطناعي (AI) لترشيد الاستهلاك وقت الذروة.' 
                    : 'In the future, we aim to transform these homes into interconnected "Smart Microgrids". They will be capable of peer-to-peer energy trading via blockchain, with AI autonomously optimizing daily appliance usage to reduce peak-time energy consumption.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
