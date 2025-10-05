/**
 * DeltaChip - Shows delta between baseline and current value
 * Used in KPI tiles for instant feedback
 */
interface DeltaChipProps {
  baselineValue: number;
  currentValue: number;
  format?: 'number' | 'percent' | 'currency';
  className?: string;
}

export function DeltaChip({
  baselineValue,
  currentValue,
  format = 'number',
  className = '',
}: DeltaChipProps): JSX.Element | null {
  const delta = currentValue - baselineValue;
  const percentChange = baselineValue !== 0 ? (delta / baselineValue) * 100 : 0;

  // Don't show if no change
  if (Math.abs(delta) < 0.01) {
    return null;
  }

  const isPositive = delta > 0;
  const bgColor = isPositive ? 'bg-green-100' : 'bg-red-100';
  const textColor = isPositive ? 'text-green-800' : 'text-red-800';
  const arrow = isPositive ? '↑' : '↓';

  const formatValue = (): string => {
    switch (format) {
      case 'currency':
        return `${Math.abs(delta).toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN`;
      case 'percent':
        return `${Math.abs(delta).toFixed(1)}%`;
      default:
        return `${Math.abs(delta).toLocaleString('pl-PL', { maximumFractionDigits: 0 })}`;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${bgColor} ${textColor} ${className}`}
      aria-label={`${isPositive ? 'Wzrost' : 'Spadek'} o ${formatValue()} (${Math.abs(percentChange).toFixed(1)}%)`}
    >
      <span aria-hidden="true">{arrow}</span>
      <span>
        {formatValue()} ({Math.abs(percentChange).toFixed(1)}%)
      </span>
    </span>
  );
}
