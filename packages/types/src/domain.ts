/**
 * Domain enums, branded types, and value objects for ZUS Retirement Simulator
 * All types are opaque and not interchangeable
 */

// Enumerations
export type Gender = 'M' | 'F';
export type EntitlementQuarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type ProviderKind = 'DeterministicDemo' | 'OfficialTables';

// Branded types for type safety
export type Year = number & { readonly __brand: 'Year' };
export type Month = number & { readonly __brand: 'Month' };
export type CurrencyPLN = number & { readonly __brand: 'CurrencyPLN' };
export type Percent = number & { readonly __brand: 'Percent' };
export type Rate = number & { readonly __brand: 'Rate' };
export type TerytCode = string & { readonly __brand: 'TerytCode' };

// Value objects
export interface ClaimDateVO {
  year: Year;
  month: Month;
}

export interface AssumptionsVO {
  annualValorizationSetId: string;
  quarterlySetId: string;
  sdżTableId: string;
  cpiVintage: string;
  wageVintage: string;
  providerKind: ProviderKind;
}

export interface TrajectoryRowVO {
  year: number;
  annualWage: number;
  annualContribution: number;
  annualValorizationIndex: number;
  cumulativeCapitalAfterAnnual: number;
}

export interface FinalizationVO {
  quarterIndexId: string;
  compoundedResult: number;
}

// Constants
export const RETIREMENT_AGE_DEFAULTS = {
  M: 65,
  F: 60,
} as const;

export const CONTRIBUTION_RATE = 0.1952 as const;
