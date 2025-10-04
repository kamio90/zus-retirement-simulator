/**
 * ZUS Retirement Simulator — Web Application
 *
 * React + Vite + TypeScript frontend
 * - Wizard UI with Material Tailwind
 * - Framer Motion animations
 * - Beaver Coach assistant
 * - ZUS brand colors and accessible design
 */
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Wizard } from './components/wizard';
import { LegacyApp } from './LegacyApp';

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wizard" element={<Wizard />} />
        <Route path="/legacy" element={<LegacyApp />} />
      </Routes>
    </BrowserRouter>
  );
}

function HomePage(): JSX.Element {
  return (
    <div className="min-h-screen bg-zus-secondary flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <img
          src="/beaver.png"
          alt="Beaver Coach - twój przewodnik emerytalny"
          className="w-32 h-32 mx-auto mb-8 object-contain"
        />

        <h1 className="text-5xl font-bold text-zus-text mb-4">Symulator Emerytalny ZUS</h1>
        <p className="text-xl text-gray-600 mb-12">
          Profesjonalna kalkulacja przyszłej emerytury z pomocą Beaver Coach
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/wizard"
            className="px-8 py-4 bg-zus-primary text-white text-lg font-bold rounded-lg hover:bg-zus-accent focus:outline-none focus:ring-4 focus:ring-zus-primary focus:ring-opacity-50 transition-all shadow-lg hover:shadow-xl"
          >
            🚀 Rozpocznij kreator (v2)
          </Link>

          <Link
            to="/legacy"
            className="px-8 py-4 bg-white text-zus-primary text-lg font-semibold rounded-lg border-2 border-zus-primary hover:bg-zus-secondary focus:outline-none focus:ring-4 focus:ring-zus-primary focus:ring-opacity-50 transition-all"
          >
            📊 Klasyczny kalkulator (v1)
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-lg font-bold text-zus-text mb-2">Krok po kroku</h3>
            <p className="text-gray-600 text-sm">
              Intuicyjny kreator prowadzi Cię przez cały proces
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-4xl mb-3">🦫</div>
            <h3 className="text-lg font-bold text-zus-text mb-2">Beaver Coach</h3>
            <p className="text-gray-600 text-sm">Przyjazny asystent wyjaśnia każdy krok</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="text-lg font-bold text-zus-text mb-2">Dokładne wyniki</h3>
            <p className="text-gray-600 text-sm">Obliczenia oparte na oficjalnych danych ZUS</p>
          </div>
        </div>

        <footer className="mt-12 text-sm text-gray-500">
          ZUS Retirement Simulator - HackYeah 2025 | WCAG 2.1 AA Compliant
        </footer>
      </div>
    </div>
  );
}

export default App;
