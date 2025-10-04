/**
 * Beaver Store - Manages beaver coach state
 * Note: Tone preference removed as of v0.3 - now uses friendly tone by default
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BeaverState {
  isMinimized: boolean;
  lastStepId: string | null;
  setMinimized: (minimized: boolean) => void;
  setLastStepId: (stepId: string | null) => void;
}

export const useBeaverStore = create<BeaverState>()(
  persist(
    (set) => ({
      isMinimized: false,
      lastStepId: null,
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
