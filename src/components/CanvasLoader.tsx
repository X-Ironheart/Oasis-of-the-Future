import { Html } from '@react-three/drei';
import { Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function CanvasLoader() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-sage rounded-3xl shadow-xl animate-pulse">
          <Leaf className="text-white w-10 h-10 animate-bounce" />
          {/* Ripple effect */}
          <div className="absolute inset-0 border-4 border-green-400 rounded-3xl animate-ping opacity-75"></div>
        </div>
        <div className="text-sage font-extrabold text-lg tracking-wider animate-pulse whitespace-nowrap drop-shadow-sm">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      </div>
    </Html>
  );
}
