/**
 * Step 5 - Refine & Compare
 * Add multiple career periods for detailed scenario calculation
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizardStore, ContractType, CareerPeriod } from '../../store/wizardStore';
import { BeaverCoach } from './BeaverCoach';
import { KnowledgeCard } from './KnowledgeCard';
import { composeCareer } from '../../services/api';
import type { ComposeCareerRequest, ComposeCareerResult } from '@zus/types';

export function Step5RefineCompare(): JSX.Element {
  const { careerPeriods, addCareerPeriod, removeCareerPeriod, gender, age } = useWizardStore();

  const [newPeriod, setNewPeriod] = useState<Omit<CareerPeriod, 'id'>>({
    contractType: 'uop',
    yearsOfWork: 5,
    monthlyIncome: 5000,
  });

  const [isComputing, setIsComputing] = useState(false);
  const [computeError, setComputeError] = useState<string | null>(null);
  const [computeResult, setComputeResult] = useState<ComposeCareerResult | null>(null);
  const [earlyRetirement, setEarlyRetirement] = useState(false);
  const [delayMonths, setDelayMonths] = useState(0);

  const contractTypeLabels: Record<ContractType, string> = {
    uop: 'Umowa o pracę (UoP)',
    jdg: 'Działalność (JDG)',
    jdg_ryczalt: 'Działalność (JDG - ryczałt)',
    no_contribution: 'Okres bez składki',
  };

  // Filter available contract types
  const getAvailableContractTypes = (): ContractType[] => {
    return ['uop', 'jdg', 'jdg_ryczalt', 'no_contribution'];
  };

  const handleAddPeriod = (): void => {
    if (newPeriod.yearsOfWork > 0) {
      // For no_contribution periods, income is always 0
      const periodToAdd = {
        ...newPeriod,
        monthlyIncome: newPeriod.contractType === 'no_contribution' ? 0 : newPeriod.monthlyIncome,
      };
      addCareerPeriod(periodToAdd);
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
          careerPeriods
            .filter((p) => p.contractType !== 'no_contribution')
            .reduce((sum, p) => sum + p.monthlyIncome, 0) /
            Math.max(
              careerPeriods.filter((p) => p.contractType !== 'no_contribution').length,
              1
            )
        )
      : 0;

  // Handle final compute
  const handleComputePrecisePension = async (): Promise<void> => {
    if (!gender || !age || careerPeriods.length === 0) {
      setComputeError('Brak wymaganych danych do obliczeń');
      return;
    }

    setIsComputing(true);
    setComputeError(null);

    try {
      const birthYear = new Date().getFullYear() - age;
      
      // Calculate retirement age based on gender and early retirement option
      const baseRetirementAge = gender === 'male' ? 65 : 60;
      const retirementAge = earlyRetirement ? baseRetirementAge - 5 : baseRetirementAge;
      
      // Calculate claim month based on delay
      const baseClaimMonth = 6; // June
      const claimMonth = Math.min(12, baseClaimMonth + Math.floor(delayMonths));

      // Map career periods to API format
      const apiCareerPeriods = careerPeriods.map((period) => ({
        contractType: period.contractType,
        yearsOfWork: period.yearsOfWork,
        monthlyIncome: period.monthlyIncome,
      }));

      const request: ComposeCareerRequest = {
        birthYear,
        gender: gender === 'male' ? 'M' : 'F',
        careerPeriods: apiCareerPeriods,
        retirementAge,
        claimMonth,
      };

      const result = await composeCareer(request);
      setComputeResult(result);
      setComputeError(null);
    } catch (error) {
      console.error('Compute failed:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Wystąpił błąd podczas obliczeń. Spróbuj ponownie.';
      setComputeError(errorMessage);
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
              disabled={newPeriod.contractType === 'no_contribution'}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zus-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              aria-label="Miesięczny dochód w tym okresie"
            />
            {newPeriod.contractType === 'no_contribution' && (
              <p className="text-xs text-gray-500 mt-1">Brak składki w tym okresie</p>
            )}
          </div>
        </div>

        <button
          onClick={handleAddPeriod}
          disabled={
            newPeriod.yearsOfWork <= 0 ||
            (newPeriod.contractType !== 'no_contribution' && newPeriod.monthlyIncome <= 0)
          }
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
                        {period.contractType === 'no_contribution'
                          ? 'Brak składki'
                          : `${period.monthlyIncome.toLocaleString('pl-PL')} PLN`}
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
          {/* Retirement Timing Options */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-zus-text mb-4">Opcje przejścia na emeryturę</h3>
            <div className="space-y-3">
              <label className="flex items-center p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-zus-primary focus:ring-zus-primary"
                  checked={earlyRetirement}
                  onChange={(e) => setEarlyRetirement(e.target.checked)}
                />
                <span className="ml-3 text-sm font-medium text-gray-900">
                  Wcześniejsza emerytura (-5 lat)
                </span>
                <span className="ml-auto text-xs text-blue-600">
                  Wyższy dzielnik → niższa emerytura
                </span>
              </label>

              <div className="p-3 bg-green-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Opóźnienie emerytury
                </label>
                <select
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zus-primary focus:border-transparent"
                  value={delayMonths}
                  onChange={(e) => setDelayMonths(Number(e.target.value))}
                >
                  <option value="0">Brak opóźnienia</option>
                  <option value="12">+12 miesięcy</option>
                  <option value="24">+24 miesiące</option>
                </select>
                <p className="text-xs text-green-600 mt-1">
                  Niższy dzielnik + dodatkowa waloryzacja → wyższa emerytura
                </p>
              </div>
            </div>
          </div>

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
              <p className="text-red-700 text-sm mt-2">
                💡 Obliczenia wymagają połączenia z serwerem. Upewnij się, że serwer API jest
                dostępny.
              </p>
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
                    {Math.round(computeResult.monthlyPensionNominal).toLocaleString('pl-PL')} PLN
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Emerytura (dzisiaj)</p>
                  <p className="text-2xl font-bold text-green-900">
                    {Math.round(computeResult.monthlyPensionRealToday).toLocaleString('pl-PL')} PLN
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Stopa zastąpienia</p>
                  <p className="text-2xl font-bold text-green-900">
                    {Math.round(computeResult.replacementRate * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Przejście na emeryturę</p>
                  <p className="text-2xl font-bold text-green-900">
                    {computeResult.scenario.retirementYear} Q
                    {computeResult.finalization.quarterUsed.replace('Q', '')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Worth Knowing InfoCard - Load from API */}
      <KnowledgeCard stepId="refine_compare" className="mt-6" />

      <BeaverCoach
        message="Dodaj różne okresy swojej kariery — możesz uwzględnić zmiany umów, podwyżki czy przerwy. Im więcej szczegółów podasz, tym dokładniejszy będzie wynik!"
        tone="tip"
        pose="typing"
        stepId="refine_compare"
      />
    </div>
  );
}
