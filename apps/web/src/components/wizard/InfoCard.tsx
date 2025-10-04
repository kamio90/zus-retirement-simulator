/**
 * InfoCard Component - Blue "Worth Knowing" information cards
 * Displays educational content with brain icon and official sources
 */
import { motion } from 'framer-motion';
import { useState } from 'react';

export interface InfoCardProps {
  variant?: 'knowledge' | 'tip' | 'warning';
  icon?: 'brain' | 'lightbulb' | 'warning';
  title: string;
  description: string;
  sourceTitle?: string;
  sourceUrl?: string;
  className?: string;
}

const variantStyles = {
  knowledge: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-900',
    iconBg: 'bg-blue-100',
    linkColor: 'text-blue-600 hover:text-blue-800',
  },
  tip: {
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-900',
    iconBg: 'bg-green-100',
    linkColor: 'text-green-600 hover:text-green-800',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-900',
    iconBg: 'bg-yellow-100',
    linkColor: 'text-yellow-600 hover:text-yellow-800',
  },
};

const iconMap = {
  brain: '🧠',
  lightbulb: '💡',
  warning: '⚠️',
};

export function InfoCard({
  variant = 'knowledge',
  icon = 'brain',
  title,
  description,
  sourceTitle,
  sourceUrl,
  className = '',
}: InfoCardProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const styles = variantStyles[variant];
  const shouldReduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animations = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      };

  return (
    <motion.div
      {...animations}
      className={`${styles.bg} ${styles.border} border-2 rounded-lg p-4 ${className}`}
      role="article"
      aria-label={`Warto wiedzieć: ${title}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`${styles.iconBg} rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0`}
          aria-hidden="true"
        >
          <span className="text-2xl">{iconMap[icon]}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-bold ${styles.text} mb-2`}>{title}</h3>

          <p className={`text-sm ${styles.text} leading-relaxed`}>{description}</p>

          {/* Source link */}
          {sourceTitle && sourceUrl && (
            <div className="mt-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`text-xs font-medium ${styles.linkColor} underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded`}
                aria-expanded={isExpanded}
              >
                {isExpanded ? '▼' : '▶'} Źródło: {sourceTitle}
              </button>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2"
                >
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs ${styles.linkColor} break-all`}
                  >
                    {sourceUrl} ↗
                  </a>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
