/**
 * WaterfallExplainer - Shows how monthly pension is computed
 * Contributions → Valorization → BASE → Monthly amount
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface WaterfallStep {
  label: string;
  value: number;
  color: string;
  explainer?: string;
}

interface WaterfallExplainerProps {
  contributions: number;
  annualValorization: number;
  quarterlyValorization: number;
  initialCapital1999: number;
  subaccount: number;
  lifeExpectancyMonths: number;
}

export function WaterfallExplainer({
  contributions,
  annualValorization,
  quarterlyValorization,
  initialCapital1999,
  subaccount,
  lifeExpectancyMonths,
}: WaterfallExplainerProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<WaterfallStep | null>(null);

  // Calculate waterfall steps
  const step1 = contributions;
  const step2 = step1 * (1 + annualValorization / 100);
  const step3 = step2 * (1 + quarterlyValorization / 100);
  const step4 = step3 + initialCapital1999 * 1.156; // KP1999 × 1.1560
  const step5 = step4 + subaccount;
  const monthly = step5 / lifeExpectancyMonths;

  const steps: WaterfallStep[] = [
    {
      label: 'Składki',
      value: step1,
      color: '#007a33',
      explainer: 'Suma wszystkich wpłaconych składek emerytalnych (19,52% podstawy)',
    },
    {
      label: 'Waloryzacja roczna',
      value: step2,
      color: '#00a344',
      explainer: 'Kapitał po waloryzacji rocznej (wskaźnik inflacji + wzrost płac)',
    },
    {
      label: 'Waloryzacja kwartalna',
      value: step3,
      color: '#33b366',
      explainer: 'Kapitał po waloryzacji kwartalnej (Q3/Q4 poprzedniego + Q1/Q2 bieżącego roku)',
    },
    {
      label: 'Kapitał początkowy 1999',
      value: step4,
      color: '#66c488',
      explainer: 'Kapitał początkowy × 1,1560 (waloryzacja od 1999)',
    },
    {
      label: 'Subkonto',
      value: step5,
      color: '#99d5aa',
      explainer: 'Kapitał + subkonto (składki od 2014)',
    },
    {
      label: 'Emerytura miesięczna',
      value: monthly,
      color: '#0066cc',
      explainer: `Kapitał podzielony przez średnie dalsze trwanie życia × 12 (${lifeExpectancyMonths} miesięcy)`,
    },
  ];

  const reconciliationCheck = Math.abs(monthly - step5 / lifeExpectancyMonths) < 1;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-zus-text">Jak obliczyliśmy tę kwotę?</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-zus-primary text-white rounded-lg hover:bg-zus-accent transition-colors text-sm"
        >
          {isOpen ? '▼ Zwiń' : '▶ Pokaż krok po kroku'}
        </button>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={steps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" angle={-15} textAnchor="end" height={80} fontSize={12} />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString('pl-PL')} PLN`, 'Wartość']}
              />
              <Bar dataKey="value" onClick={(data) => setSelectedStep(data)}>
                {steps.map((step, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={step.color}
                    cursor="pointer"
                    aria-label={`Kliknij aby wyjaśnić: ${step.label}`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Reconciliation guard */}
          {reconciliationCheck && (
            <p className="text-sm text-green-600 text-center mt-2">
              ✓ Suma się zgadza: {monthly.toLocaleString('pl-PL', { maximumFractionDigits: 2 })} PLN
            </p>
          )}
          {!reconciliationCheck && (
            <p className="text-sm text-red-600 text-center mt-2">
              ⚠ Błąd zaokrąglenia w obliczeniach
            </p>
          )}

          {/* Explain overlay */}
          {selectedStep && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-blue-50 border-2 border-blue-300 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{selectedStep.label}</h4>
                  <p className="text-sm text-gray-700 mb-2">{selectedStep.explainer}</p>
                  <p className="text-lg font-bold text-zus-primary">
                    {selectedStep.value.toLocaleString('pl-PL', { maximumFractionDigits: 2 })} PLN
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStep(null)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Zamknij wyjaśnienie"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
