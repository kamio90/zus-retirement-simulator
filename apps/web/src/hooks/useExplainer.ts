import { useState, useCallback } from 'react';

export interface ExplainerContent {
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

export interface ExplainerResponse {
  version: string;
  explainer: ExplainerContent;
}

const API_BASE_URL =
  (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://localhost:4000';

export function useExplainer(): {
  fetchExplainer: (targetId: string, lang?: string) => Promise<ExplainerContent | null>;
  loading: boolean;
  error: Error | null;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchExplainer = useCallback(
    async (targetId: string, lang: string = 'pl-PL'): Promise<ExplainerContent | null> => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append('targetId', targetId);
        params.append('lang', lang);

        const url = `${API_BASE_URL}/content/explainers?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch explainer: ${response.statusText}`);
        }

        const jsonData: ExplainerResponse = await response.json();
        return jsonData.explainer;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Unknown error');
        setError(errorObj);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { fetchExplainer, loading, error };
}
