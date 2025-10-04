/**
 * Wizard Store - Zustand state management for the wizard flow
 * Handles all wizard state with optional session storage persistence
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Gender = 'female' | 'male';
export type ContractType = 'uop' | 'jdg' | 'jdg_ryczalt';

export interface CareerPeriod {
  id: string;
  contractType: ContractType;
  yearsOfWork: number;
  monthlyIncome: number;
}

export interface WizardState {
  // Step 1: Gender & Age
  gender: Gender | null;
  age: number;

  // Step 2: Contract Type
  contractType: ContractType | null;

  // Step 3a: JDG Details
  jdgIncome: number;
  isRyczalt: boolean;

  // Step 4a: Quick calc result (stored to show in step 4)
  quickCalcResult: unknown | null;

  // Refine & Compare
  careerPeriods: CareerPeriod[];

  // Current step
  currentStep: number;

  // Actions
  setGender: (gender: Gender) => void;
  setAge: (age: number) => void;
  setContractType: (type: ContractType) => void;
  setJdgIncome: (income: number) => void;
  setIsRyczalt: (isRyczalt: boolean) => void;
  setQuickCalcResult: (result: unknown) => void;
  addCareerPeriod: (period: Omit<CareerPeriod, 'id'>) => void;
  removeCareerPeriod: (id: string) => void;
  updateCareerPeriod: (id: string, period: Partial<CareerPeriod>) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialState = {
  gender: null,
  age: 30,
  contractType: null,
  jdgIncome: 5000,
  isRyczalt: false,
  quickCalcResult: null,
  careerPeriods: [],
  currentStep: 1,
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      ...initialState,

      setGender: (gender) => set({ gender }),
      setAge: (age) => set({ age }),
      setContractType: (contractType) => set({ contractType }),
      setJdgIncome: (jdgIncome) => set({ jdgIncome }),
      setIsRyczalt: (isRyczalt) => set({ isRyczalt }),
      setQuickCalcResult: (quickCalcResult) => set({ quickCalcResult }),

      addCareerPeriod: (period) =>
        set((state) => ({
          careerPeriods: [...state.careerPeriods, { ...period, id: `period-${Date.now()}` }],
        })),

      removeCareerPeriod: (id) =>
        set((state) => ({
          careerPeriods: state.careerPeriods.filter((p) => p.id !== id),
        })),

      updateCareerPeriod: (id, updates) =>
        set((state) => ({
          careerPeriods: state.careerPeriods.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      setCurrentStep: (currentStep) => set({ currentStep }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 6),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'wizard-storage',
      partialize: (state) => ({
        gender: state.gender,
        age: state.age,
        contractType: state.contractType,
        jdgIncome: state.jdgIncome,
        isRyczalt: state.isRyczalt,
        careerPeriods: state.careerPeriods,
        currentStep: state.currentStep,
      }),
    }
  )
);
