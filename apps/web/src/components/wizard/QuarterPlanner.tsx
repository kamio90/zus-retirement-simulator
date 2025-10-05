/**
 * QuarterPlanner - Interactive quarter selection heatmap
 * Shows pension amount per quarter, click to apply
 */
import { useState } from 'react';
import { motion } from 'framer-motion';

interface QuarterCell {
  quarter: 1 | 2 | 3 | 4;
  year: number;
  amount: number;
  label: string;
}

interface QuarterPlannerProps {
  currentYear: number;
  baseAmount: number;
  onQuarterSelect: (year: number, quarter: 1 | 2 | 3 | 4) => void;
  selectedQuarter?: { year: number; quarter: 1 | 2 | 3 | 4 };
}

export function QuarterPlanner({
  currentYear,
  baseAmount,
  onQuarterSelect,
  selectedQuarter,
}: QuarterPlannerProps): JSX.Element {
  const [showExplainer, setShowExplainer] = useState(false);

  // Generate quarter cells with mock variance
  // In real implementation, this would come from API
  const generateQuarters = (year: number): QuarterCell[] => {
    const quarters: QuarterCell[] = [];
    const baseVariance = year === currentYear ? 1.0 : 0.98; // Previous year slightly lower

    for (let q = 1; q <= 4; q++) {
      // Q3 and Q4 of previous year + Q1 and Q2 of current year get applied
      const isOptimalPrevYear = year === currentYear - 1 && (q === 3 || q === 4);
      const isOptimalCurrYear = year === currentYear && (q === 1 || q === 2);
      const multiplier = isOptimalPrevYear || isOptimalCurrYear ? 1.02 : 1.0;

      quarters.push({
        quarter: q as 1 | 2 | 3 | 4,
        year,
        amount: baseAmount * baseVariance * multiplier,
        label: `Q${q} ${year}`,
      });
    }

    return quarters;
  };

  const prevYearQuarters = generateQuarters(currentYear - 1);
  const currYearQuarters = generateQuarters(currentYear);

  const allQuarters = [...prevYearQuarters, ...currYearQuarters];

  const getHeatColor = (amount: number): string => {
    const max = Math.max(...allQuarters.map((q) => q.amount));
    const min = Math.min(...allQuarters.map((q) => q.amount));
    const ratio = (amount - min) / (max - min);

    if (ratio > 0.9) return 'bg-green-200 border-green-400';
    if (ratio > 0.7) return 'bg-green-100 border-green-300';
    if (ratio > 0.5) return 'bg-yellow-100 border-yellow-300';
    if (ratio > 0.3) return 'bg-orange-100 border-orange-300';
    return 'bg-red-100 border-red-300';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-zus-text">Planner kwartałów</h3>
          <p className="text-sm text-gray-600">
            Wybierz kwartał przejścia na emeryturę (kliknij komórkę)
          </p>
        </div>
        <button
          onClick={() => setShowExplainer(!showExplainer)}
          className="text-sm text-zus-primary hover:underline"
        >
          {showExplainer ? '▼ Ukryj wyjaśnienie' : '▶ Dlaczego kwartał ma znaczenie?'}
        </button>
      </div>

      {showExplainer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-blue-50 rounded-lg p-4 mb-4 text-sm text-gray-700"
        >
          <p className="mb-2">
            <strong>🦫 Beaver wyjaśnia:</strong>
          </p>
          <p>
            Kwartał przejścia na emeryturę wpływa na wysokość emerytury poprzez{' '}
            <strong>waloryzację kwartalną</strong>. ZUS stosuje waloryzację z:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Q3 i Q4 roku poprzedniego</li>
            <li>Q1 i Q2 roku bieżącego</li>
          </ul>
          <p className="mt-2">
            Dlatego przejście w Q1 lub Q2 może dać nieco wyższą emeryturę niż w Q3 lub Q4.
          </p>
        </motion.div>
      )}

      {/* Heatmap Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {allQuarters.map((cell) => {
          const isSelected =
            selectedQuarter?.year === cell.year && selectedQuarter?.quarter === cell.quarter;

          return (
            <motion.button
              key={`${cell.year}-Q${cell.quarter}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onQuarterSelect(cell.year, cell.quarter)}
              className={`p-3 rounded-lg border-2 transition-all ${getHeatColor(cell.amount)} ${
                isSelected ? 'ring-4 ring-zus-primary' : ''
              }`}
              aria-label={`Wybierz ${cell.label}: ${Math.round(cell.amount).toLocaleString('pl-PL')} PLN`}
            >
              <div className="text-xs font-semibold text-gray-700 mb-1">{cell.label}</div>
              <div className="text-sm font-bold text-gray-900">
                {Math.round(cell.amount).toLocaleString('pl-PL')}
              </div>
              <div className="text-xs text-gray-600">PLN</div>
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
          <span>Najwyższe</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span>Średnie</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span>Najniższe</span>
        </div>
      </div>

      {selectedQuarter && (
        <p className="text-sm text-center mt-4 text-green-700 font-semibold">
          ✓ Wybrano: Q{selectedQuarter.quarter} {selectedQuarter.year}
        </p>
      )}
    </div>
  );
}
