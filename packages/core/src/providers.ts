// Provider interfaces (no implementations)
// ----------------------------------------

export interface AnnualValorizationProvider {
  getAnnualIndex(year: number): { id: string; rate: number };
}

export interface QuarterlyValorizationProvider {
  getQuarterIndex(calendarYear: number, quarter: "Q1"|"Q2"|"Q3"|"Q4"): { id: string; rate: number };
  mapEntitlementQuarter(claimMonth: number): "Q1"|"Q2"|"Q3"|"Q4";
}

export interface InitialCapitalProvider {
  getInitial1999Index(): { id: string; rate: number };
  getAnnualIndexLikeContributions(year: number): { id: string; rate: number };
}

export interface LifeExpectancyProvider {
  getLifeExpectancyYears(gender: "M"|"F", claimDate: { year: number; month: number }): { id: string; years: number };
}

export interface MacroProjectionProvider {
  getWageGrowthFactor(fromYear: number, toYear: number): number;
  getCpiDiscountFactor(fromClaimYear: number, fromClaimMonth: number, toAnchorYear: number): number;
}

export interface ContributionRuleProvider {
  getContributionRate(): { id: string; rate: number };
  getAbsenceBounds(): { min: number; max: number; defaultValue: number };
}

export interface SubAccountProvider {
  valorize(balance: number, claimDate: { y: number; m: number }): { id: string; balance: number };
}

export interface ProviderBundle {
  annual: AnnualValorizationProvider;
  quarterly: QuarterlyValorizationProvider;
  initial: InitialCapitalProvider;
  life: LifeExpectancyProvider;
  macro: MacroProjectionProvider;
  contrib: ContributionRuleProvider;
  subAccount?: SubAccountProvider;
}
