/**
 * Step 2 - Contract Type Selection
 * Choose between Employment Contract (UoP) or Self-Employment (JDG)
 */
import { motion } from 'framer-motion';
import { useWizardStore, ContractType } from '../../store/wizardStore';
import { BeaverCoach } from './BeaverCoach';
import { InfoCard } from './InfoCard';

export function Step2ContractType(): JSX.Element {
  const { contractType, setContractType } = useWizardStore();

  const contractOptions: {
    value: ContractType;
    label: string;
    description: string;
    icon: string;
  }[] = [
    {
      value: 'uop',
      label: 'Umowa o pracę (UoP)',
      description: 'Standardowa umowa pracownicza z pełnymi składkami ZUS',
      icon: '💼',
    },
    {
      value: 'jdg',
      label: 'Działalność gospodarcza (JDG)',
      description: 'Samozatrudnienie z możliwością różnych form opodatkowania',
      icon: '🏢',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-zus-text mb-2">Wybierz typ umowy</h2>
      <p className="text-gray-600 mb-8">
        Rodzaj umowy wpływa na sposób naliczania składek emerytalnych
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contractOptions.map((option) => (
          <motion.div
            key={option.value}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div
              onClick={() => setContractType(option.value)}
              className={`
                cursor-pointer transition-all duration-300 h-full bg-white rounded-lg shadow-md
                ${
                  contractType === option.value
                    ? 'ring-4 ring-zus-primary bg-zus-secondary shadow-xl'
                    : 'hover:shadow-lg hover:ring-2 hover:ring-zus-border'
                }
              `}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setContractType(option.value);
                }
              }}
              aria-pressed={contractType === option.value}
              aria-label={`Wybierz typ umowy: ${option.label}`}
            >
              <div className="flex flex-col items-center text-center gap-4 py-8 px-4">
                <span className="text-6xl" role="img" aria-label={option.label}>
                  {option.icon}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-zus-text mb-2">{option.label}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
                {contractType === option.value && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-2">
                    <div className="bg-zus-primary text-white rounded-full px-4 py-1 text-sm font-semibold">
                      ✓ Wybrano
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info box */}
      <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <h4 className="font-semibold text-blue-900 mb-2">Ważna informacja</h4>
        <p className="text-sm text-blue-800">
          <strong>UoP:</strong> Składka emerytalna wynosi 19.52% podstawy (pracodawca + pracownik)
          <br />
          <strong>JDG:</strong> Możliwość opłacania składek od niższej podstawy lub wybór ryczałtu
        </p>
      </div>

      {/* Worth Knowing InfoCard */}
      <InfoCard
        variant="knowledge"
        icon="brain"
        title="Warto wiedzieć"
        description="Umowa o pracę (UoP): składki liczone od pełnego wynagrodzenia brutto. Działalność gospodarcza (JDG): możliwość opłacania składek od niższej podstawy lub wybór ryczałtu, co wpływa na przyszłą emeryturę."
        sourceTitle="ZUS - Przedsiębiorcy i składki"
        sourceUrl="https://www.zus.pl/przedsiebiorcy"
        className="mt-6"
      />

      {/* Beaver Coach */}
      <BeaverCoach
        message="Wybierz rodzaj umowy, która dotyczy Twojej sytuacji. To zmieni sposób obliczania składek emerytalnych. Osoby na UoP mają automatycznie wyższą podstawę składek niż na JDG."
        tone="tip"
        pose="point-left"
      />
    </div>
  );
}
