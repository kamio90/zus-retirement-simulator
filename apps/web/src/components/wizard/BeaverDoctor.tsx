/**
 * BeaverDoctor - Friendly error recovery component
 * Provides actionable suggestions for API errors (422/400)
 */
import { motion } from 'framer-motion';
import type { ApiError } from '@zus/types';

interface BeaverDoctorProps {
  error: ApiError;
  onFixIt: (action: string, params?: Record<string, unknown>) => void;
  onDismiss: () => void;
}

export function BeaverDoctor({ error, onFixIt, onDismiss }: BeaverDoctorProps): JSX.Element {
  const getBeaverPose = (): string => {
    // Different beaver poses based on error severity
    if (error.code === 'DOMAIN_CONSTRAINT') return '🦫🔧'; // Beaver with wrench
    if (error.code === 'VALIDATION_ERROR') return '🦫📋'; // Beaver with clipboard
    return '🦫💭'; // Beaver thinking
  };

  const getErrorTitle = (): string => {
    switch (error.hintCode) {
      case 'MISSING_QUARTER_INDEX':
        return 'Brakuje wskaźnika kwartalnego';
      case 'INVALID_LIFE_EXPECTANCY':
        return 'Nieprawidłowa SDŻ';
      case 'INVALID_RETIREMENT_AGE':
        return 'Nieprawidłowy wiek emerytalny';
      case 'INVALID_CONTRIBUTION_BASE':
        return 'Nieprawidłowa podstawa składki';
      case 'OVERLAPPING_PERIODS':
        return 'Nakładające się okresy';
      case 'CLAIM_QUARTER_OUT_OF_RANGE':
        return 'Kwartał poza zakresem';
      case 'SDZ_NOT_AVAILABLE':
        return 'Brak danych SDŻ';
      default:
        return 'Wystąpił problem';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 shadow-lg"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        {/* Beaver Icon */}
        <div className="text-4xl flex-shrink-0" aria-hidden="true">
          {getBeaverPose()}
        </div>

        {/* Content */}
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{getErrorTitle()}</h3>
          <p className="text-gray-700 mb-4">{error.message}</p>

          {error.hint && (
            <p className="text-sm text-gray-600 mb-4 italic">💡 {error.hint}</p>
          )}

          {/* Suggestions */}
          {error.suggestions && error.suggestions.length > 0 && (
            <div className="space-y-2 mb-4">
              <p className="text-sm font-semibold text-gray-700">Jak to naprawić?</p>
              <div className="flex flex-wrap gap-2">
                {error.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => onFixIt(suggestion.action, suggestion.params)}
                    className="px-4 py-2 bg-zus-primary text-white rounded-lg hover:bg-zus-accent transition-colors text-sm font-medium min-h-[44px] flex items-center gap-2"
                    aria-label={`Napraw: ${suggestion.label}`}
                  >
                    🔧 {suggestion.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dismiss */}
          <button
            onClick={onDismiss}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
            aria-label="Zamknij komunikat"
          >
            Zamknij
          </button>
        </div>
      </div>
    </motion.div>
  );
}
