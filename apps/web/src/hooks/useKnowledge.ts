import { useState, useEffect } from 'react';

export interface KnowledgeItem {
  id: string;
  step?: string;
  title: string;
  tone?: 'fun' | 'formal';
  short?: string;
  body: string;
  pose?: string;
  icon?: string;
  tokens?: string[];
  source: {
    title: string;
    url: string;
  };
  lang: string;
}

export interface KnowledgeResponse {
  version: string;
  items: KnowledgeItem[];
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

export function useKnowledge(stepId?: string, lang: string = 'pl-PL', limit: number = 3, tone?: 'fun' | 'formal') {
  const [data, setData] = useState<KnowledgeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchKnowledge = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (stepId) params.append('step', stepId);
        if (lang) params.append('lang', lang);
        if (limit) params.append('limit', limit.toString());
        if (tone) params.append('tone', tone);

        const url = `${API_BASE_URL}/content/knowledge?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch knowledge: ${response.statusText}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledge();
  }, [stepId, lang, limit, tone]);

  return { data, loading, error };
}
