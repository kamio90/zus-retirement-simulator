"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Domain enums, branded types, and value objects for ZUS Retirement Simulator
// -------------------------------------------------------------
// Enumerations
//   Gender: "M" | "F"
//   EntitlementQuarter: "Q1" | "Q2" | "Q3" | "Q4"
//   ProviderKind: "DeterministicDemo" | "OfficialTables"
//
// Branded types
//   Year (int), Month (1–12), CurrencyPLN (>=0), Percent (0..1), Rate (e.g. 0.1952), TerytCode (regex)
//
// Value objects
//   ClaimDateVO { year: Year; month: Month }
//   AssumptionsVO { annualValorizationSetId, quarterlySetId, sdżTableId, cpiVintage, wageVintage, providerKind }
//   TrajectoryRowVO { year, annualWage, annualContribution, annualValorizationIndex, cumulativeCapitalAfterAnnual }
//   FinalizationVO { quarterIndexId, compoundedResult }
//
// Constants (as types): retirement defaults by gender (M=65, F=60), contribution rate 19.52% (doc only)
