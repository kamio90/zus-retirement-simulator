/**
 * Step 4a - Quick Calculation Result
 * KPI grid, capital trajectory chart, and CTA cards for refinement
 * Now with instant what-if updates without navigation
 */
import { useEffect } from 'react';
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
import { useResultStore } from '../../stores/resultStore';
import { BeaverCoach } from './BeaverCoach';
import { KnowledgeCard } from './KnowledgeCard';
import { compareWhatIf } from '../../services/v2-api';
import type { ScenarioResult, WizardJdgRequest, RefinementItem } from '@zus/types';

export function Step4aResult(): JSX.Element {
  const { quickCalcResult, setCurrentStep, contractType, gender, age, jdgIncome, isRyczalt } =
    useWizardStore();
  const {
    baselineResult,
    currentResult,
    appliedWhatIf,
    isLoadingWhatIf,
    whatIfError,
    setBaselineResult,
    setCurrentResult,
    setAppliedWhatIf,
    restoreBaseline,
    cacheWhatIfResult,
    getCachedWhatIf,
    setLoadingWhatIf,
    setWhatIfError,
  } = useResultStore();

  // Initialize baseline result from wizard store
  useEffect(() => {
    if (quickCalcResult && !baselineResult) {
      setBaselineResult(quickCalcResult as ScenarioResult);
    }
  }, [quickCalcResult, baselineResult, setBaselineResult]);

  // Cast to v2 ScenarioResult
  const apiResult = currentResult || (quickCalcResult as ScenarioResult | null);

  // Calculate delta from baseline
  const calculateDelta = (current: number, baseline: number): { value: number; percent: number } => {
    const value = current - baseline;
    const percent = baseline !== 0 ? (value / baseline) * 100 : 0;
    return { value, percent };
  };

  // Build baseline context for what-if API
  const buildBaselineContext = (): WizardJdgRequest => {
    const genderMap: { [key: string]: 'M' | 'F' } = {
      male: 'M',
      female: 'F',
    };
    const contractMap: { [key: string]: 'UOP' | 'JDG' | 'JDG_RYCZALT' } = {
      uop: 'UOP',
      jdg: 'JDG',
      jdg_ryczalt: 'JDG_RYCZALT',
    };

    return {
      gender: genderMap[gender || 'male'],
      age: age || 30,
      contract: contractMap[contractType || 'jdg'],
      monthlyIncome: jdgIncome || 5000,
      isRyczalt: isRyczalt || false,
    };
  };

  // Handle what-if scenario click
  const handleWhatIf = async (item: RefinementItem, whatIfKey: string): Promise<void> => {
    // Check cache first
    const cached = getCachedWhatIf(whatIfKey);
    if (cached) {
      setCurrentResult(cached);
      setAppliedWhatIf(whatIfKey);
      return;
    }

    setLoadingWhatIf(true);
    setWhatIfError(null);

    try {
      const baselineContext = buildBaselineContext();
      const response = await compareWhatIf({
        baselineContext,
        items: [item],
      });

      // The first variant is our what-if result
      const whatIfResult = response.variants[0];
      setCurrentResult(whatIfResult);
      setAppliedWhatIf(whatIfKey);
      cacheWhatIfResult(whatIfKey, whatIfResult);
    } catch (error) {
      console.error('What-if calculation failed:', error);
      setWhatIfError(error instanceof Error ? error.message : 'Wystąpił błąd podczas obliczeń');
    } finally {
      setLoadingWhatIf(false);
    }
  };

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
          baselineValue: baselineResult?.kpi.monthlyNominal || apiResult.kpi.monthlyNominal,
          currentValue: apiResult.kpi.monthlyNominal,
          description: 'Przewidywana kwota emerytury w przyszłości',
          icon: '💰',
        },
        {
          label: 'Emerytura realna (dzisiaj)',
          value: `${Math.round(apiResult.kpi.monthlyRealToday).toLocaleString('pl-PL')} PLN`,
          baselineValue: baselineResult?.kpi.monthlyRealToday || apiResult.kpi.monthlyRealToday,
          currentValue: apiResult.kpi.monthlyRealToday,
          description: 'Wartość w dzisiejszych pieniądzach',
          icon: '📊',
        },
        {
          label: 'Stopa zastąpienia',
          value: `${Math.round(apiResult.kpi.replacementRate * 100)}%`,
          baselineValue: baselineResult?.kpi.replacementRate
            ? baselineResult.kpi.replacementRate * 100
            : apiResult.kpi.replacementRate * 100,
          currentValue: apiResult.kpi.replacementRate * 100,
          description: 'Stosunek emerytury do ostatniego wynagrodzenia',
          icon: '📈',
        },
        {
          label: 'Przejście na emeryturę',
          value: `${apiResult.kpi.retirementYear} ${apiResult.kpi.claimQuarter}`,
          baselineValue: 0,
          currentValue: 0,
          description: 'Rok i kwartał przejścia na emeryturę',
          icon: '🗓️',
          noDelta: true, // Don't show delta for year/quarter
        },
      ]
    : [
        {
          label: 'Emerytura nominalna',
          value: `${Math.round(mockResult.nominalPension).toLocaleString('pl-PL')} PLN`,
          baselineValue: mockResult.nominalPension,
          currentValue: mockResult.nominalPension,
          description: 'Przewidywana kwota emerytury w przyszłości',
          icon: '💰',
        },
        {
          label: 'Emerytura realna (dzisiaj)',
          value: `${Math.round(mockResult.realPension).toLocaleString('pl-PL')} PLN`,
          baselineValue: mockResult.realPension,
          currentValue: mockResult.realPension,
          description: 'Wartość w dzisiejszych pieniądzach',
          icon: '📊',
        },
        {
          label: 'Stopa zastąpienia',
          value: `${mockResult.replacementRate}%`,
          baselineValue: mockResult.replacementRate,
          currentValue: mockResult.replacementRate,
          description: 'Stosunek emerytury do ostatniego wynagrodzenia',
          icon: '📈',
        },
        {
          label: 'Przejście na emeryturę',
          value: `${mockResult.retirementYear} Q${mockResult.retirementQuarter}`,
          baselineValue: 0,
          currentValue: 0,
          description: 'Rok i kwartał przejścia na emeryturę',
          icon: '🗓️',
          noDelta: true,
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

      {/* Back to baseline button */}
      {appliedWhatIf && (
        <div className="mb-4">
          <button
            onClick={restoreBaseline}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-zus-primary"
            aria-label="Przywróć wynik bazowy"
          >
            ← Powrót do bazowego wyniku
          </button>
        </div>
      )}

      {/* Error banner */}
      {whatIfError && (
        <div
          className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-800"
          role="alert"
        >
          <p className="font-semibold">Błąd obliczeń scenariusza</p>
          <p className="text-sm">{whatIfError}</p>
        </div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        aria-live="polite"
        aria-atomic="true"
      >
        {kpis.map((kpi, index) => {
          const delta =
            !kpi.noDelta && appliedWhatIf
              ? calculateDelta(kpi.currentValue, kpi.baselineValue)
              : null;

          return (
            <motion.div key={index} variants={itemVariants}>
              <div
                className={`bg-white rounded-lg shadow-md p-6 text-center h-full hover:shadow-lg transition-shadow ${isLoadingWhatIf ? 'animate-pulse' : ''}`}
              >
                <div className="text-4xl mb-3" role="img" aria-label={kpi.label}>
                  {kpi.icon}
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">{kpi.label}</h3>
                <p className="text-2xl font-bold text-zus-primary mb-1">{kpi.value}</p>
                {delta && (
                  <div
                    className={`text-xs font-semibold mt-2 ${delta.value > 0 ? 'text-green-600' : delta.value < 0 ? 'text-red-600' : 'text-gray-500'}`}
                  >
                    {delta.value > 0 ? '↑' : delta.value < 0 ? '↓' : '='}{' '}
                    {Math.abs(delta.percent).toFixed(1)}%
                  </div>
                )}
                <p className="text-xs text-gray-500">{kpi.description}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-bold text-zus-text mb-4">Trajektoria kapitału emerytalnego</h3>
        <div className={isLoadingWhatIf ? 'animate-pulse' : ''}>
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
                stroke={appliedWhatIf ? '#0066cc' : '#007a33'}
                strokeWidth={3}
                dot={{ fill: appliedWhatIf ? '#0066cc' : '#007a33', r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Wykres pokazuje przewidywane gromadzenie kapitału emerytalnego w czasie
          {appliedWhatIf && (
            <span className="block mt-1 text-blue-600 font-semibold">
              Scenariusz: {appliedWhatIf}
            </span>
          )}
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
          {/* Early Retirement Card - Yellow warning style for Issue 4 */}
          <motion.div variants={itemVariants}>
            <div
              onClick={() =>
                handleWhatIf({ kind: 'early_retirement', years: 5 }, 'early_retirement_5y')
              }
              className={`bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow-md p-6 text-center h-full cursor-pointer hover:shadow-xl hover:ring-2 hover:ring-yellow-500 transition-all ${appliedWhatIf === 'early_retirement_5y' ? 'ring-2 ring-yellow-500' : ''}`}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleWhatIf({ kind: 'early_retirement', years: 5 }, 'early_retirement_5y');
                }
              }}
              aria-label="Emerytura pomostowa - wcześniejsza o 5 lat"
            >
              <div className="text-5xl mb-3" role="img" aria-label="Wcześniejsza emerytura">
                ⏪
              </div>
              <h4 className="text-lg font-bold text-yellow-900 mb-2">
                Emerytura pomostowa (wcześniejsza)
              </h4>
              <p className="text-sm text-yellow-800 mb-2">
                Dostępna tylko dla określonych zawodów
              </p>
              <p className="text-xs text-yellow-700">
                Zobacz jak zmieni się wysokość emerytury przy wcześniejszym przejściu na emeryturę
              </p>
              {appliedWhatIf === 'early_retirement_5y' && (
                <span className="inline-block mt-2 px-2 py-1 bg-yellow-200 text-yellow-900 text-xs font-semibold rounded">
                  Zastosowano
                </span>
              )}
            </div>
          </motion.div>

          {/* Delay +12 months Card */}
          <motion.div variants={itemVariants}>
            <div
              onClick={() => handleWhatIf({ kind: 'delay_months', months: 12 }, 'delay_12m')}
              className={`bg-green-50 border-2 border-green-300 rounded-lg shadow-md p-6 text-center h-full cursor-pointer hover:shadow-xl hover:ring-2 hover:ring-green-500 transition-all ${appliedWhatIf === 'delay_12m' ? 'ring-2 ring-green-500' : ''}`}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleWhatIf({ kind: 'delay_months', months: 12 }, 'delay_12m');
                }
              }}
              aria-label="Opóźnienie emerytury o 12 miesięcy"
            >
              <div className="text-5xl mb-3" role="img" aria-label="Opóźnienie +12 miesięcy">
                ⏩
              </div>
              <h4 className="text-lg font-bold text-green-900 mb-2">Opóźnij +12 miesięcy</h4>
              <p className="text-sm text-green-700">
                Sprawdź jak opóźnienie o rok wpłynie na wysokość emerytury
              </p>
              {appliedWhatIf === 'delay_12m' && (
                <span className="inline-block mt-2 px-2 py-1 bg-green-200 text-green-900 text-xs font-semibold rounded">
                  Zastosowano
                </span>
              )}
            </div>
          </motion.div>

          {/* Delay +24 months Card */}
          <motion.div variants={itemVariants}>
            <div
              onClick={() => handleWhatIf({ kind: 'delay_months', months: 24 }, 'delay_24m')}
              className={`bg-green-50 border-2 border-green-300 rounded-lg shadow-md p-6 text-center h-full cursor-pointer hover:shadow-xl hover:ring-2 hover:ring-green-500 transition-all ${appliedWhatIf === 'delay_24m' ? 'ring-2 ring-green-500' : ''}`}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleWhatIf({ kind: 'delay_months', months: 24 }, 'delay_24m');
                }
              }}
              aria-label="Opóźnienie emerytury o 24 miesiące"
            >
              <div className="text-5xl mb-3" role="img" aria-label="Opóźnienie +24 miesiące">
                ⏩⏩
              </div>
              <h4 className="text-lg font-bold text-green-900 mb-2">Opóźnij +24 miesiące</h4>
              <p className="text-sm text-green-700">
                Sprawdź jak opóźnienie o 2 lata wpłynie na wysokość emerytury
              </p>
              {appliedWhatIf === 'delay_24m' && (
                <span className="inline-block mt-2 px-2 py-1 bg-green-200 text-green-900 text-xs font-semibold rounded">
                  Zastosowano
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Early retirement disclaimer banner when applied */}
        {appliedWhatIf === 'early_retirement_5y' && (
          <div
            className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-yellow-900"
            role="alert"
          >
            <p className="font-semibold">ℹ️ Informacja o emeryturze pomostowej</p>
            <p className="text-sm mt-1">
              Emerytura pomostowa jest dostępna tylko dla osób wykonujących prace w szczególnych
              warunkach lub o szczególnym charakterze. Uprawnienia zależą od zawodu i okresu pracy.{' '}
              <a
                href="https://www.zus.pl/emerytura/emerytura-pomostowa"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                Dowiedz się więcej
              </a>
            </p>
          </div>
        )}
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

        {/* Refine Scenario button for JDG - gated behind explicit click */}
        {contractType !== 'uop' && (
          <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <h4 className="text-lg font-bold text-blue-900 mb-2">
              📊 Chcesz jeszcze dokładniejszy wynik?
            </h4>
            <p className="text-sm text-blue-700 mb-3">
              Dodaj szczegółową historię kariery, podwyżki, zmiany umów i okresy nieaktywności dla
              najbardziej precyzyjnych obliczeń
            </p>
            <button
              onClick={() => setCurrentStep(5)}
              className="w-full px-4 py-3 bg-zus-primary text-white font-semibold rounded-md hover:bg-zus-accent transition-colors focus:outline-none focus:ring-2 focus:ring-zus-primary"
            >
              🎯 Doprecyzuj scenariusz (zaawansowane)
            </button>
          </div>
        )}
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
