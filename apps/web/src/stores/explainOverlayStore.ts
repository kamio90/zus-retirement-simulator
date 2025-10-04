/**
 * Explain Overlay Store - Manages "Explain This" overlay state
 * Provides contextual micro-lessons for KPIs and chart points
 */
import { create } from 'zustand';

interface ExplainerContent {
  id: string;
  targetId: string;
  title: string;
  body: string;
  source: {
    title: string;
    url: string;
  };
  relatedTips?: string[];
  lang: string;
}

interface ExplainOverlayState {
  isOpen: boolean;
  targetId: string | null;
  targetElement: HTMLElement | null;
  content: ExplainerContent | null;
  showTranscript: boolean;
  isTTSSpeaking: boolean;
  cache: Map<string, ExplainerContent>;

  // Actions
  openExplainer: (targetId: string, targetElement: HTMLElement, content: ExplainerContent) => void;
  closeExplainer: () => void;
  toggleTranscript: () => void;
  setTTSSpeaking: (speaking: boolean) => void;
  cacheExplainer: (targetId: string, content: ExplainerContent) => void;
  getCachedExplainer: (targetId: string) => ExplainerContent | undefined;
}

// LRU Cache implementation - keep last 10 explainers
const MAX_CACHE_SIZE = 10;

export const useExplainOverlayStore = create<ExplainOverlayState>((set, get) => ({
  isOpen: false,
  targetId: null,
  targetElement: null,
  content: null,
  showTranscript: false,
  isTTSSpeaking: false,
  cache: new Map(),

  openExplainer: (
    targetId: string,
    targetElement: HTMLElement,
    content: ExplainerContent
  ): void => {
    set({
      isOpen: true,
      targetId,
      targetElement,
      content,
      showTranscript: false,
      isTTSSpeaking: false,
    });
  },

  closeExplainer: (): void => {
    const { targetElement } = get();
    set({
      isOpen: false,
      targetId: null,
      targetElement: null,
      content: null,
      showTranscript: false,
      isTTSSpeaking: false,
    });

    // Return focus to trigger element
    if (targetElement) {
      targetElement.focus();
    }
  },

  toggleTranscript: (): void => {
    set((state) => ({ showTranscript: !state.showTranscript }));
  },

  setTTSSpeaking: (speaking: boolean): void => {
    set({ isTTSSpeaking: speaking });
  },

  cacheExplainer: (targetId: string, content: ExplainerContent): void => {
    set((state) => {
      const newCache = new Map(state.cache);

      // Remove oldest entry if cache is full
      if (newCache.size >= MAX_CACHE_SIZE && !newCache.has(targetId)) {
        const firstKey = newCache.keys().next().value;
        if (firstKey) {
          newCache.delete(firstKey);
        }
      }

      newCache.set(targetId, content);
      return { cache: newCache };
    });
  },

  getCachedExplainer: (targetId: string): ExplainerContent | undefined => {
    return get().cache.get(targetId);
  },
}));
