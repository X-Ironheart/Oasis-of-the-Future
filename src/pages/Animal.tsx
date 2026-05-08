import React, { useRef, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { CanvasLoader } from '../components/CanvasLoader';

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

function Cow({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Body */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.7, 0.45, 0.35]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>
      {/* Black patches */}
      <mesh position={[0.1, 0.55, 0.18]} castShadow>
        <boxGeometry args={[0.25, 0.2, 0.05]} />
        <meshStandardMaterial color="#1c1917" roughness={0.9} />
      </mesh>
      {/* Head */}
      <mesh position={[0.42, 0.48, 0]} castShadow>
        <boxGeometry args={[0.35, 0.3, 0.28]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>
      {/* Snout */}
      <mesh position={[0.62, 0.43, 0]} castShadow>
        <boxGeometry args={[0.12, 0.14, 0.22]} />
        <meshStandardMaterial color="#fca5a5" roughness={0.9} />
      </mesh>
      {/* Ears */}
      <mesh position={[0.42, 0.64, 0.17]} castShadow>
        <boxGeometry args={[0.1, 0.08, 0.06]} />
        <meshStandardMaterial color="#fca5a5" roughness={0.9} />
      </mesh>
      <mesh position={[0.42, 0.64, -0.17]} castShadow>
        <boxGeometry args={[0.1, 0.08, 0.06]} />
        <meshStandardMaterial color="#fca5a5" roughness={0.9} />
      </mesh>
      {/* Legs */}
      {[[-0.22, -0.16], [-0.22, 0.16], [0.22, -0.16], [0.22, 0.16]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.1, z]} castShadow>
          <boxGeometry args={[0.1, 0.28, 0.1]} />
          <meshStandardMaterial color="#e7e5e4" roughness={0.9} />
        </mesh>
      ))}
      {/* Tail */}
      <mesh position={[-0.42, 0.45, 0]} rotation={[0, 0, 0.5]} castShadow>
        <cylinderGeometry args={[0.02, 0.01, 0.4]} />
        <meshStandardMaterial color="#1c1917" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Sheep({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Fluffy body */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color="#f9fafb" roughness={1} />
      </mesh>
      {/* Head */}
      <mesh position={[0.32, 0.38, 0]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.9} />
      </mesh>
      {/* Legs */}
      {[[-0.15, -0.12], [-0.15, 0.12], [0.15, -0.12], [0.15, 0.12]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.08, z]} castShadow>
          <boxGeometry args={[0.07, 0.2, 0.07]} />
          <meshStandardMaterial color="#d6d3d1" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function BiodigesterReactor({ position }: { position: [number, number, number] }) {
  const gasRef = useRef<any>(null);
  useFrame(({ clock }) => {
    if (gasRef.current) {
      gasRef.current.scale.y = 1 + Math.sin(clock.elapsedTime * 1.5) * 0.1;
    }
  });
  return (
    <group position={position}>
      {/* Main digester dome */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.4, 1, 16]} />
        <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[1.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4b5563" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Gas outlet pipe */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.6} />
      </mesh>
      {/* Gas bubble */}
      <mesh ref={gasRef} position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" transparent opacity={0.6} />
      </mesh>
      {/* Waste input pipe */}
      <mesh position={[1.2, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.8]} />
        <meshStandardMaterial color="#92400e" metalness={0.3} />
      </mesh>
      {/* Compost output */}
      <mesh position={[-1.2, 0.15, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.8]} />
        <meshStandardMaterial color="#4b7c13" metalness={0.3} />
      </mesh>
      <WoodenSign position={[0, 0, 1.8]} text="مفاعل بيوجاز" />
    </group>
  );
}

function WaterTrough({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[1.2, 0.25, 0.5]} />
        <meshStandardMaterial color="#b48c66" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[1.1, 0.1, 0.4]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function AnimalZoneScene() {
  return (
    <group position={[0, -1.2, 0]}>
      {/* Ground */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[18, 0.1, 14]} />
        <meshStandardMaterial color="#d97706" roughness={1} />
      </mesh>
      {/* Hay/straw ground */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[10, 0.05, 8]} />
        <meshStandardMaterial color="#fbbf24" roughness={1} />
      </mesh>

      {/* Barn Structure */}
      {/* Wooden base */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[7, 0.15, 5]} />
        <meshStandardMaterial color="#e5c07b" roughness={0.9} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 1, -2.4]} castShadow>
        <boxGeometry args={[7, 2, 0.15]} />
        <meshStandardMaterial color="#b48c66" roughness={1} />
      </mesh>
      {/* Side walls */}
      <mesh position={[-3.4, 1, 0]} castShadow>
        <boxGeometry args={[0.15, 2, 5]} />
        <meshStandardMaterial color="#b48c66" roughness={1} />
      </mesh>
      <mesh position={[3.4, 1, 0]} castShadow>
        <boxGeometry args={[0.15, 2, 5]} />
        <meshStandardMaterial color="#b48c66" roughness={1} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 2.2, -0.3]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[7.4, 0.15, 5.5]} />
        <meshStandardMaterial color="#d97706" roughness={0.9} />
      </mesh>

      {/* Front Fence */}
      {[-2.8, -2.1, -1.4, -0.7, 0, 0.7, 1.4, 2.1, 2.8].map((x) => (
        <mesh key={x} position={[x, 0.6, 2.4]} castShadow>
          <boxGeometry args={[0.06, 1, 0.06]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 0.9, 2.4]} castShadow>
        <boxGeometry args={[5.8, 0.07, 0.06]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.55, 2.4]} castShadow>
        <boxGeometry args={[5.8, 0.07, 0.06]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>

      {/* Animals */}
      <Cow position={[-1.5, 0.15, 0]} rotation={0.3} />
      <Cow position={[0.5, 0.15, -0.5]} rotation={-0.5} />
      <Sheep position={[-0.5, 0.18, 1]} />
      <Sheep position={[1.8, 0.18, 0.5]} />

      {/* Water trough */}
      <WaterTrough position={[2.5, 0.1, -1]} />

      {/* Biodigester */}
      <BiodigesterReactor position={[-7, 0, 0]} />

      {/* Waste pipe to digester */}
      <mesh position={[-4.2, 0.25, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2.5]} />
        <meshStandardMaterial color="#92400e" metalness={0.3} />
      </mesh>

      {/* Gas pipe to village */}
      <mesh position={[-7, 2, -3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 2]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.5} />
      </mesh>

      {/* Compost pile */}
      <mesh position={[-9, 0.2, 2]} castShadow>
        <sphereGeometry args={[0.8, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4b7c13" roughness={1} />
      </mesh>
      <WoodenSign position={[-9, 0, 3]} text="سماد عضوي" />

      <WoodenSign position={[0, 0.15, 4]} text="حظيرة الماشية" />
    </group>
  );
}

const stats = [
  { en: 'Animals in Barn', ar: 'رأس ماشية', value: '20+', icon: '🐄' },
  { en: 'Biogas Produced', ar: 'متر³ بيوجاز/يوم', value: '15', icon: '🔥' },
  { en: 'Fertilizer/Month', ar: 'كغ سماد/شهر', value: '200', icon: '🌿' },
  { en: 'Energy Recycled', ar: 'طاقة معاد تدويرها', value: '30%', icon: '♻️' },
];

const features = [
  {
    icon: '🐄',
    titleAr: 'حظيرة الماشية',
    titleEn: 'Livestock Barn',
    descAr: 'حظيرة خشبية مفتوحة محاطة بسور خشبي قصير تضم الأبقار والأغنام مع أحواض شرب.',
    descEn: 'An open wooden barn enclosed by a short wooden fence, housing cattle and sheep with drinking troughs.',
  },
  {
    icon: '🔬',
    titleAr: 'مفاعل البيوجاز',
    titleEn: 'Biogas Reactor',
    descAr: 'مفاعل هضم لاهوائي يحول فضلات الماشية إلى غاز حيوي نظيف يُستخدم لتوليد الطاقة.',
    descEn: 'An anaerobic digester that converts livestock waste into clean biogas used for energy generation.',
  },
  {
    icon: '🌱',
    titleAr: 'السماد العضوي',
    titleEn: 'Organic Compost',
    descAr: 'المخرجات الصلبة من المفاعل تتحول إلى سماد عضوي غني يُستخدم في تخصيب الأراضي الزراعية.',
    descEn: 'Solid outputs from the reactor become rich organic compost used to fertilize agricultural lands.',
  },
  {
    icon: '💧',
    titleAr: 'إمداد الماشية بالمياه',
    titleEn: 'Livestock Water Supply',
    descAr: 'أحواض شرب تغذيها مياه خزان الأمطار المضخوخة بالطاقة الشمسية لضمان الاستدامة.',
    descEn: 'Drinking troughs fed by rainwater tank pumped with solar energy for full sustainability.',
  },
];

export default function Animal() {
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
      <section className="relative h-[80vh] bg-gradient-to-b from-amber-900 via-amber-700 to-amber-500 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/80 via-transparent to-amber-900/60 z-10 pointer-events-none" />

        <div className="w-full h-full">
          <Canvas shadows camera={{ position: [0, 10, 16], fov: 40 }}>
            <Suspense fallback={<CanvasLoader />}>
              <color attach="background" args={['#451a03']} />
              <ambientLight intensity={0.5} />
              <directionalLight castShadow position={[8, 14, 5]} intensity={2} shadow-mapSize={[2048, 2048]} />
              <pointLight position={[0, 5, 5]} color="#fbbf24" intensity={1.5} />
              <Environment preset="sunset" />
              <OrbitControls autoRotate autoRotateSpeed={0.3} maxPolarAngle={Math.PI / 2.2} minDistance={8} maxDistance={28} target={[0, -1, 0]} />
              <AnimalZoneScene />
              <ContactShadows position={[0, -1.25, 0]} opacity={0.5} scale={22} blur={2.5} far={4} color="#451a03" />
            </Suspense>
          </Canvas>
        </div>

        <div className="absolute top-6 md:top-10 left-1/2 -translate-x-1/2 z-20 text-center px-4 pointer-events-none w-full max-w-4xl">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <h1 className="text-[clamp(1.25rem,4vw+0.5rem,3rem)] font-extrabold text-white drop-shadow-2xl bg-amber-900/60 px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl backdrop-blur-sm border border-white/20 inline-block leading-tight">
              {isAr ? '🐄 منطقة الإنتاج الحيواني' : '🐄 Animal Production Zone'}
            </h1>
            <p className="text-white/90 text-[clamp(0.75rem,2vw+0.25rem,1.125rem)] mt-3 md:mt-4 font-semibold bg-black/30 px-4 md:px-6 py-1.5 md:py-2 rounded-full backdrop-blur-md inline-block">
              {isAr ? 'ماشية • بيوجاز • سماد عضوي • دورة متكاملة' : 'Livestock • Biogas • Organic Compost • Circular Cycle'}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-24 md:bottom-6 left-1/2 md:left-6 -translate-x-1/2 md:translate-x-0 z-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-3 md:p-4 pointer-events-none w-[90%] sm:w-auto flex flex-col items-center md:items-start shadow-xl">
          <p className="text-white/80 text-[clamp(0.7rem,2vw,0.8rem)] font-bold mb-2 text-center md:text-left">{isAr ? 'أسحب لاستكشاف النموذج' : 'Drag to explore the model'}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
            {[{c:'#f5f5f5',l:isAr?'ماشية':'Livestock'},{c:'#374151',l:isAr?'مفاعل':'Digester'},{c:'#4b7c13',l:isAr?'سماد':'Compost'}].map(x=>(
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
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-amber-600/80 hover:bg-amber-600 backdrop-blur-md text-white rounded-full p-4 border-2 border-white/40 transition-all shadow-2xl flex items-center justify-center cursor-pointer"
        >
          <ChevronDown size={48} strokeWidth={2.5} />
        </motion.button>
      </section>

      {/* Stats */}
      <section className="bg-amber-800 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 * i }} className="text-center text-white">
                <div className="text-4xl mb-1">{s.icon}</div>
                <div className="text-3xl font-black text-amber-300">{s.value}</div>
                <div className="text-sm text-amber-200 font-semibold">{isAr ? s.ar : s.en}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-amber-800 mb-3">
            {isAr ? '🔄 دورة الإنتاج الحيواني الكاملة' : '🔄 Complete Animal Production Cycle'}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            {isAr
              ? 'تُستخدم فضلات الماشية في مفاعل البيوجاز لإنتاج غاز نظيف يوفر الطاقة، بينما تُحوَّل المخرجات الصلبة إلى سماد عضوي يُغذّي الأراضي الزراعية.'
              : 'Livestock waste feeds the biogas reactor to produce clean energy, while solid outputs become organic compost that nourishes farmlands.'}
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
              className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-amber-400 hover:shadow-2xl transition-all"
            >
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-amber-800 mb-2">{isAr ? f.titleAr : f.titleEn}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{isAr ? f.descAr : f.descEn}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Biogas Cycle */}
      <section className="bg-gradient-to-r from-amber-50 to-yellow-50 border-y border-amber-200 py-12">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-amber-800 text-center mb-8">
            {isAr ? '⚡ دورة البيوجاز والطاقة' : '⚡ Biogas & Energy Cycle'}
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {[
              { icon: '🐄', label: isAr ? 'الماشية' : 'Livestock' },
              { icon: '💩', label: isAr ? 'الفضلات' : 'Waste' },
              { icon: '🔬', label: isAr ? 'مفاعل البيوجاز' : 'Biogas Reactor' },
              { icon: '🔥', label: isAr ? 'غاز حيوي' : 'Biogas' },
              { icon: '⚡', label: isAr ? 'طاقة كهربائية' : 'Electricity' },
              { icon: '🏘️', label: isAr ? 'تشغيل القرية' : 'Power Village' },
            ].map((item, i, arr) => (
              <React.Fragment key={i}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex flex-col items-center bg-white rounded-2xl px-5 py-4 shadow-md border border-amber-100"
                >
                  <span className="text-3xl mb-1">{item.icon}</span>
                  <span className="text-amber-700 font-bold text-sm">{item.label}</span>
                </motion.div>
                {i < arr.length - 1 && <span className="text-amber-400 text-2xl font-bold">→</span>}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-10 p-6 bg-white rounded-2xl shadow-lg border border-amber-200 max-w-3xl mx-auto">
            <h4 className="font-bold text-amber-800 text-xl mb-3">
              {isAr ? '🌿 السماد العضوي: المسار الثاني' : '🌿 Organic Compost: The Second Path'}
            </h4>
            <p className="text-gray-600 leading-relaxed">
              {isAr
                ? 'بجانب إنتاج البيوجاز، يُخرج المفاعل مواد صلبة غنية بالمغذيات تُستخدم كسماد عضوي طبيعي 100% للأراضي الزراعية، مما يُغني التربة ويزيد إنتاجية المحاصيل دون استخدام أي مواد كيميائية.'
                : 'Alongside biogas production, the reactor outputs nutrient-rich solid material used as 100% natural organic fertilizer for agricultural lands, enriching soil and increasing crop yields without any chemical inputs.'}
            </p>
          </div>
        </div>
      </section>
      {/* Educational & Future Prospects Section */}
      <section className="container mx-auto px-4 py-12 mb-8">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-100 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-amber-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">🌍</span>
              {isAr ? 'الرؤية البيئية والآفاق المستقبلية' : 'Environmental Vision & Future Prospects'}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                <h3 className="text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🌱</span>
                  {isAr ? 'المفاهيم البيئية المطبقة' : 'Applied Environmental Concepts'}
                </h3>
                <p className="text-gray-700 leading-relaxed text-[clamp(0.9rem,2vw,1.05rem)] text-justify">
                  {isAr 
                    ? 'يُعد غاز الميثان الناتج عن الماشية من أخطر الغازات الدفيئة المسببة للاحتباس الحراري. من خلال تطبيق مبدأ "تحويل النفايات إلى طاقة" (Waste-to-Energy) عبر الهضم اللاهوائي في مفاعل البيوجاز، يتم التقاط هذا الغاز الخطير وتحويله من تهديد مناخي إلى مصدر نظيف وموثوق للطاقة المتجددة.' 
                    : 'Methane produced by livestock is a highly potent greenhouse gas. By applying the "Waste-to-Energy" concept via anaerobic digestion in the biogas reactor, this dangerous gas is captured and transformed from a climate threat into a clean, reliable source of renewable energy.'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 text-white shadow-lg transform hover:-translate-y-1 transition-transform">
                <h3 className="text-xl font-bold text-amber-400 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  {isAr ? 'الآفاق والتطوير المستقبلي' : 'Future Prospects & Development'}
                </h3>
                <p className="text-gray-300 leading-relaxed text-[clamp(0.9rem,2vw,1.05rem)] text-justify">
                  {isAr 
                    ? 'يجري العمل مستقبلاً على تزويد الماشية بأطواق ذكية (IoT Collars) لمراقبة المؤشرات الصحية لحظياً باستخدام الذكاء الاصطناعي. كما يتم تطوير عمليات "التكرير الحيوي" (Biorefining) لاستخراج البلاستيك الحيوي القابل للتحلل (Bioplastics) ومواد كيميائية عالية القيمة من النواتج الثانوية لمفاعل البيوجاز.' 
                    : 'Future plans include equipping livestock with smart IoT Collars to monitor health metrics in real-time using AI. Furthermore, advanced Biorefining processes are being developed to extract biodegradable plastics (Bioplastics) and high-value chemicals directly from the biogas reactor byproducts.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
