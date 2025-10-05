/**
 * Step 4a - Quick Calculation Result
 * KPI grid, capital trajectory chart, and CTA cards for refinement
 * Now with instant what-if updates without navigation
 * Added Explain This overlay for contextual micro-lessons
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
import { useExplainOverlayStore } from '../../stores/explainOverlayStore';
import { useExplainer } from '../../hooks/useExplainer';
import { BeaverCoach } from './BeaverCoach';
import { KnowledgeCard } from './KnowledgeCard';
import { ExplainOverlay } from './ExplainOverlay';
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
  const { openExplainer, getCachedExplainer, cacheExplainer } = useExplainOverlayStore();
  const { fetchExplainer } = useExplainer();

  // Initialize baseline result from wizard store
  useEffect(() => {
    if (quickCalcResult && !baselineResult) {
      setBaselineResult(quickCalcResult as ScenarioResult);
    }
  }, [quickCalcResult, baselineResult, setBaselineResult]);

  // Cast to v2 ScenarioResult
  // Temporary: force using mock data instead of API
  const USE_MOCK_RESULT = true;
  const apiResult = USE_MOCK_RESULT
    ? null
    : (currentResult || (quickCalcResult as ScenarioResult | null));

  // Calculate delta from baseline
  const calculateDelta = (
    current: number,
    baseline: number
  ): { value: number; percent: number } => {
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

  // Handle explain click on KPI tiles
  const handleExplainClick = async (
    targetId: string,
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    const targetElement = event.currentTarget.closest('[data-kpi-tile]') as HTMLElement;
    if (!targetElement) return;

    // Check cache first
    const cached = getCachedExplainer(targetId);
    if (cached) {
      openExplainer(targetId, targetElement, cached);
      return;
    }

    // Fetch explainer content
    const explainer = await fetchExplainer(targetId, 'pl-PL');
    if (explainer) {
      cacheExplainer(targetId, explainer);
      openExplainer(targetId, targetElement, explainer);
    }
  };

  // Dynamic mock based on contractType and jdgIncome
  const computeMockResult = (
    type: string | undefined | null,
    income: number | undefined,
    currentAge: number | undefined,
    sex: string | undefined | null
  ) => {
    const monthlyIncome = typeof income === 'number' && income > 0 ? income : 5000;

    // Approximation of ZUS rules for mock purposes:
    // - UoP: pension contribution base ~ gross salary
    // - JDG/JDG_RYCZALT: base not lower than 60% of projected average wage
    //   Here we assume avg wage ~ 8000 PLN (placeholder for mock only), so minBase ~ 4800 PLN
    //   Multiplier ≈ contribution base (contract) / contribution base (UoP)
  // 2025 mock assumption: projected average monthly wage ≈ 7 824 PLN
  // JDG minimum base for pension/disability = 60% * projected average ≈ 4 694.40 PLN
  // NOTE: Replace with @data macro.json when available
  const ASSUMED_AVG_WAGE = 7824;
  const MIN_BASE_JDG = 0.6 * ASSUMED_AVG_WAGE; // 4 694.4 PLN
  const YEARLY_BASE_CAP = 30 * ASSUMED_AVG_WAGE; // roczny limit podstawy
  const MONTHLY_BASE_CAP = YEARLY_BASE_CAP / 12; // ≈ 2.5 x avg miesięczna

    const contributionBase = (t: string | undefined): number => {
      if (t === 'uop') return monthlyIncome;
      if (t === 'jdg' || t === 'jdg_ryczalt') return MIN_BASE_JDG;
      return MIN_BASE_JDG;
    };

  // Reference base used in the original static mock
  // Dynamic accumulation below derives from contribution base; no static reference base needed
  // Multiplier ties to contribution base vs reference base
  // - UoP scales with income
  // - JDG/JDG_RYCZALT pinned to legal minimum base
  // (removed) legacy scaling with REF_BASE

    // Dynamic capital trajectory: yearly accumulation until retirement
    const now = new Date();
    const currentYear = now.getFullYear();
  const retirementAge = sex === 'female' ? 60 : 65;
    const ageValue = typeof currentAge === 'number' && currentAge > 0 ? currentAge : 30;
    const yearsToRetire = Math.max(1, retirementAge - ageValue);
    const retirementYear = currentYear + yearsToRetire;

    // Mock rates for contributions and valorization
  const PENSION_RATE = 0.1952; // 19.52% (emerytalna+rentowa)
  const WAGE_GROWTH = 0.02; // 2% rocznie (przybliżenie wzrostu płac)
  const VALORIZATION = 0.02; // 2% rocznie (przybliżenie waloryzacji)

    let capital = 0;
    const capitalTrajectory: { year: number; capital: number }[] = [];
    for (let y = currentYear, i = 0; y <= retirementYear; y++, i++) {
      // Miesięczna podstawa w danym roku (z limitem 30x)
      const monthlyBaseRaw = (type === 'uop')
        ? (monthlyIncome * Math.pow(1 + WAGE_GROWTH, i))
        : (MIN_BASE_JDG * Math.pow(1 + WAGE_GROWTH, i)); // uproszczenie: min podstawa rośnie razem ze średnim
      const monthlyBaseCapped = Math.min(monthlyBaseRaw, MONTHLY_BASE_CAP);
      const annualContribution = monthlyBaseCapped * 12 * PENSION_RATE;
      capital = Math.round(capital * (1 + VALORIZATION) + annualContribution);
      capitalTrajectory.push({ year: y, capital });
    }

    // Derive mock pension from accumulated capital
  const lifeExpYears = sex === 'female' ? 23 : 20; // przybliżenie
    const nominalPension = Math.max(
      1200,
      Math.round(capital / Math.max(12, lifeExpYears * 12))
    );
    const realPension = Math.round(nominalPension * 0.8);
    const replacementRate = Math.min(
      99,
      Math.max(10, Math.round((realPension / Math.max(1, monthlyIncome)) * 100))
    );

    return {
      nominalPension,
      realPension,
      replacementRate,
      retirementYear,
      retirementQuarter: 3,
      capitalTrajectory,
    };
  };

  const mockResult = computeMockResult(contractType, jdgIncome, age, gender);

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

          // Map KPI to targetId for explainer
          const targetIdMap: { [key: string]: string } = {
            'Emerytura nominalna': 'kpi_nominal',
            'Emerytura realna (dzisiaj)': 'kpi_real',
            'Stopa zastąpienia': 'kpi_replacement',
            'Przejście na emeryturę': 'kpi_retirement_year',
          };
          const targetId = targetIdMap[kpi.label] || '';

          return (
            <motion.div key={index} variants={itemVariants}>
              <div
                data-kpi-tile
                className={`bg-white rounded-lg shadow-md p-6 text-center h-full hover:shadow-lg transition-shadow relative ${isLoadingWhatIf ? 'animate-pulse' : ''}`}
              >
                {/* Explain button */}
                {targetId && (
                  <button
                    onClick={(e) => handleExplainClick(targetId, e)}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-zus-primary hover:bg-gray-100 rounded-full transition-colors"
                    aria-label={`Wyjaśnij: ${kpi.label}`}
                  >
                    ℹ️
                  </button>
                )}
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

      <div className="bg-white rounded-lg shadow-md p-6 mb-8" data-kpi-tile>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-zus-text">Trajektoria kapitału emerytalnego</h3>
          <button
            onClick={(e) => handleExplainClick('chart_capital_trajectory', e)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-zus-primary hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Wyjaśnij: Trajektoria kapitału emerytalnego"
          >
            ℹ️
          </button>
        </div>
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
                activeDot={{
                  r: 8,
                  onClick: (e: React.MouseEvent<SVGCircleElement>) => {
                    const element = (e.target as HTMLElement).closest(
                      '[data-kpi-tile]'
                    ) as HTMLElement;
                    if (element) {
                      const fakeEvent = {
                        currentTarget: element,
                      } as React.MouseEvent<HTMLButtonElement>;
                      handleExplainClick('chart_point', fakeEvent);
                    }
                  },
                  style: { cursor: 'pointer' },
                }}
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
              <p className="text-sm text-yellow-800 mb-2">Dostępna tylko dla określonych zawodów</p>
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

      {/* Explain This Overlay */}
      <ExplainOverlay />
    </div>
  );
}
