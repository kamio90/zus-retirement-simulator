/**
 * ZUS Retirement Simulator — Web Application
 *
 * React + Vite + TypeScript frontend
 * - Form for user inputs (birthYear, gender, salary, etc.)
 * - Results display with charts (Recharts)
 * - PDF and XLS export functionality
 * - ZUS brand colors and accessible design
 */
import { useState } from 'react';
import type { SimulationResult, SimulateRequest } from '@zus/types';
import { SimulatorForm } from './components/SimulatorForm';
import { ResultsDisplay } from './components/ResultsDisplay';

function App(): JSX.Element {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [input, setInput] = useState<SimulateRequest | null>(null);

  const handleResult = (newResult: SimulationResult, newInput: SimulateRequest): void => {
    setResult(newResult);
    setInput(newInput);
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleNewCalculation = (): void => {
    setResult(null);
    setInput(null);
    // Scroll to form
    setTimeout(() => {
      document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

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
        {/* Simulator Form */}
        <div id="form" className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-zus-primary mb-4">Kalkulator Emerytalny</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Wypełnij formularz, aby obliczyć swoją przyszłą emeryturę na podstawie rzeczywistych
            danych makroekonomicznych i zasad ZUS.
          </p>
          <SimulatorForm onResult={handleResult} />
        </div>

        {/* Results Display */}
        {result && input && (
          <div id="results">
            <ResultsDisplay result={result} input={input} />
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleNewCalculation}
                className="px-6 py-2 bg-zus-accent text-white font-semibold rounded-md hover:bg-zus-primary focus:outline-none focus:ring-2 focus:ring-zus-accent focus:ring-offset-2 transition-colors"
              >
                Nowa symulacja
              </button>
            </div>
          </div>
        )}
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
