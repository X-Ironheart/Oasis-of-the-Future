import React, { useRef } from 'react';
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
        <boxGeometry args={[1.1, 0.35, 0.05]} />
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

function PalmTree({ position }: { position: [number, number, number] }) {
  const swayRef = useRef<any>();
  useFrame(({ clock }) => {
    if (swayRef.current) {
      swayRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.05;
    }
  });
  return (
    <group position={position} ref={swayRef}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.12, 1.4]} />
        <meshStandardMaterial color="#6b4423" roughness={1} />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <mesh key={i} position={[0, 1.4, 0]} rotation={[0.6, (i * Math.PI * 2) / 7, 0]} castShadow>
          <coneGeometry args={[0.55, 1.5, 4]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#1b5e20' : '#2e7d32'} roughness={0.8} />
        </mesh>
      ))}
      {/* Dates clusters */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.sin((i * Math.PI * 2) / 3) * 0.3, 1.2, Math.cos((i * Math.PI * 2) / 3) * 0.3]} castShadow>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#d97706" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Vegetable({ position }: { position: [number, number, number] }) {
  const growRef = useRef<any>();
  useFrame(({ clock }) => {
    if (growRef.current) {
      growRef.current.scale.y = 0.9 + Math.sin(clock.elapsedTime * 0.8 + position[0]) * 0.1;
    }
  });
  return (
    <group position={position} ref={growRef}>
      <mesh castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#16a34a" roughness={0.8} />
      </mesh>
      <mesh position={[0.1, 0.15, 0]} castShadow>
        <sphereGeometry args={[0.13, 8, 8]} />
        <meshStandardMaterial color="#22c55e" roughness={0.8} />
      </mesh>
    </group>
  );
}

function CropBed({ position, isPalm = false, label = '' }: { position: [number, number, number]; isPalm?: boolean; label?: string }) {
  return (
    <group position={position}>
      {/* Soil bed */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[3.5, 0.12, 1.6]} />
        <meshStandardMaterial color="#3b2005" roughness={1} />
      </mesh>
      {/* Soil inner */}
      <mesh position={[0, 0.07, 0]} receiveShadow>
        <boxGeometry args={[3.2, 0.13, 1.3]} />
        <meshStandardMaterial color="#2d1a00" roughness={1} />
      </mesh>
      {/* Irrigation channel */}
      <mesh position={[0, 0.14, -0.55]} receiveShadow>
        <boxGeometry args={[3.2, 0.03, 0.1]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.8} />
      </mesh>

      {isPalm ? (
        <>
          <PalmTree position={[-1.1, 0.15, 0]} />
          <PalmTree position={[0, 0.15, 0]} />
          <PalmTree position={[1.1, 0.15, 0]} />
        </>
      ) : (
        <>
          {[-1.2, -0.6, 0, 0.6, 1.2].map((x) =>
            [-0.35, 0.35].map((z) => (
              <Vegetable key={`${x}-${z}`} position={[x, 0.18, z]} />
            ))
          )}
        </>
      )}

      {label && <WoodenSign position={[1.8, 0, 0.5]} text={label} />}
    </group>
  );
}

function IrrigationPipe({ from, to, isBlue = false }: { from: [number, number, number]; to: [number, number, number]; isBlue?: boolean }) {
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dx, dz);
  const midX = (from[0] + to[0]) / 2;
  const midZ = (from[2] + to[2]) / 2;

  return (
    <mesh position={[midX, from[1], midZ]} rotation={[0, angle, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.04, 0.04, length]} />
      <meshStandardMaterial color={isBlue ? '#38bdf8' : '#94a3b8'} metalness={0.4} roughness={0.5} />
    </mesh>
  );
}

function WaterTankSmall() {
  const waterRef = useRef<any>();
  useFrame(({ clock }) => {
    if (waterRef.current) {
      waterRef.current.material.opacity = 0.7 + Math.sin(clock.elapsedTime) * 0.15;
    }
  });
  return (
    <group position={[4.5, 0, 2]}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.5, 1.2, 1.5]} />
        <meshStandardMaterial color="#e0f2fe" transparent opacity={0.3} metalness={0.9} roughness={0} />
      </mesh>
      <mesh ref={waterRef} position={[0, 0.4, 0]}>
        <boxGeometry args={[1.4, 0.8, 1.4]} />
        <meshStandardMaterial color="#0284c7" transparent opacity={0.75} />
      </mesh>
      <WoodenSign position={[0, 0, 1]} text="ري تلقائي" />
    </group>
  );
}

function AgricultureScene() {
  return (
    <group position={[0, -1.2, 0]}>
      {/* Ground */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[14, 0.1, 12]} />
        <meshStandardMaterial color="#166534" roughness={1} />
      </mesh>

      {/* Crop Beds */}
      <CropBed position={[-3, 0, -3.5]} isPalm label="نخيل" />
      <CropBed position={[-3, 0, -1.5]} />
      <CropBed position={[-3, 0, 0.5]} isPalm label="نخيل" />
      <CropBed position={[-3, 0, 2.5]} />
      <CropBed position={[2, 0, -3.5]} label="خضروات" />
      <CropBed position={[2, 0, -1.5]} isPalm label="نخيل" />
      <CropBed position={[2, 0, 0.5]} label="خضروات" />
      <CropBed position={[2, 0, 2.5]} />

      {/* Irrigation pipes */}
      <IrrigationPipe from={[4.5, 0.15, 2]} to={[4.5, 0.15, -4]} isBlue />
      <IrrigationPipe from={[4.5, 0.15, -1]} to={[-5, 0.15, -1]} isBlue />
      <IrrigationPipe from={[4.5, 0.15, 1]} to={[-5, 0.15, 1]} isBlue />

      {/* Pathway */}
      <mesh position={[-0.5, 0.06, 0]} receiveShadow>
        <boxGeometry args={[1.2, 0.06, 12]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.9} />
      </mesh>

      {/* Water tank */}
      <WaterTankSmall />

      {/* Solar-powered pump */}
      <group position={[5.5, 0, -1]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.6, 1, 0.4]} />
          <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.1, 0]} rotation={[-Math.PI / 4, 0, 0]} castShadow>
          <boxGeometry args={[0.9, 0.8, 0.04]} />
          <meshStandardMaterial color="#1e40af" metalness={0.7} roughness={0.2} />
        </mesh>
        <WoodenSign position={[0, 0, 0.5]} text="مضخة شمسية" />
      </group>
    </group>
  );
}

// --- Stats Data ---
const stats = [
  { en: 'Hectares Farmed', ar: 'هكتار زراعي', value: '5', icon: '🌾' },
  { en: 'CO₂ Reduced', ar: 'تخفيض CO₂', value: '40%', icon: '🍃' },
  { en: 'Crop Varieties', ar: 'أنواع المحاصيل', value: '12+', icon: '🌱' },
  { en: 'Water Saved', ar: 'ماء موفر', value: '60%', icon: '💧' },
];

const features = [
  {
    icon: '🌴',
    titleAr: 'زراعة النخيل',
    titleEn: 'Palm Cultivation',
    descAr: 'صفوف من أشجار النخيل توفر الغذاء والظل وتساهم في تثبيت التربة.',
    descEn: 'Rows of palm trees provide food, shade, and help stabilize the soil.',
  },
  {
    icon: '🥦',
    titleAr: 'الخضروات العضوية',
    titleEn: 'Organic Vegetables',
    descAr: 'أحواض منظمة للخضروات المروية بالطاقة الشمسية وبدون مبيدات.',
    descEn: 'Organized beds of vegetables irrigated by solar-powered pumps, pesticide-free.',
  },
  {
    icon: '💧',
    titleAr: 'ري بالتنقيط الذكي',
    titleEn: 'Smart Drip Irrigation',
    descAr: 'نظام ري تلقائي يقلل من هدر المياه بنسبة 60% مقارنة بالري التقليدي.',
    descEn: 'Automated drip irrigation reducing water waste by 60% vs traditional methods.',
  },
  {
    icon: '🌿',
    titleAr: 'السماد العضوي',
    titleEn: 'Organic Fertilizer',
    descAr: 'تحويل فضلات الماشية إلى سماد عضوي غني يعزز خصوبة التربة.',
    descEn: 'Converting livestock waste to rich organic compost that enhances soil fertility.',
  },
];

export default function Agriculture() {
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
      <section className="relative h-[80vh] bg-gradient-to-b from-green-900 via-green-700 to-green-500 overflow-hidden">
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-transparent to-green-900/60 z-10 pointer-events-none" />

        {/* 3D Canvas */}
        <div className="w-full h-full">
          <Canvas shadows camera={{ position: [0, 10, 14], fov: 38 }}>
            <color attach="background" args={['#052e16']} />
            <ambientLight intensity={0.6} />
            <directionalLight castShadow position={[8, 14, 5]} intensity={2} shadow-mapSize={[2048, 2048]} />
            <pointLight position={[-5, 5, -5]} color="#bbf7d0" intensity={1.5} />
            <Environment preset="forest" />
            <OrbitControls autoRotate autoRotateSpeed={0.4} maxPolarAngle={Math.PI / 2.2} minDistance={7} maxDistance={25} target={[0, -1, 0]} />
            <AgricultureScene />
            <ContactShadows position={[0, -1.25, 0]} opacity={0.5} scale={20} blur={2} far={4} color="#052e16" />
          </Canvas>
        </div>

        {/* Hero Text */}
        <div className="absolute top-6 md:top-10 left-1/2 -translate-x-1/2 z-20 text-center px-4 pointer-events-none w-full max-w-4xl">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <h1 className="text-[clamp(1.25rem,4vw+0.5rem,3rem)] font-extrabold text-white drop-shadow-2xl bg-green-900/60 px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl backdrop-blur-sm border border-white/20 inline-block leading-tight">
              {isAr ? '🌿 المنطقة الزراعية المستدامة' : '🌿 Sustainable Agriculture Zone'}
            </h1>
            <p className="text-white/90 text-[clamp(0.75rem,2vw+0.25rem,1.125rem)] mt-3 md:mt-4 font-semibold bg-black/30 px-4 md:px-6 py-1.5 md:py-2 rounded-full backdrop-blur-md inline-block">
              {isAr ? 'اكتفاء ذاتي زراعي • تقليل الانبعاثات • زراعة بلا مبيدات' : 'Agricultural Self-Sufficiency • Zero Emissions • Pesticide-Free'}
            </p>
          </motion.div>
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-24 md:bottom-6 left-1/2 md:left-6 -translate-x-1/2 md:translate-x-0 z-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-3 md:p-4 pointer-events-none w-[90%] sm:w-auto flex flex-col items-center md:items-start shadow-xl">
          <p className="text-white/80 text-[clamp(0.7rem,2vw,0.8rem)] font-bold mb-2 text-center md:text-left">{isAr ? 'أسحب لاستكشاف النموذج' : 'Drag to explore the model'}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
            {[{c:'#16a34a',l:isAr?'نخيل':'Palms'},{c:'#22c55e',l:isAr?'خضروات':'Veggies'},{c:'#38bdf8',l:isAr?'ري':'Irrigation'}].map(x=>(
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
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-green-600/80 hover:bg-green-600 backdrop-blur-md text-white rounded-full p-4 border-2 border-white/40 transition-all shadow-2xl flex items-center justify-center cursor-pointer"
        >
          <ChevronDown size={48} strokeWidth={2.5} />
        </motion.button>
      </section>

      {/* Stats Bar */}
      <section className="bg-green-800 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * i }}
                className="text-center text-white"
              >
                <div className="text-4xl mb-1">{s.icon}</div>
                <div className="text-3xl font-black text-green-300">{s.value}</div>
                <div className="text-sm text-green-200 font-semibold">{isAr ? s.ar : s.en}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-green-800 mb-3">
            {isAr ? '🌱 مكونات المنطقة الزراعية' : '🌱 Agricultural Zone Components'}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            {isAr
              ? 'مساحة خضراء مخصصة للزراعة المستدامة، مقسمة إلى أحواض وصفوف منظمة بتقنيات الري الذكي.'
              : 'A green space for sustainable farming, divided into organized beds with smart irrigation technology.'}
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
              className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-green-500 hover:shadow-2xl transition-all"
            >
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-green-800 mb-2">{isAr ? f.titleAr : f.titleEn}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{isAr ? f.descAr : f.descEn}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Circular Economy Banner */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 border-y border-green-200 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="text-6xl">♻️</div>
            <div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                {isAr ? 'الزراعة في الاقتصاد الدائري' : 'Agriculture in the Circular Economy'}
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {isAr
                  ? 'تحصل الأراضي الزراعية على مياه الري من خزان تجميع الأمطار المغذى بالأنابيب من أسطح المنازل. كما يُستخدم السماد العضوي المستخرج من فضلات الماشية لتخصيب التربة، مما يُقلل الحاجة للأسمدة الكيميائية بنسبة 100%.'
                  : 'Farmland receives irrigation water from the rainwater harvesting tank fed by roof pipes. Organic compost from livestock waste fertilizes the soil, eliminating the need for chemical fertilizers by 100%.'}
              </p>
            </div>
            <div className="flex flex-col gap-3 min-w-max">
              {[
                { icon: '🏠', label: isAr ? 'أسطح المنازل' : 'House Roofs' },
                { icon: '💧', label: isAr ? 'خزان المياه' : 'Water Tank' },
                { icon: '🌱', label: isAr ? 'الأراضي الزراعية' : 'Farmlands' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-md border border-green-100">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-bold text-green-700 text-sm">{item.label}</span>
                  {i < 2 && <span className="ml-2 text-green-400">↓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Educational & Future Prospects Section */}
      <section className="container mx-auto px-4 py-12 mb-8">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-green-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">🌍</span>
              {isAr ? 'الرؤية البيئية والآفاق المستقبلية' : 'Environmental Vision & Future Prospects'}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🌱</span>
                  {isAr ? 'المفاهيم البيئية المطبقة' : 'Applied Environmental Concepts'}
                </h3>
                <p className="text-gray-700 leading-relaxed text-[clamp(0.9rem,2vw,1.05rem)] text-justify">
                  {isAr 
                    ? 'ترتكز العمليات هنا على مبدأ "الاقتصاد الدائري" (Circular Economy) والزراعة التجديدية. بدلاً من استنزاف التربة بالكيماويات، يُستخدم السماد العضوي المُعاد تدويره لإعادة إحياء التربة لتعزيز التنوع البيولوجي. هذا يضمن دورة زراعية خالية من المبيدات والانبعاثات.' 
                    : 'Operations here are rooted in the "Circular Economy" and Regenerative Agriculture. Instead of depleting the soil with chemicals, recycled organic compost is used to revitalize the earth and boost biodiversity, ensuring a pesticide-free and zero-emission agricultural cycle.'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 text-white shadow-lg transform hover:-translate-y-1 transition-transform">
                <h3 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  {isAr ? 'الآفاق والتطوير المستقبلي' : 'Future Prospects & Development'}
                </h3>
                <p className="text-gray-300 leading-relaxed text-[clamp(0.9rem,2vw,1.05rem)] text-justify">
                  {isAr 
                    ? 'سيشهد المستقبل دمج تقنيات الزراعة المائية (Aquaponics) التي تجمع بين تربية الأسماك وزراعة النباتات في نظام مغلق. كما سيبدأ الاعتماد على طائرات بدون طيار (Drones) مدعومة بالذكاء الاصطناعي لمسح المحاصيل، الكشف المبكر عن الأمراض، والحصاد الآلي الدقيق.' 
                    : 'The future will see the integration of Aquaponics, combining fish farming and plant cultivation in a closed loop. We will also introduce AI-powered drones to survey crops, detect plant diseases early, and perform precise automated harvesting.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
