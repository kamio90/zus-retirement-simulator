/**
 * Provider Interfaces for ZUS Pension Engine
 *
 * These interfaces define the contract for data providers that supply
 * macroeconomic parameters, valorization indices, and actuarial tables
 * to the pension calculation engine.
 *
 * All providers must be deterministic and stateless.
 * No implementations in this file - only interface definitions.
 */

/**
 * Annual Valorization Provider
 *
 * Supplies annual valorization indices for capital accumulation.
 * Used in Step D of SPEC_ENGINE.md for valorizing contributions
 * made by 31 Jan of each year on 1 June using the index for year-1.
 */
export interface AnnualValorizationProvider {
  /**
   * Get the annual valorization index for a specific year
   * @param year - The year for which to retrieve the index
   * @returns Object containing index ID and rate (e.g., { id: 'ANN.2024', rate: 1.05 })
   */
  getAnnualIndex(year: number): { id: string; rate: number };
}

/**
 * Quarterly Valorization Provider
 *
 * Supplies quarterly valorization indices and quarter mapping logic.
 * Used in Step E of SPEC_ENGINE.md for valorizing contributions
 * after the last 31 Jan up to the claim month.
 */
export interface QuarterlyValorizationProvider {
  /**
   * Get the quarterly valorization index for a specific calendar year and quarter
   * @param calendarYear - The calendar year
   * @param quarter - The quarter (Q1/Q2/Q3/Q4)
   * @returns Object containing index ID and rate
   */
  getQuarterIndex(
    calendarYear: number,
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  ): { id: string; rate: number };

  /**
   * Map claim month to entitlement quarter per ZUS rules
   * Quarter mapping: Q1→Q3 prev year, Q2→Q4 prev year, Q3→Q1 curr year, Q4→Q2 curr year
   * @param claimMonth - Month of claim (1-12)
   * @returns Entitlement quarter
   */
  mapEntitlementQuarter(claimMonth: number): 'Q1' | 'Q2' | 'Q3' | 'Q4';
}

/**
 * Initial Capital Provider
 *
 * Supplies special indices for valorizing initial capital from 1999.
 * Used in Step F of SPEC_ENGINE.md.
 */
export interface InitialCapitalProvider {
  /**
   * Get the special 1999 initial capital index (applied on 1 June 2000)
   * @returns Object containing index ID and rate
   */
  getInitial1999Index(): { id: string; rate: number };

  /**
   * Get annual index for initial capital (same logic as regular contributions)
   * @param year - The year for which to retrieve the index
   * @returns Object containing index ID and rate
   */
  getAnnualIndexLikeContributions(year: number): { id: string; rate: number };
}

/**
 * Life Expectancy Provider
 *
 * Supplies life expectancy (SDŻ) values based on gender and claim date.
 * Used in Step H of SPEC_ENGINE.md for pension calculation.
 * Window logic: April-March of following year uses same table.
 */
export interface LifeExpectancyProvider {
  /**
   * Get life expectancy in years for pension calculation
   * @param gender - Gender ('M' for male, 'F' for female)
   * @param claimDate - Claim date with year and month
   * @returns Object containing table ID and life expectancy in years
   */
  getLifeExpectancyYears(
    gender: 'M' | 'F',
    claimDate: { year: number; month: number }
  ): { id: string; years: number };
}

/**
 * Macroeconomic Projection Provider
 *
 * Supplies wage growth factors and CPI discount factors for projections.
 * Used in Step B (wage projection) and Step H (real pension calculation).
 */
export interface MacroProjectionProvider {
  /**
   * Get wage growth factor between two years
   * @param fromYear - Starting year (anchor year)
   * @param toYear - Target year
   * @returns Growth factor (e.g., 1.15 for 15% cumulative growth)
   */
  getWageGrowthFactor(fromYear: number, toYear: number): number;

  /**
   * Get CPI discount factor for converting nominal to real values
   * @param fromClaimYear - Year of retirement claim
   * @param fromClaimMonth - Month of retirement claim
   * @param toAnchorYear - Anchor year for "today's money"
   * @returns Discount factor (e.g., 0.85 for 15% cumulative inflation)
   */
  getCpiDiscountFactor(fromClaimYear: number, fromClaimMonth: number, toAnchorYear: number): number;
}

/**
 * Contribution Rule Provider
 *
 * Supplies contribution rate and absence factor bounds.
 * Used in Step C (contribution calculation) and validation.
 */
export interface ContributionRuleProvider {
  /**
   * Get the contribution rate for pension contributions
   * @returns Object containing rule ID and rate (e.g., { id: 'ZUS_2024', rate: 0.1952 })
   */
  getContributionRate(): { id: string; rate: number };

  /**
   * Get valid bounds and default value for absence factor
   * @returns Object with min, max, and default absence factor values
   */
  getAbsenceBounds(): { min: number; max: number; defaultValue: number };
}

/**
 * Sub-Account Provider (Optional)
 *
 * Supplies valorization for optional sub-account balance (OFE transfers, etc.).
 * Used in Step G of SPEC_ENGINE.md if sub-account is present.
 */
export interface SubAccountProvider {
  /**
   * Valorize sub-account balance to claim date
   * @param balance - Initial sub-account balance
   * @param claimDate - Claim date for valorization
   * @returns Object containing valorization ID and final balance
   */
  valorize(balance: number, claimDate: { y: number; m: number }): { id: string; balance: number };
}

/**
 * Provider Bundle
 *
 * Aggregates all required providers for the pension engine.
 * SubAccount provider is optional.
 */
export interface ProviderBundle {
  annual: AnnualValorizationProvider;
  quarterly: QuarterlyValorizationProvider;
  initial: InitialCapitalProvider;
  life: LifeExpectancyProvider;
  macro: MacroProjectionProvider;
  contrib: ContributionRuleProvider;
  subAccount?: SubAccountProvider;
}
