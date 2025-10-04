/**
 * ZUS Retirement Simulator — Web Application
 *
 * React + Vite + TypeScript frontend
 * - Form for user inputs (birthYear, gender, salary, etc.)
 * - Results display with charts (Recharts)
 * - PDF and XLS export functionality
 * - ZUS brand colors and accessible design
 */

function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-zus-secondary">
      {/* Header with ZUS branding and WCAG AA compliant contrast */}
      <header className="bg-zus-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Symulator Emerytalny ZUS</h1>
          <p className="mt-2 text-zus-secondary">Profesjonalna kalkulacja przyszłej emerytury</p>
        </div>
      </header>

      {/* Main content area */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-zus-primary mb-4">Kalkulator Emerytalny</h2>
          <p className="text-gray-700 leading-relaxed">
            Aplikacja frontendowa w React + Vite + TypeScript z Tailwind CSS. Obliczenia emerytur
            zgodne z zasadami ZUS, z uwzględnieniem waloryzacji rocznej i kwartalnej, tablic
            średniego dalszego trwania życia oraz rzeczywistych wskaźników makroekonomicznych.
          </p>

          {/* Accessible color showcase */}
          <div
            className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
            role="region"
            aria-label="Kolory marki ZUS"
          >
            <div className="bg-zus-primary text-white p-4 rounded-md">
              <p className="font-semibold">Kolor Główny</p>
              <p className="text-sm">#007a33</p>
            </div>
            <div className="bg-zus-secondary text-zus-accent border border-zus-primary p-4 rounded-md">
              <p className="font-semibold">Kolor Drugorzędny</p>
              <p className="text-sm">#e5f3e8</p>
            </div>
            <div className="bg-zus-accent text-white p-4 rounded-md">
              <p className="font-semibold">Kolor Akcentu</p>
              <p className="text-sm">#004c1d</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with accessibility info */}
      <footer className="bg-zus-accent text-white mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm">
            ZUS Retirement Simulator - HackYeah 2025 | WCAG 2.1 AA Compliant
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
