import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app.title": "Integrated Smart Rural Village",
      "nav.home": "Home",
      "nav.residential": "Residential & Solar",
      "nav.agriculture": "Sustainable Agriculture",
      "nav.water": "Water Harvesting",
      "nav.animal": "Animal Production",
      "nav.desert": "Desert & Wind",
      "hero.title": "Integrated Smart Rural Village Model",
      "hero.subtitle": "A Nexus of Water, Energy, and Climate Resilience",
      "hero.explore": "Explore the Village",
      "team.title": "Project Team",
    }
  },
  ar: {
    translation: {
      "app.title": "القرية الريفية الذكية المتكاملة",
      "nav.home": "الرئيسية",
      "nav.residential": "المنطقة السكنية والطاقة الشمسية",
      "nav.agriculture": "المنطقة الزراعية المستدامة",
      "nav.water": "نظام تجميع المياه",
      "nav.animal": "الإنتاج الحيواني",
      "nav.desert": "الصحراء وطاقة الرياح",
      "hero.title": "نموذج القرية الريفية الذكية المتكاملة",
      "hero.subtitle": "ترابط المياه والطاقة والمناخ في بيئة مستدامة",
      "hero.explore": "استكشف القرية",
      "team.title": "فريق العمل",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
