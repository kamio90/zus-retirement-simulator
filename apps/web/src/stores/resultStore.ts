/**
 * Result Store - Manages baseline and current scenario results for instant what-if updates
 */
import { create } from 'zustand';
import type { ScenarioResult } from '@zus/types';

interface WhatIfCacheEntry {
  key: string;
  result: ScenarioResult;
  timestamp: number;
}

interface ResultState {
  baselineResult: ScenarioResult | null;
  currentResult: ScenarioResult | null;
  appliedWhatIf: string | null; // Track which what-if is currently applied
  whatIfCache: WhatIfCacheEntry[]; // LRU cache for what-if responses
  isLoadingWhatIf: boolean;
  whatIfError: string | null;

  // Actions
  setBaselineResult: (result: ScenarioResult) => void;
  setCurrentResult: (result: ScenarioResult) => void;
  setAppliedWhatIf: (whatIf: string | null) => void;
  restoreBaseline: () => void;
  cacheWhatIfResult: (key: string, result: ScenarioResult) => void;
  getCachedWhatIf: (key: string) => ScenarioResult | null;
  setLoadingWhatIf: (loading: boolean) => void;
  setWhatIfError: (error: string | null) => void;
  reset: () => void;
}

const MAX_CACHE_SIZE = 3; // Keep last 3 what-if responses

export const useResultStore = create<ResultState>((set, get) => ({
  baselineResult: null,
  currentResult: null,
  appliedWhatIf: null,
  whatIfCache: [],
  isLoadingWhatIf: false,
  whatIfError: null,

  setBaselineResult: (result) => {
    set({
      baselineResult: result,
      currentResult: result,
      appliedWhatIf: null,
      whatIfCache: [], // Clear cache when baseline changes
    });
  },

  setCurrentResult: (result) => {
    set({ currentResult: result });
  },

  setAppliedWhatIf: (whatIf) => {
    set({ appliedWhatIf: whatIf });
  },

  restoreBaseline: () => {
    const { baselineResult } = get();
    set({
      currentResult: baselineResult,
      appliedWhatIf: null,
    });
  },

  cacheWhatIfResult: (key, result) => {
    const { whatIfCache } = get();
    const newCache = [
      { key, result, timestamp: Date.now() },
      ...whatIfCache.filter((entry) => entry.key !== key), // Remove existing entry if present
    ].slice(0, MAX_CACHE_SIZE); // Keep only MAX_CACHE_SIZE entries

    set({ whatIfCache: newCache });
  },

  getCachedWhatIf: (key) => {
    const { whatIfCache } = get();
    const entry = whatIfCache.find((e) => e.key === key);
    return entry ? entry.result : null;
  },

  setLoadingWhatIf: (loading) => {
    set({ isLoadingWhatIf: loading });
  },

  setWhatIfError: (error) => {
    set({ whatIfError: error });
  },

  reset: () => {
    set({
      baselineResult: null,
      currentResult: null,
      appliedWhatIf: null,
      whatIfCache: [],
      isLoadingWhatIf: false,
      whatIfError: null,
    });
  },
}));
