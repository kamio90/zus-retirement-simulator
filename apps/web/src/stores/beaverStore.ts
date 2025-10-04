/**
 * Beaver Store - Manages tone preference and beaver coach state
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BeaverState {
  tone: 'fun' | 'formal';
  isMinimized: boolean;
  lastStepId: string | null;
  setTone: (tone: 'fun' | 'formal') => void;
  setMinimized: (minimized: boolean) => void;
  setLastStepId: (stepId: string | null) => void;
}

export const useBeaverStore = create<BeaverState>()(
  persist(
    (set) => ({
      tone: 'fun',
      isMinimized: false,
      lastStepId: null,
      setTone: (tone: 'fun' | 'formal'): void => {
        set({ tone });
      },
      setMinimized: (minimized: boolean): void => {
        set({ isMinimized: minimized });
      },
      setLastStepId: (stepId: string | null): void => {
        set({ lastStepId: stepId });
      },
    }),
    {
      name: 'beaver-preferences',
    }
  )
);
