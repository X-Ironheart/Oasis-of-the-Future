import { useRef, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html } from '@react-three/drei';
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
        <boxGeometry args={[1.3, 0.35, 0.05]} />
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

function WindTurbine({ position, speed = 0.04 }: { position: [number, number, number]; speed?: number }) {
  const bladesRef = useRef<any>(null);
  useFrame(() => {
    if (bladesRef.current) bladesRef.current.rotation.z -= speed;
  });
  return (
    <group position={position}>
      {/* Foundation */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.6, 0.4, 6]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.18, 5.2]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Nacelle */}
      <mesh position={[0, 5.1, 0.1]} castShadow>
        <boxGeometry args={[0.5, 0.35, 0.9]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Hub */}
      <mesh position={[0, 5.1, 0.55]} castShadow>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Blades */}
      <group position={[0, 5.1, 0.6]} ref={bladesRef}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
            <mesh position={[0, 1.4, 0]}>
              <boxGeometry args={[0.12, 2.8, 0.04]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.1} />
            </mesh>
          </mesh>
        ))}
      </group>
    </group>
  );
}

function SandDune({ position, size }: { position: [number, number, number]; size: number }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <sphereGeometry args={[size, 6, 4]} />
      <meshStandardMaterial color="#fde68a" roughness={1} />
    </mesh>
  );
}

function PowerCable({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const length = Math.sqrt(dx * dx + dz * dz);
  const midX = (from[0] + to[0]) / 2;
  const midZ = (from[2] + to[2]) / 2;
  const angle = Math.atan2(dx, dz);
  return (
    <mesh position={[midX, from[1], midZ]} rotation={[0, angle, Math.PI / 2]} castShadow>
      <boxGeometry args={[0.06, length, 0.06]} />
      <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.3} />
    </mesh>
  );
}

function SolarPanel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.05, 1]} />
        <meshStandardMaterial color="#1e40af" metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  );
}

function DesertScene() {
  return (
    <group position={[0, -1.2, 0]}>
      {/* Sandy Ground */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[20, 0.1, 16]} />
        <meshStandardMaterial color="#d97706" roughness={1} />
      </mesh>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[19.5, 0.05, 15.5]} />
        <meshStandardMaterial color="#fde68a" roughness={1} />
      </mesh>

      {/* Sand Dunes — 4 only, low-poly */}
      <SandDune position={[-7, 0.05, -5]} size={2.2} />
      <SandDune position={[-5, 0.05, 4.5]} size={1.8} />
      <SandDune position={[7, 0.05, -4]} size={1.6} />
      <SandDune position={[5, 0.05, 4]} size={1.3} />

      {/* Wind Turbines */}
      <WindTurbine position={[-3.5, 0.1, -2]} speed={0.05} />
      <WindTurbine position={[0, 0.1, -3.5]} speed={0.035} />
      <WindTurbine position={[3.5, 0.1, -1.5]} speed={0.06} />

      {/* Power cables from turbines */}
      <PowerCable from={[-3.5, 0.2, -2]} to={[0, 0.2, -0.5]} />
      <PowerCable from={[0, 0.2, -3.5]} to={[0, 0.2, -0.5]} />
      <PowerCable from={[3.5, 0.2, -1.5]} to={[0, 0.2, -0.5]} />
      <PowerCable from={[0, 0.2, -0.5]} to={[0, 0.2, 4]} />

      {/* Control / Power Substation */}
      <group position={[0, 0, 3]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.5, 1.2, 1]} />
          <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.35, 0]} castShadow>
          <boxGeometry args={[1.6, 0.1, 1.1]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} />
        </mesh>
        {/* Display panels */}
        {[-0.3, 0.3].map((x, i) => (
          <mesh key={i} position={[x, 0.6, 0.51]} castShadow>
            <boxGeometry args={[0.4, 0.5, 0.02]} />
            <meshStandardMaterial color={i === 0 ? '#fbbf24' : '#10b981'} emissive={i === 0 ? '#fbbf24' : '#10b981'} emissiveIntensity={0.5} />
          </mesh>
        ))}
        <WoodenSign position={[0, 0, 1]} text="محطة توليد" />
      </group>

      {/* Solar panels (additional energy) */}
      <group position={[5, 0.6, 2]} rotation={[-Math.PI / 6, 0, 0]}>
        <SolarPanel position={[0, 0, 0]} />
      </group>
      <group position={[5, 0.6, 3.5]} rotation={[-Math.PI / 6, 0, 0]}>
        <SolarPanel position={[0, 0, 0]} />
      </group>

      {/* Desert sign */}
      <WoodenSign position={[-6, 0.05, 0]} text="صحراء" />
      <WoodenSign position={[0, 0.05, -6]} text="توربينات رياح" />
    </group>
  );
}

const stats = [
  { en: 'Wind Turbines', ar: 'توربينات الرياح', value: '3', icon: '🌀' },
  { en: 'kW Generated/Day', ar: 'كيلوواط/يوم', value: '120', icon: '⚡' },
  { en: 'Homes Powered', ar: 'منزل مزود بالطاقة', value: '4+', icon: '🏘️' },
  { en: 'CO₂ Saved/Year', ar: 'طن CO₂ موفر/سنة', value: '45', icon: '🍃' },
];

const features = [
  {
    icon: '🌀',
    titleAr: 'توربينات الرياح الثلاثة',
    titleEn: 'Three Wind Turbines',
    descAr: 'ثلاثة توربينات بيضاء مثبتة في الرمال تستغل طاقة الرياح القوية في البيئة الصحراوية.',
    descEn: 'Three white turbines fixed in sand, harnessing the strong wind energy in the desert environment.',
  },
  {
    icon: '⚡',
    titleAr: 'شبكة توزيع الكهرباء',
    titleEn: 'Power Distribution Grid',
    descAr: 'كابلات توصيل ذهبية تنقل الكهرباء المولدة من التوربينات إلى محطة التحويل الرئيسية.',
    descEn: 'Gold distribution cables transfer generated electricity from turbines to the main substation.',
  },
  {
    icon: '☀️',
    titleAr: 'ألواح شمسية تكميلية',
    titleEn: 'Supplementary Solar Panels',
    descAr: 'ألواح شمسية إضافية لضمان توليد مستمر للطاقة حتى في أيام ضعف الرياح.',
    descEn: 'Additional solar panels ensuring continuous energy generation even on low-wind days.',
  },
  {
    icon: '🏭',
    titleAr: 'محطة التحويل الذكية',
    titleEn: 'Smart Power Substation',
    descAr: 'محطة مراقبة مركزية تتابع الإنتاج وتوزع الكهرباء على مناطق القرية المختلفة.',
    descEn: 'A central monitoring station that tracks production and distributes electricity to village zones.',
  },
];

export default function Desert() {
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
      <section className="relative h-[80vh] bg-gradient-to-b from-yellow-900 via-yellow-700 to-yellow-500 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/80 via-transparent to-yellow-900/60 z-10 pointer-events-none" />

        <div className="w-full h-full">
          <Canvas shadows camera={{ position: [0, 10, 18], fov: 42 }} dpr={[1, 1.5]} gl={{ powerPreference: 'high-performance' }}>
            <Suspense fallback={<CanvasLoader />}>
            <color attach="background" args={['#78350f']} />
            <ambientLight intensity={0.8} />
            <hemisphereLight intensity={0.5} color="#fde68a" groundColor="#78350f" />
            <directionalLight castShadow position={[10, 16, 5]} intensity={2} shadow-mapSize={[512, 512]} />
            <OrbitControls autoRotate autoRotateSpeed={0.4} maxPolarAngle={Math.PI / 2.2} minDistance={8} maxDistance={30} target={[0, -1, 0]} />
            <DesertScene />
            <ContactShadows position={[0, -1.25, 0]} opacity={0.6} scale={25} blur={2.5} far={4} color="#78350f" />
            </Suspense>
          </Canvas>
        </div>

        <div className="absolute top-6 md:top-10 left-1/2 -translate-x-1/2 z-20 text-center px-4 pointer-events-none w-full max-w-4xl">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <h1 className="text-[clamp(1.25rem,4vw+0.5rem,3rem)] font-extrabold text-white drop-shadow-2xl bg-yellow-900/60 px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl backdrop-blur-sm border border-white/20 inline-block leading-tight">
              {isAr ? '🏜️ الصحراء وطاقة الرياح' : '🏜️ Desert & Wind Energy'}
            </h1>
            <p className="text-white/90 text-[clamp(0.75rem,2vw+0.25rem,1.125rem)] mt-3 md:mt-4 font-semibold bg-black/40 px-4 md:px-6 py-1.5 md:py-2 rounded-full backdrop-blur-md inline-block">
              {isAr ? 'توربينات الرياح • طاقة متجددة • التكيف الصحراوي' : 'Wind Turbines • Renewable Energy • Desert Adaptation'}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-24 md:bottom-6 left-1/2 md:left-6 -translate-x-1/2 md:translate-x-0 z-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-3 md:p-4 pointer-events-none w-[90%] sm:w-auto flex flex-col items-center md:items-start shadow-xl">
          <p className="text-white/80 text-[clamp(0.7rem,2vw,0.8rem)] font-bold mb-2 text-center md:text-left">{isAr ? 'أسحب لاستكشاف النموذج' : 'Drag to explore the model'}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
            {[
              { c: '#fbbf24', l: isAr ? 'طاقة الرياح' : 'Wind Energy' },
              { c: '#d97706', l: isAr ? 'نقل الكهرباء' : 'Power Transmission' },
              { c: '#15803d', l: isAr ? 'تخضير صحراوي' : 'Desert Greening' },
            ].map((x) => (
              <span key={x.l} className="flex items-center gap-1 text-white text-[clamp(0.65rem,1.5vw,0.75rem)] bg-black/20 px-2 py-0.5 rounded-full">
                <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border border-white/30" style={{ background: x.c }} />
                {x.l}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll Down Button */}
        <motion.button
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          initial={{ opacity: 0, x: "-50%" }}
          animate={{ opacity: 1, y: [0, 15, 0], scale: [1, 1.05, 1], x: "-50%" }}
          transition={{ delay: 1, duration: 1.5, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 z-30 bg-yellow-600/80 hover:bg-yellow-600 backdrop-blur-md text-white rounded-full p-4 border-2 border-white/40 transition-all shadow-2xl flex items-center justify-center cursor-pointer"
        >
          <ChevronDown size={48} strokeWidth={2.5} />
        </motion.button>
      </section>

      {/* Stats */}
      <section className="bg-yellow-800 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 * i }} className="text-center text-white">
                <div className="text-4xl mb-1">{s.icon}</div>
                <div className="text-3xl font-black text-yellow-300">{s.value}</div>
                <div className="text-sm text-yellow-200 font-semibold">{isAr ? s.ar : s.en}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-yellow-800 mb-3">
            {isAr ? '🏜️ استغلال الصحراء لإنتاج الطاقة' : '🏜️ Harnessing the Desert for Energy'}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            {isAr
              ? 'تتميز البيئة الصحراوية برياح قوية ومستمرة، وهو ما تستغله القرية الذكية لتوليد طاقة نظيفة 24 ساعة في اليوم دون انبعاثات كربونية.'
              : 'Desert environments feature strong and consistent winds, which the smart village leverages to generate clean energy 24/7 with zero carbon emissions.'}
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
              className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-yellow-400 hover:shadow-2xl transition-all"
            >
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-yellow-800 mb-2">{isAr ? f.titleAr : f.titleEn}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{isAr ? f.descAr : f.descEn}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Energy Integration */}
      <section className="bg-gradient-to-r from-yellow-50 to-amber-50 border-y border-yellow-200 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="text-7xl">🌬️</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-yellow-800 mb-3">
                {isAr ? 'الرياح + الشمس = استدامة كاملة' : 'Wind + Sun = Complete Sustainability'}
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {isAr
                  ? 'تعمل توربينات الرياح الثلاث جنباً إلى جنب مع الألواح الشمسية لتوفير طاقة متكاملة ومتواصلة للقرية. في النهار تُكمل الطاقتان بعضهما، وفي الليل تستمر طاقة الرياح في التدفق لضمان عدم انقطاع الإمداد.'
                  : 'Three wind turbines work alongside solar panels to provide integrated, continuous energy for the village. During the day, both sources complement each other; at night, wind energy continues to flow, ensuring uninterrupted supply.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 min-w-fit">
              {[
                { icon: '🌀', v: '3', l: isAr ? 'توربينات' : 'Turbines' },
                { icon: '☀️', v: '4', l: isAr ? 'ألواح شمسية' : 'Solar Panels' },
                { icon: '⚡', v: '120kW', l: isAr ? 'إنتاج/يوم' : 'Daily Output' },
                { icon: '🏘️', v: '4+', l: isAr ? 'منازل' : 'Homes' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-3 text-center shadow-md border border-yellow-100">
                  <div className="text-3xl">{item.icon}</div>
                  <div className="text-xl font-black text-yellow-700">{item.v}</div>
                  <div className="text-xs font-semibold text-gray-500">{item.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Educational & Future Prospects Section */}
      <section className="container mx-auto px-4 py-12 mb-8">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-100 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-yellow-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">🌍</span>
              {isAr ? 'الرؤية البيئية والآفاق المستقبلية' : 'Environmental Vision & Future Prospects'}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100">
                <h3 className="text-xl font-bold text-yellow-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🌱</span>
                  {isAr ? 'المفاهيم البيئية المطبقة' : 'Applied Environmental Concepts'}
                </h3>
                <p className="text-gray-700 leading-relaxed text-[clamp(0.9rem,2vw,1.05rem)] text-justify">
                  {isAr 
                    ? 'يُمثل استغلال طاقة الرياح تدخلاً "صفري الانبعاثات" (Zero-Emission) في البيئات القاحلة. تقلل التوربينات بشكل مباشر من الاعتماد على الوقود الأحفوري، بينما تساهم حركتها وظلالها في خلق مناخ محلي مصغر (Microclimate) يخفض درجة حرارة سطح الأرض ويساعد على نجاح جهود تخضير الصحراء.' 
                    : 'Harnessing wind energy represents a true "Zero-Emission" intervention in arid environments. Turbines directly reduce reliance on fossil fuels, while their movement and shadows help create a microclimate that lowers surface temperatures, assisting in desert greening efforts.'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 text-white shadow-lg transform hover:-translate-y-1 transition-transform">
                <h3 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  {isAr ? 'الآفاق والتطوير المستقبلي' : 'Future Prospects & Development'}
                </h3>
                <p className="text-gray-300 leading-relaxed text-[clamp(0.9rem,2vw,1.05rem)] text-justify">
                  {isAr 
                    ? 'نتطلع في المستقبل لنشر توربينات رياح ذات محور رأسي (VAWT) لالتقاط الرياح المضطربة بكفاءة أعلى، بالإضافة إلى استكشاف طاقة الرياح المحمولة جواً (Airborne Wind Energy) باستخدام طائرات ورقية أو درونز لالتقاط تيارات الهواء المرتفعة، ودمج أنظمة تخزين طاقة عملاقة (Grid-Scale Batteries).' 
                    : 'We look forward to deploying Vertical Axis Wind Turbines (VAWT) to efficiently capture turbulent winds. We will also explore Airborne Wind Energy (using kites or drones) to tap into stronger, high-altitude air currents, alongside integrating massive Grid-Scale Battery storage systems.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
