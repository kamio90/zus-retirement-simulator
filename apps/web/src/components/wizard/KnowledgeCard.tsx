/**
 * KnowledgeCard Component - InfoCard with API-powered knowledge loading
 */
import { useKnowledge } from '../../hooks/useKnowledge';
import { InfoCard } from './InfoCard';

export interface KnowledgeCardProps {
  stepId?: string;
  lang?: string;
  limit?: number;
  className?: string;
}

export function KnowledgeCard({
  stepId,
  lang = 'pl-PL',
  limit = 1,
  className = '',
}: KnowledgeCardProps): JSX.Element | null {
  const { data, loading, error } = useKnowledge(stepId, lang, limit);

  if (loading) {
    return (
      <div className={`p-4 bg-blue-50 border-2 border-blue-300 rounded-lg ${className}`}>
        <p className="text-sm text-blue-900">Ładowanie...</p>
      </div>
    );
  }

  if (error || !data || data.items.length === 0) {
    return null;
  }

  // Show first item
  const item = data.items[0];

  return (
    <InfoCard
      variant="knowledge"
      icon="brain"
      title={item.title}
      description={item.short || item.body}
      sourceTitle={item.source.title}
      sourceUrl={item.source.url}
      className={className}
    />
  );
}
