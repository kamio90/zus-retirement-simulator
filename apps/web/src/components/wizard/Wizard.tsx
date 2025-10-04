/**
 * Main Wizard Component - Orchestrates the step-by-step flow
 */
import { AnimatePresence } from 'framer-motion';
import { useWizardStore } from '../../store/wizardStore';
import { WizardLayout } from './WizardLayout';
import { Step1GenderAge } from './Step1GenderAge';
import { Step2ContractType } from './Step2ContractType';
import { Step3aJdgDetails } from './Step3aJdgDetails';
import { Step4aResult } from './Step4aResult';
import { Step5RefineCompare } from './Step5RefineCompare';
import { calculateJdgQuick } from '../../services/api';
import type { JdgQuickRequest } from '@zus/types';

export function Wizard(): JSX.Element {
  const {
    currentStep,
    gender,
    contractType,
    jdgIncome,
    isRyczalt,
    age,
    nextStep,
    setQuickCalcResult,
  } = useWizardStore();

  // Validation logic for each step
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return gender !== null;
      case 2:
        return contractType !== null;
      case 3:
        return jdgIncome > 0 && jdgIncome <= 1000000;
      case 4:
        return true; // Can always proceed from results
      case 5:
        return true; // Can always finish from refine
      default:
        return false;
    }
  };

  const getNextLabel = (): string => {
    switch (currentStep) {
      case 3:
        return 'Oblicz szybko';
      case 4:
        return 'Doprecyzuj';
      case 5:
        return 'Zakończ';
      default:
        return 'Dalej';
    }
  };

  const handleNext = async (): Promise<void> => {
    if (currentStep === 3) {
      // Quick calculation - call API
      if (gender && age && jdgIncome > 0) {
        try {
          const birthYear = new Date().getFullYear() - age;
          const request: JdgQuickRequest = {
            birthYear,
            gender: gender === 'male' ? 'M' : 'F',
            age,
            monthlyIncome: jdgIncome,
            isRyczalt,
          };
          const result = await calculateJdgQuick(request);
          setQuickCalcResult(result);
          nextStep();
        } catch (error) {
          console.error('JDG quick calculation failed:', error);
          // Still proceed to show mock data
          nextStep();
        }
      } else {
        nextStep();
      }
    } else if (currentStep === 5) {
      // Final calculation - could call compose API here
      // For now, just proceed
    } else {
      nextStep();
    }
  };

  const renderStep = (): JSX.Element => {
    switch (currentStep) {
      case 1:
        return <Step1GenderAge />;
      case 2:
        return <Step2ContractType />;
      case 3:
        return <Step3aJdgDetails />;
      case 4:
        return <Step4aResult />;
      case 5:
        return <Step5RefineCompare />;
      default:
        return <Step1GenderAge />;
    }
  };

  return (
    <WizardLayout
      canGoNext={canProceed()}
      canGoBack={currentStep > 1}
      onNext={handleNext}
      nextLabel={getNextLabel()}
    >
      <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
    </WizardLayout>
  );
}
