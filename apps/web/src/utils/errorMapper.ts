/**
 * Error mapper for Beaver Doctor
 * Converts API errors to actionable suggestions
 */
import type { ApiError, HintCode } from '@zus/types';

export interface BeaverDoctorError extends ApiError {
  suggestions: Array<{
    action: string;
    label: string;
    params?: Record<string, unknown>;
  }>;
}

export function mapErrorToBeaverDoctor(error: ApiError): BeaverDoctorError {
  const suggestions: BeaverDoctorError['suggestions'] = [];

  switch (error.hintCode as HintCode) {
    case 'MISSING_QUARTER_INDEX':
      suggestions.push(
        {
          action: 'TRY_Q3',
          label: 'Spróbuj Q3 poprzedniego roku',
          params: { quarter: 3 },
        },
        {
          action: 'TRY_Q1',
          label: 'Spróbuj Q1 bieżącego roku',
          params: { quarter: 1 },
        }
      );
      break;

    case 'INVALID_RETIREMENT_AGE':
      suggestions.push(
        {
          action: 'USE_STATUTORY',
          label: 'Użyj wieku ustawowego',
          params: { useStatutory: true },
        },
        {
          action: 'CLAMP_MIN',
          label: 'Ustaw minimalny wiek (60/65)',
        }
      );
      break;

    case 'INVALID_CONTRIBUTION_BASE':
      suggestions.push(
        {
          action: 'CLAMP_TO_MAX',
          label: 'Ogranicz do maksymalnej podstawy',
        },
        {
          action: 'USE_RECOMMENDED',
          label: 'Użyj zalecanej podstawy',
        }
      );
      break;

    case 'OVERLAPPING_PERIODS':
      suggestions.push({
        action: 'REMOVE_OVERLAP',
        label: 'Usuń nakładające się okresy',
      });
      break;

    case 'CLAIM_QUARTER_OUT_OF_RANGE':
      suggestions.push(
        {
          action: 'USE_Q1',
          label: 'Przejdź w Q1',
          params: { quarter: 1 },
        },
        {
          action: 'USE_Q4',
          label: 'Przejdź w Q4',
          params: { quarter: 4 },
        }
      );
      break;

    case 'INVALID_LIFE_EXPECTANCY':
    case 'SDZ_NOT_AVAILABLE':
      suggestions.push({
        action: 'USE_LATEST_SDZ',
        label: 'Użyj najnowszej dostępnej SDŻ',
      });
      break;

    default:
      // Generic suggestions for unknown errors
      suggestions.push({
        action: 'RESET_TO_DEFAULTS',
        label: 'Przywróć domyślne wartości',
      });
  }

  return {
    ...error,
    suggestions,
  };
}
