/**
 * Hook for managing baseline vs current comparison view
 */
import { create } from 'zustand';

interface CompareState {
  showBaseline: boolean;
  toggleBaseline: () => void;
  setShowBaseline: (show: boolean) => void;
}

export const useCompareStore = create<CompareState>((set) => ({
  showBaseline: false,
  toggleBaseline: () => set((state) => ({ showBaseline: !state.showBaseline })),
  setShowBaseline: (show: boolean) => set({ showBaseline: show }),
}));
