/**
 * composeBase
 * Sums capital components, ensures non-negativity, records IDs
 * - base = annual + quarterly + initial + subAccount
 *
 * SPEC_ENGINE.md: Section G
 * pipeline.md: Step 7
 */
import { FinalizationStep } from './quarterly-valorization';
import { ValorizedInitialCapital } from './initial-capital';

export interface BaseComposition {
  baseCapital: number;
  components: {
    contributions: number;
    initialCapital: number;
    subAccount?: number;
  };
}

export function composeBase(
  _annualCapital: number,
  finalization: FinalizationStep,
  initial: ValorizedInitialCapital,
  subAccount?: number
): BaseComposition {
  const contributions = finalization.resultingCapital;
  const initialCapital = initial.amount;
  const baseCapital = Math.max(0, contributions + initialCapital + (subAccount ?? 0));
  return {
    baseCapital,
    components: {
      contributions,
      initialCapital,
      ...(subAccount !== undefined ? { subAccount } : {}),
    },
  };
}
