/**
 * Step 4a - Quick Calculation Result
 * KPI grid, capital trajectory chart, and CTA cards for refinement
 */
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useWizardStore } from '../../store/wizardStore';
import { BeaverCoach } from './BeaverCoach';
import { KnowledgeCard } from './KnowledgeCard';
import type { ScenarioResult } from '@zus/types';

export function Step4aResult(): JSX.Element {
  const { quickCalcResult, setCurrentStep, contractType, gender, age } = useWizardStore();

  // Cast to v2 ScenarioResult
  const apiResult = quickCalcResult as ScenarioResult | null;

  const mockResult = {
    nominalPension: 3500,
    realPension: 2800,
    replacementRate: 58,
    retirementYear: 2053,
    retirementQuarter: 3,
    capitalTrajectory: [
      { year: 2025, capital: 0 },
      { year: 2030, capital: 45000 },
      { year: 2035, capital: 95000 },
      { year: 2040, capital: 158000 },
      { year: 2045, capital: 235000 },
      { year: 2050, capital: 328000 },
      { year: 2053, capital: 385000 },
    ],
  };

  // Extract KPIs from v2 result or use mock
  const kpis = apiResult
    ? [
        {
          label: 'Emerytura nominalna',
          value: `${Math.round(apiResult.kpi.monthlyNominal).toLocaleString('pl-PL')} PLN`,
          description: 'Przewidywana kwota emerytury w przyszłości',
          icon: '💰',
        },
        {
          label: 'Emerytura realna (dzisiaj)',
          value: `${Math.round(apiResult.kpi.monthlyRealToday).toLocaleString('pl-PL')} PLN`,
          description: 'Wartość w dzisiejszych pieniądzach',
          icon: '📊',
        },
        {
          label: 'Stopa zastąpienia',
          value: `${Math.round(apiResult.kpi.replacementRate * 100)}%`,
          description: 'Stosunek emerytury do ostatniego wynagrodzenia',
          icon: '📈',
        },
        {
          label: 'Przejście na emeryturę',
          value: `${apiResult.kpi.retirementYear} ${apiResult.kpi.claimQuarter}`,
          description: 'Rok i kwartał przejścia na emeryturę',
          icon: '🗓️',
        },
      ]
    : [
        {
          label: 'Emerytura nominalna',
          value: `${Math.round(mockResult.nominalPension).toLocaleString('pl-PL')} PLN`,
          description: 'Przewidywana kwota emerytury w przyszłości',
          icon: '💰',
        },
        {
          label: 'Emerytura realna (dzisiaj)',
          value: `${Math.round(mockResult.realPension).toLocaleString('pl-PL')} PLN`,
          description: 'Wartość w dzisiejszych pieniądzach',
          icon: '📊',
        },
        {
          label: 'Stopa zastąpienia',
          value: `${mockResult.replacementRate}%`,
          description: 'Stosunek emerytury do ostatniego wynagrodzenia',
          icon: '📈',
        },
        {
          label: 'Przejście na emeryturę',
          value: `${mockResult.retirementYear} Q${mockResult.retirementQuarter}`,
          description: 'Rok i kwartał przejścia na emeryturę',
          icon: '🗓️',
        },
      ];

  const ctaCards = [
    // Only show "Check higher ZUS" for JDG/JDG_RYCZALT contracts
    ...(contractType !== 'uop'
      ? [
          {
            title: 'Sprawdź wyższy ZUS',
            description: 'Oblicz ten sam dochód przy wyższej podstawie składkowej',
            action: () => setCurrentStep(5),
            icon: '📈',
          },
        ]
      : []),
    {
      title:
        contractType === 'uop'
          ? 'Porównaj z działalnością (JDG)'
          : 'Porównaj z umową o pracę (UoP)',
      description:
        contractType === 'uop'
          ? 'Zobacz jak wyglądałaby emerytura na działalności gospodarczej'
          : 'Zobacz jak wyglądałaby emerytura na umowie o pracę',
      action: () => setCurrentStep(5),
      icon: '💼',
    },
    {
      title: 'Doprecyzuj scenariusz',
      description: 'Dodaj podwyżki lub zmianę umowy dla dokładniejszego wyniku',
      action: () => setCurrentStep(5),
      icon: '🎯',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-zus-text mb-2">Wynik szybkiej kalkulacji</h2>
      <p className="text-gray-600 mb-8">
        Oto Twoja przewidywana emerytura na podstawie podanych danych
      </p>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {kpis.map((kpi, index) => (
          <motion.div key={index} variants={itemVariants}>
            <div className="bg-white rounded-lg shadow-md p-6 text-center h-full hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-3" role="img" aria-label={kpi.label}>
                {kpi.icon}
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">{kpi.label}</h3>
              <p className="text-2xl font-bold text-zus-primary mb-1">{kpi.value}</p>
              <p className="text-xs text-gray-500">{kpi.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-bold text-zus-text mb-4">Trajektoria kapitału emerytalnego</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={apiResult?.capitalTrajectory || mockResult.capitalTrajectory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d8e5dd" />
            <XAxis dataKey="year" stroke="#0b1f17" tick={{ fill: '#0b1f17' }} />
            <YAxis
              stroke="#0b1f17"
              tick={{ fill: '#0b1f17' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toLocaleString('pl-PL')} PLN`, 'Kapitał']}
              contentStyle={{
                backgroundColor: '#fff',
                border: '2px solid #007a33',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="capital"
              stroke="#007a33"
              strokeWidth={3}
              dot={{ fill: '#007a33', r: 5 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Wykres pokazuje przewidywane gromadzenie kapitału emerytalnego w czasie
        </p>
      </div>

      {/* Worth Knowing InfoCard - Load from API */}
      <KnowledgeCard stepId="step4a_result" className="mb-8" />

      {/* What-If Scenarios */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-zus-text mb-4">Scenariusze "co jeśli"</h3>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          {/* Early Retirement Card */}
          <motion.div variants={itemVariants}>
            <div
              onClick={() => setCurrentStep(5)}
              className="bg-blue-50 border-2 border-blue-300 rounded-lg shadow-md p-6 text-center h-full cursor-pointer hover:shadow-xl hover:ring-2 hover:ring-blue-500 transition-all"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setCurrentStep(5);
                }
              }}
            >
              <div className="text-5xl mb-3" role="img" aria-label="Wcześniejsza emerytura">
                ⏪
              </div>
              <h4 className="text-lg font-bold text-blue-900 mb-2">
                Emerytura 5 lat wcześniej
              </h4>
              <p className="text-sm text-blue-700">
                Zobacz jak zmieni się wysokość emerytury przy wcześniejszym przejściu na emeryturę
              </p>
            </div>
          </motion.div>

          {/* Delay +12 months Card */}
          <motion.div variants={itemVariants}>
            <div
              onClick={() => setCurrentStep(5)}
              className="bg-green-50 border-2 border-green-300 rounded-lg shadow-md p-6 text-center h-full cursor-pointer hover:shadow-xl hover:ring-2 hover:ring-green-500 transition-all"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setCurrentStep(5);
                }
              }}
            >
              <div className="text-5xl mb-3" role="img" aria-label="Opóźnienie +12 miesięcy">
                ⏩
              </div>
              <h4 className="text-lg font-bold text-green-900 mb-2">Opóźnij +12 miesięcy</h4>
              <p className="text-sm text-green-700">
                Sprawdź jak opóźnienie o rok wpłynie na wysokość emerytury
              </p>
            </div>
          </motion.div>

          {/* Delay +24 months Card */}
          <motion.div variants={itemVariants}>
            <div
              onClick={() => setCurrentStep(5)}
              className="bg-green-50 border-2 border-green-300 rounded-lg shadow-md p-6 text-center h-full cursor-pointer hover:shadow-xl hover:ring-2 hover:ring-green-500 transition-all"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setCurrentStep(5);
                }
              }}
            >
              <div className="text-5xl mb-3" role="img" aria-label="Opóźnienie +24 miesiące">
                ⏩⏩
              </div>
              <h4 className="text-lg font-bold text-green-900 mb-2">Opóźnij +24 miesiące</h4>
              <p className="text-sm text-green-700">
                Sprawdź jak opóźnienie o 2 lata wpłynie na wysokość emerytury
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-zus-text mb-4">Chcesz dokładniejszy wynik?</h3>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {ctaCards.map((cta, index) => (
            <motion.div key={index} variants={itemVariants}>
              <div
                onClick={cta.action}
                className="bg-white rounded-lg shadow-md p-6 text-center h-full cursor-pointer hover:shadow-xl hover:ring-2 hover:ring-zus-primary transition-all"
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    cta.action();
                  }
                }}
              >
                <div className="text-5xl mb-3" role="img" aria-label={cta.title}>
                  {cta.icon}
                </div>
                <h4 className="text-lg font-bold text-zus-text mb-2">{cta.title}</h4>
                <p className="text-sm text-gray-600">{cta.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <BeaverCoach
        message="Świetnie! To Twoja szybka kalkulacja. Możesz teraz doprecyzować scenariusz, dodając więcej szczegółów jak zmiany umowy czy podwyżki w karierze."
        tone="tip"
        pose="celebrate"
        ctaLabel="Doprecyzuj obliczenia"
        onCta={() => setCurrentStep(5)}
        stepId="step4a_result"
      />
    </div>
  );
}
