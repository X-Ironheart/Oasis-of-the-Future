# 🌍 Integrated Smart Rural Village (Oasis of the Future)
**القرية الريفية الذكية المتكاملة**

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

> A cutting-edge, interactive 3D web application demonstrating a sustainable, net-zero, and circular economy model for future rural communities.

---

## 🎯 The Vision | الرؤية

The **Integrated Smart Rural Village** is a conceptual and educational 3D platform. It showcases how modern technology, renewable energy, and smart resource management can transform arid/rural regions into self-sustaining, zero-emission communities. The project emphasizes the **Water-Energy-Food Nexus** through interactive, real-time 3D visualizations.

## ✨ Key Features | المميزات الرئيسية

- **🎮 Interactive 3D WebGL:** Explore beautifully crafted low-poly environments running at a stable 60 FPS directly in the browser.
- **🌐 Full Bilingual Support (RTL/LTR):** Seamless toggling between English and Arabic using `react-i18next`.
- **📱 Pixel-Perfect Mobile-First Design:** Fully responsive UI utilizing fluid typography (`clamp()`) and thumb-friendly interactive controls.
- **☀️ Dynamic Weather & Lighting:** Cinematic lighting, soft shadows, and an interactive rain simulation system.
- **📚 Educational Insights:** Dedicated sections on every page explaining the environmental concepts and future IoT/AI integrations.

---

## 🏗️ Village Sectors | قطاعات القرية

The application is divided into five core interconnected zones, demonstrating a complete **Circular Economy**:

1. **🏠 Residential & Solar Energy Zone:**
   - Features Net-Zero Energy homes with Building-Integrated Photovoltaics (BIPV).
   - Concept: Smart Microgrids and energy self-sufficiency.
2. **💧 Water Harvesting & Storage System:**
   - Features a closed-loop rooftop rainwater catchment system, a transparent smart tank, and solar-powered pumps.
   - Concept: Zero-emission water distribution and groundwater preservation.
3. **🏜️ Desert & Wind Energy Zone:**
   - Features towering wind turbines transforming harsh desert winds into clean electricity.
   - Concept: Microclimate creation for desert greening and zero-emission power.
4. **🌿 Sustainable Agriculture Zone:**
   - Features organic crop beds, palm tree groves, and demand-based drip irrigation.
   - Concept: Pesticide-free regenerative farming and future Aquaponics integration.
5. **🐄 Animal Production & Biogas Zone:**
   - Features a livestock barn connected to an anaerobic Biodigester reactor.
   - Concept: Waste-to-Energy (capturing methane to produce biogas) and generating organic compost.

---

## 💻 Tech Stack | التقنيات المستخدمة

- **Frontend Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **3D Graphics:** Three.js + React Three Fiber (`@react-three/fiber`, `@react-three/drei`)
- **Styling:** Tailwind CSS (with global fluid typography constraints)
- **Animations:** Framer Motion
- **Internationalization:** `i18next` + `react-i18next`
- **Icons:** Lucide React

---

## 🚀 Getting Started | التشغيل المحلي

Follow these steps to run the project locally on your machine:

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn` or `pnpm`

### Installation

1. **Clone the repository** (or navigate to the project directory):
   ```bash
   cd smart-village-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` to explore the 3D village.

### Production Build
To create an optimized production bundle:
```bash
npm run build
npm run preview
```

---

## 🌱 Environmental Philosophy (Circular Economy)

This application is not just a visual showcase; it represents a functional **Circular Economy**:
- **Inputs:** Solar Radiation, Wind, Rainwater.
- **Processing:** Solar panels generate electricity for water pumps. Rainwater is harvested and irrigated precisely. Livestock waste is digested to create Biogas (Energy) and Organic Compost (Fertilizer).
- **Outputs:** Zero Waste, Net-Zero Emissions, Organic Food, Clean Energy, and Thriving Local Ecosystems.

---

## 👨‍💻 Development & Architecture Notes
- **Performance Optimization:** 3D models avoid heavy primitives (like default spheres/cylinders with high segments) in favor of optimized `boxGeometry` and low-segment meshes to maintain maximum FPS across mobile devices.
- **UI Overflow Prevention:** Strict `overflow-x: hidden` rules and `touch-action` considerations are implemented to prevent horizontal scrolling and ensure smooth dragging of the 3D canvas.

---

<div align="center">
  <b>Designed & Developed for the Oasis of the Future 🌴</b><br>
  <i>"Technology harmonizing with nature."</i>
</div>
