/**
 * valorizeInitialCapital
 * Valorizes initial capital with special 1999 index, then annual path.
 * - Applies INIT.1999 once, then annual indices for 2000+
 *
 * SPEC_ENGINE.md: Section F
 * pipeline.md: Step 5
 */
import { InitialCapitalProvider, AnnualValorizationProvider } from '../providers';
import { assertInitialCapital } from '../utils/assert';

export interface ValorizedInitialCapitalStep {
  year: number;
  indexId: string;
  amount: number;
}

export interface ValorizedInitialCapital {
  amount: number;
  steps: ValorizedInitialCapitalStep[];
}

export function valorizeInitialCapital(
  initialCapital: number | undefined,
  initialProvider: InitialCapitalProvider,
  annualProvider: AnnualValorizationProvider,
  entitlementYear: number
): ValorizedInitialCapital {
  if (!initialCapital || initialCapital <= 0) return { amount: 0, steps: [] };
  let amount = initialCapital;
  const steps: ValorizedInitialCapitalStep[] = [];
  // Apply special 1999 index
  const idx1999 = initialProvider.getInitial1999Index();
  assertInitialCapital(idx1999);
  amount *= idx1999.rate;
  steps.push({ year: 1999, indexId: idx1999.id, amount });
  // Apply annual indices for 2000 up to entitlementYear-1
  for (let y = 2000; y < entitlementYear; y++) {
    const idx = initialProvider.getAnnualIndexLikeContributions(y);
    amount *= idx.rate;
    steps.push({ year: y, indexId: idx.id, amount });
  }
  return { amount, steps };
}
