/**
 * Step 3a - JDG Details Form
 * Monthly income input and lump-sum taxation option
 */
import { useState } from 'react';
import { useWizardStore } from '../../store/wizardStore';
import { BeaverCoach } from './BeaverCoach';
import { KnowledgeCard } from './KnowledgeCard';

export function Step3aJdgDetails(): JSX.Element {
  const { jdgIncome, isRyczalt, contractType, setJdgIncome, setIsRyczalt } = useWizardStore();
  const [inputValue, setInputValue] = useState(jdgIncome.toString());
  const [error, setError] = useState('');

  // Only show ryczałt option for JDG contracts (not UoP)
  const isJdgContract = contractType === 'jdg' || contractType === 'jdg_ryczalt';

  const handleIncomeChange = (value: string): void => {
    const cleaned = value.replace(/[^\d]/g, '');
    setInputValue(cleaned);

    const numValue = Number(cleaned);
    if (numValue < 0) {
      setError('Dochód nie może być ujemny');
    } else if (numValue > 1000000) {
      setError('Dochód nie może przekraczać 1,000,000 PLN');
    } else {
      setError('');
      setJdgIncome(numValue);
    }
  };

  const formatCurrency = (value: string): string => {
    if (!value) return '';
    const num = Number(value.replace(/\s/g, ''));
    return num.toLocaleString('pl-PL');
  };

  const isValid = jdgIncome > 0 && jdgIncome <= 1000000;

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-zus-text mb-2">Szczegóły działalności</h2>
      <p className="text-gray-600 mb-8">Podaj miesięczny dochód i wybierz formę opodatkowania</p>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <label htmlFor="jdg-income" className="block text-lg font-semibold text-zus-text mb-2">
            Miesięczny dochód (PLN)
          </label>
          <div className="relative">
            <input
              id="jdg-income"
              type="text"
              value={formatCurrency(inputValue)}
              onChange={(e) => handleIncomeChange(e.target.value)}
              className={`
                w-full px-4 py-3 text-lg border-2 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-zus-primary
                ${error ? 'border-zus-error' : 'border-zus-border'}
              `}
              placeholder="np. 5 000"
              aria-label="Miesięczny dochód w złotych"
              aria-describedby={error ? 'income-error' : 'income-hint'}
              aria-invalid={!!error}
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
              PLN
            </span>
          </div>
          {error ? (
            <p id="income-error" className="mt-2 text-sm text-zus-error" role="alert">
              {error}
            </p>
          ) : (
            <p id="income-hint" className="mt-2 text-sm text-gray-500">
              {contractType === 'uop'
                ? 'Podaj swoje wynagrodzenie brutto z umowy o pracę'
                : 'Podaj średni miesięczny dochód z działalności gospodarczej'}
            </p>
          )}
        </div>

        {/* Only show ryczałt option for JDG contracts */}
        {isJdgContract && (
          <>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="ryczalt-checkbox"
                checked={isRyczalt}
                onChange={(e) => setIsRyczalt(e.target.checked)}
                className="mt-1 w-5 h-5 text-zus-primary border-gray-300 rounded focus:ring-zus-primary"
                aria-describedby="ryczalt-description"
              />
              <div className="flex-1">
                <label
                  htmlFor="ryczalt-checkbox"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="font-medium text-zus-text">Opodatkowanie ryczałtem</span>
                  <span
                    className="cursor-help text-gray-400 hover:text-gray-600"
                    title="Ryczałt pozwala płacić składki od niższej podstawy"
                  >
                    ℹ️
                  </span>
                </label>
              </div>
            </div>
            <p id="ryczalt-description" className="mt-2 text-sm text-gray-600 ml-8">
              {isRyczalt
                ? 'Składki będą naliczane od minimalnej podstawy'
                : 'Składki będą naliczane od pełnego dochodu'}
            </p>
          </>
        )}
      </div>

      {isValid && (
        <div className="bg-zus-secondary border-2 border-zus-primary rounded-lg p-6">
          <h3 className="text-lg font-bold text-zus-text mb-3">Podsumowanie</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Miesięczny dochód:</span>
              <span className="font-semibold">{jdgIncome.toLocaleString('pl-PL')} PLN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Forma opodatkowania:</span>
              <span className="font-semibold">
                {isRyczalt
                  ? 'Ryczałt'
                  : contractType === 'jdg'
                  ? 'Podatek Liniowy'
                  : 'Umowa o Pracę'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Szacunkowa składka (19.52%):</span>
              <span className="font-semibold text-zus-primary">
                ~{Math.round(jdgIncome * 0.1952).toLocaleString('pl-PL')} PLN
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Worth Knowing InfoCard - only for JDG with ryczałt */}
      {isJdgContract && isRyczalt && <KnowledgeCard stepId="step3a_jdg" className="mb-6" />}

      <BeaverCoach
        message="Wprowadź swój miesięczny dochód z działalności. Jeśli płacisz ryczałt, zaznacz odpowiednią opcję — to wpłynie na podstawę składek ZUS."
        tone="info"
        pose="read"
        stepId="step3a_jdg"
      />
    </div>
  );
}
