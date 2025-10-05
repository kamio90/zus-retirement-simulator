/**
 * WizardLayout Component - Shell layout for the wizard flow
 * Includes header, progress stepper, navigation buttons, and content area
 */
import { motion } from 'framer-motion';
import { useWizardStore } from '../../store/wizardStore';

interface WizardLayoutProps {
  children: React.ReactNode;
  canGoNext?: boolean;
  canGoBack?: boolean;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
}

const steps = [
  { id: 1, label: 'Płeć i wiek' },
  { id: 2, label: 'Typ umowy' },
  { id: 3, label: 'Szczegóły' },
  { id: 4, label: 'Wynik' },
  { id: 5, label: 'Doprecyzuj' },
];

export function WizardLayout({
  children,
  canGoNext = true,
  canGoBack = true,
  onNext,
  onBack,
  nextLabel = 'Dalej',
  backLabel = 'Wstecz',
}: WizardLayoutProps): JSX.Element {
  const { currentStep, prevStep, nextStep } = useWizardStore();

  const handleNext = (): void => {
    if (onNext) {
      onNext();
    } else {
      nextStep();
    }
  };

  const handleBack = (): void => {
    if (onBack) {
      onBack();
    } else {
      prevStep();
    }
  };

  return (
    <div className="min-h-screen bg-zus-secondary flex flex-col">
      {/* Header */}
      <header className="bg-zus-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-bold">Symulator Emerytalny ZUS</h1>
          <p className="mt-1 text-zus-secondary text-sm md:text-base">
            Krok {currentStep} z {steps.length}
          </p>
        </div>
      </header>

      {/* Progress Stepper */}
      <div className="bg-white shadow-sm border-b border-zus-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="relative flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                      transition-colors duration-300
                      ${
                        currentStep > step.id
                          ? 'bg-zus-primary text-white'
                          : currentStep === step.id
                          ? 'bg-zus-accent text-white ring-4 ring-zus-primary ring-opacity-30'
                          : 'bg-gray-200 text-gray-500'
                      }
                    `}
                    aria-current={currentStep === step.id ? 'step' : undefined}
                    aria-label={`Krok ${step.id}: ${step.label}${
                      currentStep === step.id ? ' (aktualny)' : ''
                    }${currentStep > step.id ? ' (ukończony)' : ''}`}
                  >
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <span
                    className={`
                      hidden md:block mt-2 text-xs font-medium whitespace-nowrap
                      ${currentStep >= step.id ? 'text-zus-text' : 'text-gray-400'}
                    `}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 relative">
                    <div className="absolute inset-0 bg-gray-200" />
                    <motion.div
                      className="absolute inset-0 bg-zus-primary origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{
                        scaleX: currentStep > step.id ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Sticky Action Area */}
      <div className="sticky bottom-0 bg-white border-t border-zus-border shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={handleBack}
              disabled={!canGoBack || currentStep === 1}
              className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Przejdź do poprzedniego kroku"
            >
              ← {backLabel}
            </button>

            <div className="text-sm text-gray-500">
              Krok {currentStep} / {steps.length}
            </div>

            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className="px-6 py-2 bg-zus-primary text-white font-semibold rounded-md hover:bg-zus-accent focus:outline-none focus:ring-2 focus:ring-zus-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Przejdź do następnego kroku"
            >
              {nextLabel} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
