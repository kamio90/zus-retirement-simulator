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
import { wizardJdg } from '../../services/v2-api';
import type { WizardJdgRequest, ContractTypeV2 } from '@zus/types';

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
      // Quick calculation - call v2 API
      if (gender && age && jdgIncome > 0 && contractType) {
        try {
          // Map contract type to v2 format (uppercase)
          const contractV2: ContractTypeV2 = contractType === 'uop' 
            ? 'UOP' 
            : contractType === 'jdg_ryczalt' 
            ? 'JDG_RYCZALT' 
            : 'JDG';

          const request: WizardJdgRequest = {
            gender: gender === 'male' ? 'M' : 'F',
            age,
            contract: contractV2,
            monthlyIncome: jdgIncome,
            isRyczalt,
            claimMonth: 6, // Default to June (Q2)
          };
          
          const result = await wizardJdg(request);
          setQuickCalcResult(result);
          nextStep();
        } catch (error) {
          console.error('V2 JDG calculation failed:', error);
          // Still proceed to show mock data
          nextStep();
        }
      } else {
        nextStep();
      }
    } else if (currentStep === 5) {
      // Final calculation - could call simulate v2 API here
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
