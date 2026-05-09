import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';
import { Globe, Leaf, Menu, X, Volume2, VolumeX } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import Home from './pages/Home';
import Residential from './pages/Residential';
import Agriculture from './pages/Agriculture';
import Water from './pages/Water';
import Animal from './pages/Animal';
import Desert from './pages/Desert';
import { supervisor } from './data/team';

const navItems = [
  { path: '/', key: 'nav.home', icon: '🏠' },
  { path: '/residential', key: 'nav.residential', icon: '☀️' },
  { path: '/agriculture', key: 'nav.agriculture', icon: '🌿' },
  { path: '/water', key: 'nav.water', icon: '💧' },
  { path: '/animal', key: 'nav.animal', icon: '🐄' },
  { path: '/desert', key: 'nav.desert', icon: '🌬️' },
];

function NavBar({ isMuted, toggleMute }: { isMuted: boolean, toggleMute: () => void }) {
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);


  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
          : 'bg-white shadow-md'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group max-w-[65%] sm:max-w-none">
            <div className="w-8 h-8 md:w-9 md:h-9 shrink-0 bg-gradient-to-br from-sage to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Leaf className="text-white w-4 h-4 md:w-[18px] md:h-[18px]" />
            </div>
            <span className="text-[clamp(0.85rem,3vw,1.125rem)] font-extrabold text-sage leading-tight truncate">
              {t('app.title')}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  location.pathname === item.path
                    ? 'bg-sage text-white shadow-sm'
                    : 'text-gray-600 hover:bg-green-50 hover:text-sage'
                }`}
              >
                <span>{item.icon}</span>
                <span>{t(item.key)}</span>
              </Link>
            ))}
          </div>

          {/* Lang + Mobile toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className={`flex items-center justify-center p-2 rounded-full transition-all ${
                isMuted ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-sage shadow-inner'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="animate-pulse" />}
            </button>
            <button
              onClick={toggleLanguage}
              id="lang-toggle-btn"
              className="flex items-center gap-1.5 bg-sage text-white px-3 py-1.5 rounded-full text-sm font-bold hover:bg-green-700 transition-colors shadow-sm"
            >
              <Globe size={15} />
              {i18n.language === 'ar' ? 'EN' : 'عربي'}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden lg:hidden"
            >
              <div className="py-3 flex flex-col gap-1 border-t border-gray-100">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      location.pathname === item.path
                        ? 'bg-sage text-white'
                        : 'text-gray-600 hover:bg-green-50 hover:text-sage'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{t(item.key)}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

function Footer() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <footer className="bg-gray-900 text-white py-10 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sage to-green-500 rounded-xl flex items-center justify-center">
              <Leaf size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-green-400">
                {isAr ? 'القرية الريفية الذكية المتكاملة' : 'Integrated Smart Rural Village'}
              </h3>
              <p className="text-gray-400 text-sm">
                {isAr ? 'ترابط المياه والطاقة والمناخ' : 'Water–Energy–Climate Nexus'}
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm font-semibold">
              {isAr ? ' جامعة حورس 🪙 كلية الهندسة' : ' Horus University 🪙 Faculty of Engineering'}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {isAr ? `إشراف: ${supervisor.nameAr}` : `Supervised by: ${supervisor.nameEn}`} · 2026
            </p>
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            {['🏡', '🌿', '💧', '🐄', '🌬️'].map((icon, i) => (
              <span key={i} className="text-2xl hover:scale-125 transition-transform cursor-default">{icon}</span>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-500 text-xs">
          {isAr
            ? '© 2026 نموذج القرية الريفية الذكية المتكاملة - Mohamed Taher & Team وفريق العمل. جميع الحقوق محفوظة.'
            : '© 2026 Integrated Smart Rural Village Model -  Mohamed Taher & Team. All Rights Reserved.'}
        </div>
      </div>
    </footer>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/residential" element={<Residential />} />
        <Route path="/agriculture" element={<Agriculture />} />
        <Route path="/water" element={<Water />} />
        <Route path="/animal" element={<Animal />} />
        <Route path="/desert" element={<Desert />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const { i18n } = useTranslation();
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Handle Autoplay Policy
  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // Autoplay was prevented
          console.log("Autoplay prevented. Waiting for user interaction.");
        });
      }
    };

    // Try to play immediately
    playAudio();

    // Also try to play on first interaction if blocked
    const handleFirstClick = () => {
      playAudio();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);

    return () => window.removeEventListener('click', handleFirstClick);
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-cream font-cairo">
        <audio
          ref={audioRef}
          src="/background-music.mp3"
          loop
          autoPlay
        />
        <NavBar isMuted={isMuted} toggleMute={toggleMute} />
        <main className="flex-grow">
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
