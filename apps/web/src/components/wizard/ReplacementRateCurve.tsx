/**
 * ReplacementRateCurve - RR vs retirement age with scrubber
 * Allows user to see how retirement age affects replacement rate
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ReplacementRateCurveProps {
  statutoryAge: number;
  currentAge: number;
  baseRR: number;
  onAgeSelect: (age: number) => void;
}

export function ReplacementRateCurve({
  statutoryAge,
  currentAge,
  baseRR,
  onAgeSelect,
}: ReplacementRateCurveProps): JSX.Element {
  const [selectedAge, setSelectedAge] = useState(currentAge);
  const [isPreview, setIsPreview] = useState(false);

  // Generate RR curve data (statutory-5 to statutory+5)
  const generateCurve = (): Array<{ age: number; rr: number }> => {
    const data: Array<{ age: number; rr: number }> = [];
    const minAge = statutoryAge - 5;
    const maxAge = statutoryAge + 5;

    for (let age = minAge; age <= maxAge; age++) {
      // Simple model: RR increases with age (more years = more capital)
      const yearsDiff = age - currentAge;
      const rrMultiplier = 1 + yearsDiff * 0.03; // 3% increase per year
      data.push({ age, rr: baseRR * rrMultiplier });
    }

    return data;
  };

  const curveData = generateCurve();
  const selectedData = curveData.find((d) => d.age === selectedAge);

  const handleSliderChange = (value: number): void => {
    setSelectedAge(value);
    setIsPreview(true);
  };

  const handleApply = (): void => {
    onAgeSelect(selectedAge);
    setIsPreview(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-zus-text mb-4">
        Stopa zastąpienia vs wiek emerytalny
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={curveData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="age"
            label={{ value: 'Wiek emerytalny', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            label={{ value: 'Stopa zastąpienia (%)', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => `${value.toFixed(0)}%`}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Stopa zastąpienia']}
            labelFormatter={(label) => `Wiek: ${label} lat`}
          />
          <Line
            type="monotone"
            dataKey="rr"
            stroke="#007a33"
            strokeWidth={3}
            dot={{ fill: '#007a33', r: 4 }}
          />
          <ReferenceLine
            x={selectedAge}
            stroke="#0066cc"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{ value: `${selectedAge} lat`, position: 'top', fill: '#0066cc' }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Slider */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="age-slider" className="text-sm font-semibold text-gray-700">
            Wybierz wiek: <span className="text-zus-primary">{selectedAge} lat</span>
          </label>
          {selectedData && (
            <span className="text-sm text-gray-600">
              Stopa zastąpienia: <strong>{selectedData.rr.toFixed(1)}%</strong>
            </span>
          )}
        </div>
        <input
          id="age-slider"
          type="range"
          min={statutoryAge - 5}
          max={statutoryAge + 5}
          value={selectedAge}
          onChange={(e) => handleSliderChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-zus-primary"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{statutoryAge - 5} lat</span>
          <span>{statutoryAge} lat (ustawowy)</span>
          <span>{statutoryAge + 5} lat</span>
        </div>
      </div>

      {/* Apply button */}
      {isPreview && selectedAge !== currentAge && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleApply}
          className="mt-4 w-full px-4 py-3 bg-zus-primary text-white font-semibold rounded-lg hover:bg-zus-accent transition-colors"
        >
          Zastosuj wiek {selectedAge} lat
        </motion.button>
      )}

      {selectedAge !== currentAge && (
        <p className="text-sm text-gray-600 mt-4 text-center">
          {selectedAge < currentAge
            ? '⚠️ Wcześniejsza emerytura może obniżyć wysokość świadczenia'
            : '✅ Opóźnienie emerytury zwiększa miesięczną kwotę'}
        </p>
      )}
    </div>
  );
}
