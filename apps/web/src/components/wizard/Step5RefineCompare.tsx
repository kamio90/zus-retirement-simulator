/**
 * Step 5 - Refine & Compare
 * Add multiple career periods for detailed scenario calculation
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizardStore, ContractType, CareerPeriod } from '../../store/wizardStore';
import { BeaverCoach } from './BeaverCoach';
import { InfoCard } from './InfoCard';
import { simulateV2 } from '../../services/v2-api';
import type {
  SimulateV2Request,
  SimulateV2Response,
  WizardJdgRequest,
  ContractTypeV2,
} from '@zus/types';

export function Step5RefineCompare(): JSX.Element {
  const {
    careerPeriods,
    addCareerPeriod,
    removeCareerPeriod,
    gender,
    age,
    contractType,
    jdgIncome,
    isRyczalt,
  } = useWizardStore();

  const [newPeriod, setNewPeriod] = useState<Omit<CareerPeriod, 'id'>>({
    contractType: 'uop',
    yearsOfWork: 5,
    monthlyIncome: 5000,
  });

  const [isComputing, setIsComputing] = useState(false);
  const [computeError, setComputeError] = useState<string | null>(null);
  const [computeResult, setComputeResult] = useState<SimulateV2Response | null>(null);
  const [correlationId, setCorrelationId] = useState<string | null>(null);

  const contractTypeLabels: Record<ContractType, string> = {
    uop: 'Umowa o pracę (UoP)',
    jdg: 'Działalność (JDG)',
    jdg_ryczalt: 'Działalność (JDG - ryczałt)',
  };

  // Filter available contract types - no ryczałt for UoP
  const getAvailableContractTypes = (): ContractType[] => {
    // If current selection is UoP, don't show JDG_RYCZALT
    if (newPeriod.contractType === 'uop') {
      return ['uop', 'jdg'];
    }
    return ['uop', 'jdg', 'jdg_ryczalt'];
  };

  const handleAddPeriod = (): void => {
    if (newPeriod.yearsOfWork > 0 && newPeriod.monthlyIncome > 0) {
      addCareerPeriod(newPeriod);
      setNewPeriod({
        contractType: 'uop',
        yearsOfWork: 5,
        monthlyIncome: 5000,
      });
    }
  };

  const totalYears = careerPeriods.reduce((sum, p) => sum + p.yearsOfWork, 0);
  const avgIncome =
    careerPeriods.length > 0
      ? Math.round(
          careerPeriods.reduce((sum, p) => sum + p.monthlyIncome, 0) / careerPeriods.length
        )
      : 0;

  // Map local contract type to API ContractTypeV2
  const mapToContractV2 = (type: ContractType): ContractTypeV2 => {
    switch (type) {
      case 'uop':
        return 'UOP';
      case 'jdg':
        return 'JDG';
      case 'jdg_ryczalt':
        return 'JDG_RYCZALT';
      default:
        return 'UOP';
    }
  };

  // Handle final compute
  const handleComputePrecisePension = async (): Promise<void> => {
    if (!gender || !age || !contractType || careerPeriods.length === 0) {
      setComputeError('Brak wymaganych danych do obliczeń');
      return;
    }

    setIsComputing(true);
    setComputeError(null);
    const corrId = `compute-${Date.now()}`;
    setCorrelationId(corrId);

    try {
      // Build baseline context from wizard state
      const baselineContext: WizardJdgRequest = {
        gender: gender === 'male' ? 'M' : 'F',
        age,
        contract: mapToContractV2(contractType),
        monthlyIncome: jdgIncome,
        isRyczalt,
        claimMonth: 6, // Default to June
      };

      // For now, we're not mapping career periods to variants
      // This would require additional logic to convert CareerPeriod to RefinementItem
      const request: SimulateV2Request = {
        baselineContext,
        // variants: [], // TODO: Map career periods to refinement items
      };

      const result = await simulateV2(request, corrId);
      setComputeResult(result);
      setComputeError(null);
    } catch (error) {
      console.error('Compute failed:', error);
      setComputeError(
        error instanceof Error ? error.message : 'Wystąpił błąd podczas obliczeń. Spróbuj ponownie.'
      );
    } finally {
      setIsComputing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-zus-text mb-2">Doprecyzuj i porównaj</h2>
      <p className="text-gray-600 mb-8">
        Dodaj różne okresy kariery, aby uzyskać dokładniejszy wynik
      </p>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold text-zus-text mb-4">Dodaj okres kariery</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Typ umowy</label>
            <select
              value={newPeriod.contractType}
              onChange={(e) =>
                setNewPeriod({ ...newPeriod, contractType: e.target.value as ContractType })
              }
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zus-primary focus:border-transparent"
            >
              {getAvailableContractTypes().map((type) => (
                <option key={type} value={type}>
                  {contractTypeLabels[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="years-input" className="block text-sm font-medium text-gray-700 mb-2">
              Lata pracy
            </label>
            <input
              id="years-input"
              type="number"
              min="1"
              max="50"
              value={newPeriod.yearsOfWork}
              onChange={(e) => setNewPeriod({ ...newPeriod, yearsOfWork: Number(e.target.value) })}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zus-primary focus:border-transparent"
              aria-label="Liczba lat pracy w tym okresie"
            />
          </div>

          <div>
            <label htmlFor="income-input" className="block text-sm font-medium text-gray-700 mb-2">
              Miesięczny dochód (PLN)
            </label>
            <input
              id="income-input"
              type="number"
              min="0"
              max="1000000"
              step="100"
              value={newPeriod.monthlyIncome}
              onChange={(e) =>
                setNewPeriod({ ...newPeriod, monthlyIncome: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zus-primary focus:border-transparent"
              aria-label="Miesięczny dochód w tym okresie"
            />
          </div>
        </div>

        <button
          onClick={handleAddPeriod}
          disabled={newPeriod.yearsOfWork <= 0 || newPeriod.monthlyIncome <= 0}
          className="mt-4 w-full md:w-auto px-6 py-2 bg-zus-primary text-white font-semibold rounded-md hover:bg-zus-accent focus:outline-none focus:ring-2 focus:ring-zus-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ➕ Dodaj okres
        </button>
      </div>

      {careerPeriods.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-zus-text mb-4">
            Twoje okresy kariery ({careerPeriods.length})
          </h3>

          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {careerPeriods.map((period, index) => (
                <motion.div
                  key={period.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-zus-primary text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Typ umowy</p>
                      <p className="font-semibold text-sm">
                        {contractTypeLabels[period.contractType]}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Lata pracy</p>
                      <p className="font-semibold text-sm">{period.yearsOfWork} lat</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Dochód miesięczny</p>
                      <p className="font-semibold text-sm">
                        {period.monthlyIncome.toLocaleString('pl-PL')} PLN
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeCareerPeriod(period.id)}
                    className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label={`Usuń okres ${index + 1}`}
                  >
                    🗑️
                  </button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          <div className="mt-6 p-4 bg-zus-secondary border-2 border-zus-primary rounded-lg">
            <h4 className="font-bold text-zus-text mb-2">Podsumowanie kariery</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Łącznie lat pracy:</p>
                <p className="text-lg font-bold text-zus-primary">{totalYears} lat</p>
              </div>
              <div>
                <p className="text-gray-600">Średni dochód:</p>
                <p className="text-lg font-bold text-zus-primary">
                  {avgIncome.toLocaleString('pl-PL')} PLN
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {careerPeriods.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={handleComputePrecisePension}
            disabled={isComputing}
            className="w-full py-4 bg-zus-accent text-white text-lg font-bold rounded-lg hover:bg-zus-primary focus:outline-none focus:ring-4 focus:ring-zus-primary focus:ring-opacity-50 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isComputing ? '⏳ Obliczanie...' : '🎯 Oblicz dokładną emeryturę'}
          </button>

          {computeError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg"
              role="alert"
            >
              <p className="text-red-900 font-semibold">❌ Błąd obliczeń</p>
              <p className="text-red-800 text-sm mt-1">{computeError}</p>
              {correlationId && (
                <p className="text-red-600 text-xs mt-2">ID korelacji: {correlationId}</p>
              )}
            </motion.div>
          )}

          {computeResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-6 bg-green-50 border-2 border-green-300 rounded-lg"
            >
              <h4 className="text-xl font-bold text-green-900 mb-4">✅ Dokładny wynik</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-green-700">Emerytura nominalna</p>
                  <p className="text-2xl font-bold text-green-900">
                    {Math.round(computeResult.baselineResult.kpi.monthlyNominal).toLocaleString(
                      'pl-PL'
                    )}{' '}
                    PLN
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Emerytura (dzisiaj)</p>
                  <p className="text-2xl font-bold text-green-900">
                    {Math.round(computeResult.baselineResult.kpi.monthlyRealToday).toLocaleString(
                      'pl-PL'
                    )}{' '}
                    PLN
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Stopa zastąpienia</p>
                  <p className="text-2xl font-bold text-green-900">
                    {Math.round(computeResult.baselineResult.kpi.replacementRate)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Przejście na emeryturę</p>
                  <p className="text-2xl font-bold text-green-900">
                    {computeResult.baselineResult.kpi.retirementYear}{' '}
                    {computeResult.baselineResult.kpi.claimQuarter}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Worth Knowing InfoCard */}
      <InfoCard
        variant="knowledge"
        icon="brain"
        title="Warto wiedzieć: Okresy kariery"
        description="Dla dokładniejszego wyniku warto uwzględnić różne okresy kariery: zmiany umów, przerwy, awanse. Każdy okres z innym typem umowy lub wynagrodzeniem wpływa na ostateczny kapitał emerytalny."
        sourceTitle="ZUS - Kalkulator emerytalny"
        sourceUrl="https://www.zus.pl/emerytura/kalkulator-emerytalny"
        className="mt-6"
      />

      <BeaverCoach
        message="Dodaj różne okresy swojej kariery — możesz uwzględnić zmiany umów, podwyżki czy przerwy. Im więcej szczegółów podasz, tym dokładniejszy będzie wynik!"
        tone="tip"
        pose="typing"
      />
    </div>
  );
}
